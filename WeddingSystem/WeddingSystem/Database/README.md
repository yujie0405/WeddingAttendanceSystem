Database password login
=======================

Registration and login use the backend API and `public."User"`. New accounts do not require Supabase Auth confirmation or receive signup emails.

1. Configure `ConnectionStrings:WeddingDb`, or the existing `ConnectionStrings:DefaultConnection` fallback, with a server-only PostgreSQL connection.
2. Apply `001_User.sql` followed by `002_DatabaseLogin.sql` to prepare the existing table. Do not run schema changes automatically at startup.
3. Configure a random, server-only `Authentication:SigningKey` of at least 64 bytes in .NET user-secrets for development or `Authentication__SigningKey` in production. Keep it stable across restarts and the same on every API instance. A private development key was generated locally during implementation; it is not in source control.
4. Restart the backend and frontend. Register with email, username, password (8-128 characters), and matching confirmation; then sign in with email/password.

`POST /api/auth/register` saves a salted ASP.NET Core Identity password hash in `User.Password`. It never stores the original password. Case-insensitive duplicate emails cannot overwrite an account. `POST /api/auth/login` reads the row by email and verifies that hash before issuing an eight-hour signed access token. Both endpoints have an IP-based limit of 15 requests per minute.

The frontend keeps its access token in tab session storage, sends it with API requests, and removes it on logout. Expired sessions require sign-in. Tokens remain valid until expiry even after local logout. For production, serve the frontend and backend over HTTPS. The browser never receives the signing key, PostgreSQL credentials, or password hashes.

Existing accounts with a null password and a linked `AuthUserId` are migrated on their first successful login: the backend verifies their password through Supabase Auth, checks the returned user ID matches the linked account, then stores a new hash in `User.Password`. Invalid login attempts cannot set that hash. Once a hash exists, all password checks use the User table. The original password cannot be recovered or backfilled without a successful sign-in. Legacy plaintext values are rejected.

Existing `UserID`, `Email`, `UserName`, and `createdDate` columns are retained. `AccountId` provides a UUID for signed API identity. `AuthUserId` is retained for legacy migration. The API expects a lowercase integer column `type` on `public."User"`. Set it to `1` for each administrator. The registration API writes `2` for new guest accounts.

`Supabase:Url` and `Supabase:Key` configure the SDK used for legacy password migration. New database accounts do not appear in Supabase Auth, but do appear in the public User table. The publishable key cannot replace the PostgreSQL connection string. Changing a password directly in Supabase Auth will not update an already migrated database password.

Checks: the .NET suite covers hashing, wrong passwords, duplicate accounts, legacy migration, JWT validation, API registration/login/profile retrieval, and guest/admin access using an isolated SQLite database. Deployment configuration and production password recovery require separate setup; no password reset flow is implemented here.

Seating tables
--------------

Apply `003_SeatingTables.sql` and then `004_ExistingTable.sql` to enable table settings on the existing `public."Table"`. The migration preserves any prior SeatingTable records and switches guest references to Table.TableNum. Existing table capacities start at the greater of 10 or their assigned party-size total. The backend database role needs SELECT/INSERT/DELETE on Table and usage on its identity sequence and `wedding_table_number_seq`; browser roles have no direct access.

The actual schema uses `id` (bigint identity), `TableNum` (smallint table number), `TableGustTagNum` (smallint guest-tag reference; note the spelling), and `created_at` (database timestamp default). A separate `Capacity` integer column is added for the template's seating-capacity controls. `TableGustTagNum` references Guest_Tag.id and never stores a capacity or assigned-person count. A shared database sequence allocates TableNum without reusing deleted numbers. SeatingTable is retained as a legacy copy for rollback and is no longer used by the backend. Apply the migration once; rerunning a legacy data-copy migration after deleting tables can restore legacy rows.

`GET /api/tables` provides capacity, optional guestTagId, and assigned-person counts for signed-in users. `POST /api/tables` requires an explicitly chosen `tableNumber` (integer 1-32767), `capacity`, and optional `guestTagId`; duplicate numbers return `TABLE_NUMBER_EXISTS` without changing existing tables. Table numbers are no longer allocated automatically by the app. The database sequence/default is retained for compatibility but the app always supplies a number. `POST /api/tables` and `DELETE /api/tables/{number}` require admin access. Assigned tables cannot be deleted, and guest create/edit validates the selected table exists. A tag assigned to a table cannot be deleted until the table is removed. Creating or editing a guest cannot exceed table capacity, based on the total number of people assigned. The admin table screen uses the template form/cards plus an optional guest-tag selector, and API-backed tag management uses the template summary and colored tag grid.

Guest entry
-----------

The verified live Guest column names are `id`, `GuestName`, `RelationId`, `WeddingSide`, `GuestNum`, `Table`, `CreatedDate`, `Angpau`, and `Attendance Status` (with a space). The API retains its existing `weddingSide`, `tableNumber`, and `attendanceStatusId` JSON names and maps them to these columns. Guest/status/tag IDs are bigint in PostgreSQL; relationship, side, party size, table, and attendance references use smallint conversions.

Add Guest loads relationships from Guest_Tag, attendance labels/IDs from AttendanceStatus, and table numbers from Table. Attendance defaults to ID 1 for new guests and retains the saved value while editing. Missing default status or guest tags produces guidance in the form. All selected references are checked by the backend before saving. Table assignment may be left unassigned.

Apply `005_GuestDefaults.sql` to set database defaults for new rows: attendance ID 1 and Angpau 0. Existing records are not rewritten. CreatedDate remains database-generated. General guest endpoints exclude financial values; nullable legacy Angpau values are read as zero by the separate admin money endpoints.
