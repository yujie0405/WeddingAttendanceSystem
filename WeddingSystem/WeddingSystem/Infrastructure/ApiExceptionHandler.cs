using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace WeddingSystem.Infrastructure;

public sealed class ApiException(int status, string code, string message) : Exception(message)
{
    public int Status { get; } = status;
    public string Code { get; } = code;
}
public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception error, CancellationToken ct)
    {
        var (status, code, detail) = error switch
        {
            ApiException known => (known.Status, known.Code, known.Message),
            DbUpdateConcurrencyException => (409, "CONCURRENT_UPDATE", "The record changed. Refresh and try again."),
            DbUpdateException { InnerException: PostgresException { SqlState: "23503" or "23505" or "23514" } } =>
                (409, "DATA_CONFLICT", "The change conflicts with a reference, duplicate, or database constraint."),
            _ => (503, "SERVICE_UNAVAILABLE", "The operation could not be completed. Check server configuration and try again.")
        };
        logger.LogWarning("Request {RequestId} failed with {Code}; exception type {Type}",
            context.TraceIdentifier, code, error.GetType().Name);
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status, Title = code, Detail = detail,
            Extensions = { ["code"] = code, ["requestId"] = context.TraceIdentifier }
        }, ct);
        return true;
    }
}
