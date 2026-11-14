# WeddingSystem backend: .NET 8 implementation and continuation prompt

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
    <add key="Authentication:Authority" value="https://PROJECT_REF.supabase.co/auth/v1" />
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

`Attendance:ArrivedStatusId` must be replaced by a positive integer from your lookup table, not the literal placeholder. Multiple administrators are comma-separated authenticated user UUIDs. Add more CORS origins with numbered keys (`Cors:AllowedOrigins:1`, etc.). XML-escape password characters such as `&` as `&amp;`; connection-string quoting rules also apply.

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

With the default blank settings, health and development Swagger work, while domain endpoints remain protected. Missing database configuration does not prevent the host from starting. Authorized domain requests require a working connection. The React demo login does not produce valid API credentials and has not been replaced in this change.

CORS allows configured origins; it is not authentication. A shared direct database login does not automatically assume the Supabase user's identity for RLS, and owner credentials can bypass RLS. API authorization and database grants must both be configured appropriately.

## Endpoints implemented

| Method and path | Access | Behavior |
| --- | --- | --- |
| `GET /health` | Public | Process health only; does not test PostgreSQL |
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

From the repository root:

```powershell
dotnet restore WeddingSystem/WeddingSystem.sln
dotnet build WeddingSystem/WeddingSystem.sln
dotnet test WeddingSystem/WeddingSystem.sln --no-restore
dotnet run --project WeddingSystem/WeddingSystem/WeddingSystem.csproj --launch-profile http
```

Development URLs: `http://localhost:5247/health`, `http://localhost:5247/swagger`. HTTPS profile: `https://localhost:7100`. Use `dotnet dev-certs https --trust` if needed for local HTTPS. HTTP is enabled for local development; non-development requests use HTTPS redirection. Configure HTTPS termination/forwarded headers deliberately for a reverse-proxy deployment.

The isolated test project exercises startup, missing/forged authentication, staff/admin separation, paging and money validation, required money input, Swagger routes, financial DTO exclusion, and offline PostgreSQL mapping. Tests override configuration with a deliberately unreachable database address and test-only JWT keys. They do not prove live database CRUD, references, defaults, decimal round-trips, or cross-device updates; those require a disposable configured PostgreSQL environment.

Publish with `dotnet publish WeddingSystem/WeddingSystem/WeddingSystem.csproj -c Release -o WeddingSystem/publish`. For IIS install the matching ASP.NET Core Hosting Bundle and check the published `web.config` hosting entries. Never publish development credentials or expose the Swagger UI publicly without a deliberate access policy.

## Continue implementation: prompt

Use this prompt for the next backend implementation step:

> Work in the existing WeddingSystem .NET 8 solution. Keep Controllers -> BLO -> DBO -> EF Core 8/Npgsql, with one scoped DbContext per request. Preserve centralized web.config connections/paths through the existing explicit reader and secure local/deployment overrides. First verify actual Supabase schema names, types, lookup IDs, and GuestNum semantics without modifying live records. Keep authentication and admin policies enabled. Use DTOs, reference validation, decimal money, generated IDs/dates, and stable errors. Do not create/seed/migrate the database automatically. Add live CRUD tests only against a disposable database. Extend schema deliberately for gift audit/history, family groups, multiple tags, capacities, and concurrency before claiming those frontend features work. Integrate React through real authentication and HTTP adapters only when the database contract is confirmed; preserve browser JSON backups. Build, run tests, start the API, and report exactly which checks passed and which external configuration is still required.

## References

- [Npgsql EF Core provider](https://www.npgsql.org/efcore/)
- [ASP.NET Core configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-8.0)
- [ASP.NET Core IIS web.config](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/web-config?view=aspnetcore-8.0)
- [Supabase PostgreSQL connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase JWT signing keys](https://supabase.com/docs/guides/auth/signing-keys)
- [Supabase OIDC discovery](https://supabase.com/docs/guides/auth/oauth-server/getting-started)
