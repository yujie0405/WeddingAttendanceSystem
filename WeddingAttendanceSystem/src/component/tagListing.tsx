import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { Tag } from "../types";
export function TagListingSelector({
  allTags,
  selectedTagIds,
  onChange,
}: {
  allTags: Tag[];
  selectedTagIds: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="d-flex flex-wrap wedding-gap-1-5">
      {allTags.map((tag) => {
        const selected = selectedTagIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            className={"tag-selector " + (selected ? "selected" : "")}
            aria-pressed={selected}
            onClick={() =>
              onChange(
                selected
                  ? selectedTagIds.filter((id) => id !== tag.id)
                  : [...selectedTagIds, tag.id],
              )
            }
          >
            <FontAwesomeIcon icon={selected ? faCheck : faPlus} /> {tag.name}
          </button>
        );
      })}
    </div>
  );
}
