# WeddingSystem backend: .NET 8 implementation and continuation prompt

**Authentication update:** registration and login now use the `User.Password` hash through `/api/auth/register` and `/api/auth/login`. The API issues local signed tokens using server-only `Authentication:SigningKey`; it no longer accepts Supabase session tokens. Existing accounts with null hashes migrate only after successful Supabase password verification. New registrations do not send confirmation emails. The earlier Supabase frontend login instructions below are historical; use [database login setup](WeddingSystem/WeddingSystem/Database/README.md) for current authentication configuration.

The backend now lives in `WeddingSystem/WeddingSystem/`, with solution `WeddingSystem/WeddingSystem.sln`. It uses ASP.NET Core 8 controllers, EF Core 8, and the Npgsql PostgreSQL provider. This document replaces the previous .NET Framework 4.8/EF6 instructions. The existing React app remains separate.

The code provides guest creation/editing, lookup management, explicit attendance updates, attendance summaries, and administrator-only angpau total updates. Database integration is not verified until actual Supabase credentials and schema are configured. Nothing creates, seeds, drops, or migrates tables automatically.

## Architecture and folders

Keep one API project with logical layers:

```text
WeddingSystem/
|-- WeddingSystem.sln
|-- .gitignore
|-- WeddingSystem/
|   |-- Controllers/                 HTTP, authorization, request validation
|   |   |-- GuestsController.cs
|   |   |-- LookupsController.cs
|   |   `-- SummariesController.cs
|   |-- BLO/                         Business Logic Objects
|   |   |-- GuestBLO.cs
|   |   `-- LookupBLO.cs
|   |-- DBO/                         Database Objects / data access
|   |   |-- GuestDBO.cs
|   |   |-- LookupDBO.cs
|   |   `-- Context/WeddingDbContext.cs
|   |-- Models/
|   |   |-- Entities/Entities.cs
|   |   |-- Requests/Requests.cs
|   |   `-- Responses/Responses.cs
|   |-- Configuration/WebConfigSettings.cs
|   |-- Infrastructure/ApiExceptionHandler.cs
|   |-- Properties/launchSettings.json
|   |-- Program.cs                   Startup, dependency injection, middleware
|   |-- web.config                   DB connection, configurable paths and URLs
|   |-- appsettings.json             Framework logging/host settings
|   |-- appsettings.Development.json Development logging
|   |-- WeddingSystem.http           Manual request examples
|   `-- WeddingSystem.csproj
`-- WeddingSystem.Tests/             Isolated HTTP and ORM mapping checks
```

Request flow: **Controller -> BLO -> DBO -> EF Core DbContext -> Supabase PostgreSQL**.

- Controllers handle HTTP input/output and enforce endpoint access. They do not access EF or DBO directly.
- BLO enforces business policy and coordinates data operations. It does not run EF queries or return HTTP action results.
- DBO owns EF queries and persistence, returning records/projections to BLO. It does not reference controllers or BLO.
- All DBOs share one scoped context per request. Do not keep a static context or execute concurrent operations on one instance.
- General guest DTOs exclude financial amounts. Financial endpoints have their own DTOs and admin policy.

Concrete BLO/DBO classes use constructor injection. Interfaces can be added when substitution is useful; a generic repository and separate class-library projects are not required now.

## .NET 8 setup differences

The opened project is correctly a controller-based .NET 8 API (`Microsoft.NET.Sdk.Web`, `net8.0`). Use `ControllerBase`, `[ApiController]`, built-in dependency injection, and `Program.cs`.

Do not add `Global.asax`, `App_Start`, EF6, `EntityFramework6.Npgsql`, `System.Web.Http`, or old Framework package configuration. Use the EF Core/Npgsql 8.x references already in the project. Run on an installed .NET 8 runtime; keep the deployed runtime patched.

The WeatherForecast sample, unused Windows Dockerfile/container profile, and Visual Studio container-tools dependency have been removed. Swagger, HTTP/HTTPS/IIS Express profiles, user-secrets support, and application logging settings remain useful. Ignore `.vs`, `bin`, `obj`, `.user`, and local configuration files rather than deleting IDE state while Visual Studio is open.

## Supabase SDK configuration

The backend registers Supabase 8.12 through `AddSupabase` using `Supabase:Url` and `Supabase:Key` in `WeddingSystem/WeddingSystem/appsettings.json`. The SDK Auth client is used only for migrating existing null-password accounts. New registration and login use the User table; JWT validation uses the local issuer and signing key. The SDK does not replace `ConnectionStrings:WeddingDb` for EF Core queries. See [registration setup](WeddingSystem/WeddingSystem/Database/README.md) for the User table script.

## Configuration in web.config

Your preference for centralizing backend database connections, paths, and service addresses in `web.config` is retained. ASP.NET Core does not automatically read legacy `<connectionStrings>` and `<appSettings>` sections, so `Configuration/WebConfigSettings.cs` explicitly loads them into `IConfiguration` at startup. `Program.cs` invokes this reader before registering services.

The checked-in file contains placeholders. Supply real values locally, without committing credentials, in a sibling `web.Local.config` file with the same XML section shape, or use .NET user-secrets. `web.Local.config` is ignored by Git. This example is a template:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <connectionStrings>
    <add name="WeddingDb" providerName="Npgsql"
         connectionString="Host=POOLER_HOST;Port=5432;Database=postgres;Username=DATABASE_USER;Password=DATABASE_PASSWORD;SSL Mode=VerifyFull;Root Certificate=C:\Certificates\supabase-ca.crt;Pooling=true;Maximum Pool Size=10;Timeout=15;Command Timeout=30" />
  </connectionStrings>
  <appSettings>
    <add key="Cors:AllowedOrigins:0" value="http://localhost:5173" />
    <!-- Supabase:Url and Supabase:Key are configured in appsettings.json. -->
    <add key="Authentication:Audience" value="authenticated" />
    <add key="Authentication:AdminUserIds" value="ADMIN_USER_UUID" />
    <add key="Attendance:ArrivedStatusId" value="ACTUAL_ARRIVED_STATUS_ID" />
    <add key="Paths:Export" value="App_Data/Exports" />
    <add key="Paths:Import" value="App_Data/Imports" />
    <add key="Paths:Logs" value="App_Data/Logs" />
  </appSettings>
</configuration>
```

Use the exact host, port, database user, and database password shown by the Supabase Connect dialog. An IPv4-only development host can use the session pooler on port 5432. Verify the TLS certificate using the appropriate CA/trust configuration; do not disable certificate validation. This is a PostgreSQL login, not an anon/publishable API key. Tune pool size to the database connection budget.

`Attendance:ArrivedStatusId` accepts a positive integer from your lookup table. Use `0` or omit the setting to detect a single matching status labeled Arrived, Attended, Checked in, Checked-in, 已到, 已到场, or 已签到. For custom labels or multiple matches, set the actual arrived status ID. Multiple administrators are comma-separated authenticated user UUIDs. Add more CORS origins with numbered keys (`Cors:AllowedOrigins:1`, etc.). XML-escape password characters such as `&` as `&amp;`; connection-string quoting rules also apply.

Configuration precedence, lowest to highest:

1. `web.config`, followed by optional `web.Local.config` overrides.
2. ASP.NET Core defaults: `appsettings.json`, environment-specific JSON, development user-secrets, environment variables, and command-line values.

Use `builder.Configuration.GetConnectionString("WeddingDb")` for the connection and `IConfiguration` for named settings. Existing JSON files intentionally contain no competing database/path settings. User-secrets example from the API directory:

```powershell
dotnet user-secrets set "ConnectionStrings:WeddingDb" "YOUR_NPGSQL_CONNECTION_STRING"
```

Do not paste secrets into chat or logs. Production can supply `ConnectionStrings__WeddingDb` as an environment variable or securely populate the deployed `web.config`. Use a restricted database login and protect deployed configuration. Changing XML settings requires restarting the API. `web.Local.config` is a local override, not a deployment secret-distribution mechanism; exclude it from published output.

The `Paths` keys reserve locations for future server file operations. They do not create directories or implement server import/export/file logging. Resolve relative paths against `IHostEnvironment.ContentRootPath` when those features are added. Allow only intended locations and give the process the required permissions.

The `<system.webServer>` section in `web.config` is for IIS hosting and is separate from application configuration. `dotnet publish` handles ASP.NET Core hosting entries. There are no Framework `Web.Debug.config`/`Web.Release.config` transforms in this project. IIS HTTPS bindings and launch-profile ports are configured by the host, not by arbitrary app-settings keys.

## Database contract: inspect before connecting

Mappings assume schema `public`, exact mixed-case names, generated integer IDs, non-null timestamps with `now()` defaults, and the fields below. PostgreSQL quoted case matters. Check your existing Supabase definitions; the supplied column list alone does not establish nullability, lengths, defaults, or constraints.

| Table | Columns and proposed types |
| --- | --- |
| `AttendanceStatus` | `id integer PK`, `Status varchar(50)`, `CreatedDate timestamptz default now()` |
| `Guest_Tag` | `id integer PK`, `TagName varchar(100)`, `CreatedDate timestamptz default now()` |
| `Guest` | `id integer PK`, `GuestName varchar(150)`, `RelationId integer`, `WeddingSide integer`, `GuestNum integer`, `AttendanceStatus integer`, `Table integer null`, `Angpau numeric(12,2)`, `CreatedDate timestamptz default now()` |

Assumptions: `RelationId` references `Guest_Tag.id`; `AttendanceStatus` references `AttendanceStatus.id`; `WeddingSide` is 1=groom, 2=bride; `GuestNum` is party size; `Table` is a table number, not a table-record foreign key. Confirm these conventions. `CreatedDate` is a creation timestamp, not an arrival timestamp. C# uses `decimal` for money and UTC `DateTime` for `timestamptz`.

Read-only schema inspection query:

```sql
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and lower(table_name) in ('attendancestatus', 'guest_tag', 'guest')
order by table_name, ordinal_position;
```

Inspect actual lookup IDs and primary/foreign keys too. Enforce positive party size, positive or null table number, side values 1/2, nonnegative angpau, and restricted lookup deletes in the database after reviewing existing records. EF mappings do not install constraints into an existing database. Do not run `EnsureCreated`, automatic migrations, destructive SQL, or automatic seeding against your wedding database.

## Authentication and access

Endpoints use JWT bearer authentication. Configure a Supabase Auth issuer with asymmetric signing keys and working OIDC discovery/public JWKS; confirm the project's `auth/v1/.well-known/openid-configuration` endpoint is available. Signature, issuer, audience, and expiry validation remain enabled. Legacy HS256 projects need a deliberate alternative integration; do not disable validation or use an anon/service key as a user's access token.

All valid signed-in users of the configured issuer are treated as staff. Restrict account provisioning to intended reception staff (for example, invitation-only registration). Users listed by UUID in the server-controlled `Authentication:AdminUserIds` setting additionally satisfy the Admin policy. A username containing `admin`, user metadata, or a frontend-selected role grants no permissions.

With the default blank settings, health and development Swagger work, while domain endpoints remain protected. Missing database configuration does not prevent the host from starting. Authorized domain requests require a working connection. The connected React login now uses Supabase Auth; the old demo login is available only with explicit `VITE_DATA_SOURCE=local`.

CORS allows configured origins; it is not authentication. A shared direct database login does not automatically assume the Supabase user's identity for RLS, and owner credentials can bypass RLS. API authorization and database grants must both be configured appropriately.

### Swagger Authorize and obtaining a user access token

Swagger uses the OpenAPI `Bearer` definition (`type: http`, `scheme: bearer`, `bearerFormat: JWT`). `SwaggerBearerSecurityFilter` adds a matching operation-level requirement to endpoints marked with authorization metadata, including `GET /api/guest-tags`. This documents existing authorization; it does not replace or bypass `[Authorize]`. Public health has no Swagger security requirement.

1. Restart the API and refresh `/swagger/index.html` so the browser loads the current OpenAPI document.
2. Click **Authorize**, paste only the user session's `access_token` value, then click **Authorize** and **Close**. Do not enter a `Bearer ` prefix yourself; HTTP Bearer handling adds it.
3. Expand `GET /api/guest-tags`, select **Try it out**, then **Execute**.
4. The generated request must include `Authorization: Bearer <access_token>`. Check the request headers locally; do not share curl output, screenshots, or logs containing the actual value. Authorization is intentionally not persisted across page reloads, so authorize again after refreshing.

**The connected frontend now implements real Supabase login.** Configure its `.env`, then sign in with your Supabase email/password account. `AuthProvider.tsx` uses the Supabase SDK for sign-in, session persistence, automatic refresh, and local sign-out. The API does not issue its own tokens or provide a password-login endpoint; it validates Supabase tokens. `GET /api/auth/me` returns the authenticated user's ID, display identity, and staff/admin role using the existing server Admin policy. The frontend never derives that role from editable user metadata. A PostgreSQL connection succeeding does not create a user session, and Swagger's Authorize button still accepts an existing token rather than performing login.

For manual Swagger testing, use an existing, authorized Supabase Auth email/password user in the **same project configured as the API issuer**. Create/invite that user through your Supabase Auth administration if needed; your three domain tables do not create Auth users. The connected frontend calls `signInWithPassword({ email, password })`, whose session contains `data.session.access_token`. Do not print the session or token in the console.

Alternatively, in a local API client such as Postman, send `POST https://PROJECT_REF.supabase.co/auth/v1/token?grant_type=password` with `Content-Type: application/json`, an `apikey` header containing the project's publishable/anon key, and a JSON body containing the user's `email` and `password`. Read the returned `access_token` privately and enter it in Swagger. Do not commit the request body, export/share response tokens, or put secrets in shell history. A user must have a valid password and satisfy the project's email confirmation/sign-in policy.

Do not use the refresh token, anon/publishable key, service-role key, database password, or a self-created unsigned JWT as the Swagger Bearer token. Configure `Supabase:Url` and `Authentication:Audience` to match the token issuer/audience and verify OIDC discovery/signing-key compatibility. Missing/expired/mismatched tokens return 401; an authenticated user without a required admin permission returns 403. The connected frontend attaches current user tokens to .NET API requests and retries once after an SDK session refresh on 401. Swagger requires you to enter a fresh token yourself when it expires.

Browser regression verification uses a synthetic value entered through the actual Authorize dialog. It inspects the generated header and fulfills the guest-tags request locally, without real credentials or a database operation. With temporary Playwright installed in `WeddingSystem/.browser-tools` and a development server at port 5252, run `node WeddingSystem/WeddingSystem.Tests/swagger-bearer.cjs`. The normal .NET suite also checks the generated OpenAPI scheme and guest-tags security requirement.

References: [Supabase password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [Supabase sessions](https://supabase.com/docs/guides/auth/sessions), and [OpenAPI Bearer authentication](https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/).

## Endpoints implemented

| Method and path | Access | Behavior |
| --- | --- | --- |
| `GET /health` | Public | Process health only; does not test PostgreSQL |
| `GET /api/auth/me` | Authenticated | Identity and role from server authorization; no database dependency |
| `GET /api/attendance-statuses` | Staff/admin | Actual lookup IDs and names |
| `GET /api/guest-tags` | Staff/admin | Relationship lookups |
| `POST /api/guest-tags` | Admin | Add a relationship |
| `PUT /api/guest-tags/{id}` | Admin | Rename a relationship |
| `DELETE /api/guest-tags/{id}` | Admin | Delete only when unreferenced |
| `GET /api/guests` | Staff/admin | Search/filter/paginate nonfinancial guest DTOs |
| `GET /api/guests/{id}` | Staff/admin | Guest details without angpau |
| `POST /api/guests` | Admin | Create guest with generated ID/date and zero angpau |
| `PUT /api/guests/{id}` | Admin | Edit guest details without changing money |
| `PUT /api/guests/{id}/attendance` | Staff/admin | Set an explicit status ID |
| `GET /api/summary/attendance` | Staff/admin | Record counts and party-size totals |
| `GET /api/admin/guests/{id}/angpau` | Admin | Read one guest's current total |
| `PUT /api/admin/guests/{id}/angpau` | Admin | Replace the total; does not add a gift |
| `GET /api/admin/summary/angpau` | Admin | Total RM across guest rows |

Filters: `search`, `weddingSide`, `attendanceStatusId`, `relationId`, `tableNumber`, `page`, `pageSize`. Page size is 1-100, default 20. Search matches guest-name substrings or a numeric table number; no family-name search exists in these tables. Filters run before pagination and results are ordered by ID.

Creation and full guest update use the same input shape:

```json
{
  "guestName": "Alex Tan",
  "relationId": 1,
  "weddingSide": 1,
  "guestNum": 1,
  "attendanceStatusId": 1,
  "tableNumber": 5
}
```

Lookup IDs are examples only. Attendance input is `{ "attendanceStatusId": 2 }`. Angpau input is `{ "amount": 200.00 }`; omitted, negative, over-limit, or more-than-two-decimal amounts are rejected. An explicit zero total is allowed. Financial updates replace the stored total and are separate from guest editing. `WeddingSystem.http` contains runnable request examples once you supply an access token.

Errors use HTTP 400/401/403/404/409/503. Business errors include stable `code` and `requestId` fields; model-binding errors use ASP.NET Core validation problem details. Do not assume all response bodies have one shape. Database exception details are not intentionally included in API responses. No guest deletion endpoint is exposed.

## Current schema limitations

The three tables do not represent family membership, multiple tags per guest, table capacities/reservations, seat numbers, inactive status, check-in timestamps, or gift history/void reasons/recorders. Do not invent these values to preserve existing screens.

`Guest.Angpau` is one editable total. It cannot safely implement the existing frontend's multiple-gift and voiding audit workflow. Add a gift transaction table before supporting those behaviors. Attendance people counts sum `GuestNum`; they are not simply row counts.

Guest edits currently use last-write-wins. Targeted attendance/money updates change only their own column, and ordinary guest editing does not change `Angpau`, but there is no version token for stale edits. Add optimistic concurrency before using concurrent editing for financial operations in production.

## Run and verify

### Connect the frontend through .env

The frontend `.env` is ignored by Git; `WeddingAttendanceSystem/.env.example` is the template. Set `VITE_DATA_SOURCE=api`, `VITE_API_BASE_URL=http://localhost:5247/api`, `VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co`, and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project's public publishable/anon key, then restart Vite. These are browser-visible configuration values. Database passwords and service-role secrets remain backend-only in server configuration.

Start the API with the `http` launch profile and Vite with `npm run dev` from the frontend directory. Open the Vite `localhost` URL so it matches `Cors:AllowedOrigins:0` in backend configuration; add the exact origin if using a different host/port. Do not disable authentication or CORS to fix connection errors. HTTPS API URLs require a trusted certificate and an HTTPS backend profile. Production HTTPS frontends must use an HTTPS API URL.

Connected screens support guest creation/editing, party size, one relationship, table numbers, attendance statuses using actual lookup IDs, server pagination/filters, tag management, and admin-only angpau total replacement. No table capacities, family gifts, multi-tag editing, financial history/voiding, or JSON migration is fabricated. Use `VITE_DATA_SOURCE=local` explicitly to open the original offline demo; it preserves its independent browser dataset.

The browser regression script `WeddingAttendanceSystem/tests/backend-integration.cjs` uses synthetic Supabase and API responses to check sign-in, Bearer headers, numeric request mappings, pagination, guest edits, money, session refresh, staff restrictions, and failure/retry behavior. It requires the temporary Playwright/Edge tooling described in the tests guide and a Vite server on 5174 started with synthetic auth/API addresses (see that guide). It never uses live accounts or a live database. The .NET suite validates `/api/auth/me` against signed test users and the real server policy. Live authentication/database CRUD still require your actual `.env` and server settings.

From the repository root:

```powershell
dotnet restore WeddingSystem/WeddingSystem.sln
dotnet build WeddingSystem/WeddingSystem.sln
dotnet test WeddingSystem/WeddingSystem.sln --no-restore
dotnet run --project WeddingSystem/WeddingSystem/WeddingSystem.csproj --launch-profile http
```

Development URLs: `http://localhost:5247/health`, `http://localhost:5247/swagger`. HTTPS profile: `https://localhost:7100`. Use `dotnet dev-certs https --trust` if needed for local HTTPS. HTTP is enabled for local development; non-development requests use HTTPS redirection. Configure HTTPS termination/forwarded headers deliberately for a reverse-proxy deployment.

In Development only, `Program.cs` resolves the registered EF Core `WeddingDbContext` inside an asynchronous dependency-injection scope and executes the read-only `SELECT 1` query, with a 10-second cancellation deadline. Only after success does it print exactly `Connection success`. Failure prints `Connection failed`, followed by a fixed, sanitized diagnostic message, and API startup continues. It does not print raw exception messages or connection strings, modify tables, or run migrations. This check confirms connectivity, not table mappings, permissions for guest updates, or ongoing availability; `/health` remains process health only. Production does not execute this startup check.

The isolated test project exercises startup, missing/forged authentication, staff/admin separation, paging and money validation, required money input, Swagger routes, financial DTO exclusion, and offline PostgreSQL mapping. Tests override configuration with a deliberately unreachable database address and test-only JWT keys. They do not prove live database CRUD, references, defaults, decimal round-trips, or cross-device updates; those require a disposable configured PostgreSQL environment.

Publish with `dotnet publish WeddingSystem/WeddingSystem/WeddingSystem.csproj -c Release -o WeddingSystem/publish`. For IIS install the matching ASP.NET Core Hosting Bundle and check the published `web.config` hosting entries. Never publish development credentials or expose the Swagger UI publicly without a deliberate access policy.

## Continue implementation: prompt

Use this prompt for the next backend implementation step:

> Work in the existing WeddingSystem .NET 8 solution and the connected React frontend. Keep Controllers -> BLO -> DBO -> EF Core 8/Npgsql, with one scoped DbContext per request. Preserve centralized backend web.config connections/paths and frontend .env public settings. Verify actual Supabase schema names, types, lookup IDs, and GuestNum semantics without modifying live records. Preserve Supabase SDK authentication, server-controlled /api/auth/me roles, Bearer HTTP requests, and API failure handling. Use DTOs, reference validation, decimal money, generated IDs/dates, and stable errors. Do not create/seed/migrate the database automatically. Add live CRUD tests only against a disposable database. Extend schema deliberately for gift audit/history, family groups, multiple tags, capacities, and concurrency before claiming those frontend features work. Preserve independent local-demo browser records and never fall back to them on API failure. Build, run relevant tests, and report exactly which checks passed and which external configuration is still required.

## References

- [Npgsql EF Core provider](https://www.npgsql.org/efcore/)
- [ASP.NET Core configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-8.0)
- [ASP.NET Core IIS web.config](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config?view=aspnetcore-8.0)
- [Supabase PostgreSQL connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase JWT signing keys](https://supabase.com/docs/guides/auth/signing-keys)
- [Supabase OIDC discovery](https://supabase.com/docs/guides/auth/oauth-server/getting-started)
