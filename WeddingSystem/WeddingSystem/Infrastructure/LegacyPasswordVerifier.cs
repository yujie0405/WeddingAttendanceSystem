using Supabase.Gotrue.Exceptions;

namespace WeddingSystem.Infrastructure;

public interface ILegacyPasswordVerifier
{
    Task<bool> Verify(string email, string password, Guid authId, CancellationToken cancellationToken);
}

public sealed class LegacyPasswordVerifier(Supabase.Client supabase) : ILegacyPasswordVerifier
{
    public async Task<bool> Verify(string email, string password, Guid authId, CancellationToken cancellationToken)
    {
        try
        {
            var session = await supabase.Auth.SignIn(email, password).WaitAsync(cancellationToken);
            return Guid.TryParse(session?.User?.Id, out var subject) && subject == authId;
        }
        catch (GotrueException) { return false; }
    }
}
