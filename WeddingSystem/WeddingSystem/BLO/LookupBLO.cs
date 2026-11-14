using WeddingSystem.DBO;
using WeddingSystem.Infrastructure;
using WeddingSystem.Models.Entities;
using WeddingSystem.Models.Responses;

namespace WeddingSystem.BLO;

public sealed class LookupBLO(LookupDBO lookups)
{
    public Task<IReadOnlyList<LookupResponse>> TagsAsync(CancellationToken ct) => lookups.TagsAsync(ct);
    public Task<IReadOnlyList<LookupResponse>> StatusesAsync(CancellationToken ct) => lookups.StatusesAsync(ct);
    public async Task<LookupResponse> SaveTagAsync(int? id, string name, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ApiException(400, "INVALID_TAG", "Enter a tag name.");
        var tag = id.HasValue ? await lookups.FindTagAsync(id.Value, ct)
            ?? throw new ApiException(404, "TAG_NOT_FOUND", "Tag not found.") : new GuestTagEntity();
        tag.TagName = name.Trim();
        if (!id.HasValue) lookups.AddTag(tag);
        await lookups.SaveAsync(ct);
        return new(tag.Id, tag.TagName);
    }
    public async Task DeleteTagAsync(int id, CancellationToken ct)
    {
        var tag = await lookups.FindTagAsync(id, ct) ?? throw new ApiException(404, "TAG_NOT_FOUND", "Tag not found.");
        if (await lookups.TagUsedAsync(id, ct)) throw new ApiException(409, "TAG_IN_USE", "Reassign guests before deleting this tag.");
        lookups.DeleteTag(tag);
        await lookups.SaveAsync(ct);
    }
}
