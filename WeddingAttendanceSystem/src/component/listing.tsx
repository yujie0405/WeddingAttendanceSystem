import type { Key, ReactNode } from "react";
export interface ListingColumn<T> {
  key: string;
  title: string;
  render: (item: T) => ReactNode;
}
type Props<T> = {
  items: readonly T[];
  getKey: (item: T) => Key;
  empty?: string;
} & (
  | { mode: "cards"; renderItem: (item: T) => ReactNode; className?: string }
  | { mode: "table"; columns: ListingColumn<T>[]; label: string }
);
export function Listing<T>(props: Props<T>) {
  if (!props.items.length)
    return <p className="admin-empty">{props.empty || "未找到匹配的记录。"}</p>;
  if (props.mode === "cards")
    return (
      <div className={props.className || "wedding-space-y-3"}>
        {props.items.map((item) => (
          <div key={props.getKey(item)}>{props.renderItem(item)}</div>
        ))}
      </div>
    );
  return (
    <div
      className="admin-table-scroll"
      tabIndex={0}
      role="region"
      aria-label={props.label}
    >
      <table className="admin-table">
        <thead>
          <tr>
            {props.columns.map((c) => (
              <th key={c.key} scope="col">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={props.getKey(item)}>
              {props.columns.map((c) => (
                <td key={c.key}>{c.render(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
