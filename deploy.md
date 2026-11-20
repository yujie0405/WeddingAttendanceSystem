Please add Render Docker deployment support to my existing .NET backend while preserving the ability to run it locally in Visual Studio.

Project context:
- ASP.NET Core targeting .NET 8.
- Expected project path: WeddingSystem/WeddingSystem/WeddingSystem.csproj. Confirm the actual path first.
- PostgreSQL / Npgsql with a Supabase-hosted database.
- A separate React + Vite frontend will be deployed on Vercel.
- Make the necessary file changes directly, rather than only suggesting changes.

Inspect the existing code and configuration before implementing the following:

1. Add a multi-stage Dockerfile beside the backend .csproj:
   - Use the .NET 8 SDK for building and the ASP.NET 8 runtime for execution.
   - Explicitly restore and publish WeddingSystem.csproj.
   - Publish in Release configuration.
   - Listen on 0.0.0.0:8080.
   - Use dotnet WeddingSystem.dll as the entry point.
   - Use the backend project directory as the Docker build context.
   - If there are project references outside that directory, adjust the build context and COPY paths accordingly.

2. Add .dockerignore:
   - Exclude bin, obj, .vs, .git, local .env files, web.Local.config, and other local secret files.
   - Check that published output does not contain local passwords or secrets.
   - Preserve non-sensitive configuration required by the application.

3. Verify that production configuration can be provided through environment variables:
   - ConnectionStrings__WeddingDb
   - Supabase__Url
   - Supabase__Key
   - Authentication__SigningKey
   - Authentication__AdminEmails
   - Cors__AllowedOrigins__0
   - ASPNETCORE_ENVIRONMENT
   - ASPNETCORE_URLS

   Reuse the existing configuration names and behavior.
   Do not introduce a parallel configuration system.
   Never hardcode real secrets in source code, Dockerfiles, or committed files.

4. Review Render reverse proxy compatibility:
   - Handle external HTTPS with internal container HTTP correctly.
   - Check forwarded headers, middleware ordering, and HTTPS redirection.
   - Account for the behavior of the installed ASP.NET Core patch version.
   - Do not unconditionally trust forwarded headers from arbitrary sources.
   - Document any required platform environment settings.

5. Review CORS:
   - Reuse the existing Cors:AllowedOrigins configuration.
   - Allow the specific Vercel production origin through environment configuration.
   - Do not use AllowAnyOrigin.
   - Preserve local development settings.

6. Preserve or add an anonymous GET /health endpoint:
   - Return a simple service status.
   - Do not expose secrets or connection strings.
   - Document whether it checks database connectivity.

7. Add DEPLOY_RENDER.md in the backend directory, documenting:
   - Render Root Directory.
   - Dockerfile Path and Docker Build Context.
   - Whether Docker Command should remain empty.
   - Port 8080 configuration.
   - Health Check Path.
   - Required environment variables with placeholder examples.
   - An Npgsql connection string example for Supabase session pooling.
   - The frontend API base URL format: https://BACKEND_DOMAIN/api.
   - The existing database initialization or upgrade process.

8. Inspect the existing Database SQL scripts:
   - Determine whether they initialize an empty database or upgrade an existing database.
   - Clearly identify anything missing for empty-database initialization.
   - Do not execute SQL, modify the hosted database, or automatically run migrations.

Constraints:
- Preserve the existing Visual Studio local launch configuration.
- Do not change business logic, authentication behavior, or database schema.
- Do not push to Git or deploy to cloud services.
- Do not print existing local secrets.
- Keep changes focused and minimal.

After implementation, validate with dotnet build and dotnet publish where available.
If Docker is installed and running, also verify the image builds; otherwise, explicitly state that Docker validation was not performed.

Finally, summarize:
- Files changed.
- Validation results.
- Exact settings I need to enter manually in Render.