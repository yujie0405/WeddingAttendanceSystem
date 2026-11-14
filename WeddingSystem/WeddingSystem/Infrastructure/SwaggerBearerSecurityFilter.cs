using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace WeddingSystem.Infrastructure;

public sealed class SwaggerBearerSecurityFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var metadata = context.ApiDescription.ActionDescriptor.EndpointMetadata;
        var attributes = context.MethodInfo.GetCustomAttributes(true)
            .Concat(context.MethodInfo.DeclaringType?.GetCustomAttributes(true) ?? []);
        var authorizationMetadata = metadata.Concat(attributes).ToArray();
        if (authorizationMetadata.OfType<IAllowAnonymous>().Any() ||
            !authorizationMetadata.OfType<IAuthorizeData>().Any())
        {
            operation.Security = [];
            return;
        }

        operation.Security =
        [
            new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                }] = Array.Empty<string>()
            }
        ];
        operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Missing, expired, or invalid user access token." });
        operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Authenticated user lacks the required permission." });
    }
}
