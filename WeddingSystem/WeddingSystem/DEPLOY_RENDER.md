# Deploy WeddingSystem to Render

Create a Render **Web Service** with the **Docker** runtime. The backend targets .NET 8 and builds from its project directory.

| Render dashboard field | Value |
| --- | --- |
| Root Directory | `WeddingSystem/WeddingSystem` |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context Directory | `.` |
| Docker Command | Leave blank |
| Health Check Path | `/health` |

The Dockerfile binds Kestrel to all interfaces on HTTP port 8080 and starts `dotnet WeddingSystem.dll`. The Docker paths above are relative to the dashboard's Root Directory. [Render monorepo settings](https://render.com/docs/monorepo-support)

## Render environment variables

| Name | Value |
| --- | --- |
| `PORT` | `8080` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://0.0.0.0:8080` |
| `ConnectionStrings__WeddingDb` | Npgsql connection string from the example below |
| `Supabase__Url` | `https://PROJECT_REF.supabase.co` |
| `Supabase__Key` | `SUPABASE_PUBLISHABLE_KEY` for legacy Supabase Auth login |
| `Authentication__SigningKey` | A random secret of at least 64 UTF-8 bytes, kept stable across restarts and instances |
| `Cors__AllowedOrigins__0` | `https://YOUR_FRONTEND.vercel.app` using the exact production origin, with no path or trailing slash |

In Supabase, open **Connect → Session pooler** and copy the host, database name, and username into the Npgsql format below. Use the database password for that database role and quote the password if it contains a semicolon. [Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres)

```text
Host=POOLER_HOST.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.PROJECT_REF;Password=DATABASE_PASSWORD;SSL Mode=Require
```

Enter secrets through the Render environment settings. Local Visual Studio launches continue to use the existing launch profiles and local configuration. The production CORS environment value overrides the default origin at index zero.

## HTTPS and health checks

Render redirects public HTTP to HTTPS at its load balancer, terminates TLS, and forwards HTTP to Kestrel. The backend uses Render's automatic `RENDER=true` marker to skip its own HTTPS redirect on Render. [Render web services](https://render.com/docs/web-services) · [Render default environment variables](https://render.com/docs/environment-variables)

Leave `ASPNETCORE_FORWARDEDHEADERS_ENABLED` unset. The application does not consume forwarded headers on Render. ASP.NET Core 8.0.17 and later ignore forwarded headers from unknown proxies when the middleware is configured with trusted proxies. If the Render ingress address is shared across requests, the existing IP-based login and registration rate limit can share a bucket across clients. [ASP.NET Core forwarded headers change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/8/forwarded-headers-unknown-proxies)

Anonymous `GET /health` returns HTTP 200 with the service name and status. It checks that the API responds and performs no PostgreSQL connectivity check.

In Vercel, set `VITE_API_BASE_URL` to `https://BACKEND_DOMAIN/api`, for example `https://YOUR_SERVICE.onrender.com/api`.

## Database setup

The checked-in SQL is an upgrade sequence for an existing Supabase database. For a new database, first restore a compatible baseline schema and lookup data. The repository lacks baseline definitions for `public."Guest"`, `public."Guest_Tag"`, `public."AttendanceStatus"`, and `public."Table"`. The attendance lookup must include ID 1, and guest entry requires usable guest tags. The user scripts also depend on Supabase's `auth.users` and roles.

For an existing baseline, apply only pending scripts manually in numeric order. `001_User.sql` can create or extend the User table on Supabase. `002_DatabaseLogin.sql` upgrades it for database passwords. `003_SeatingTables.sql` creates legacy SeatingTable records from existing guests, and `004_ExistingTable.sql` moves those assignments to the existing Table schema. `005_GuestDefaults.sql` sets defaults on the existing Guest table. See [Database/README.md](Database/README.md) for the upgrade details. The API does not apply these scripts at startup.
