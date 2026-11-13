import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useWedding } from "../../../hooks/useWedding";
import { DataTransfer } from "../../../component/DataTransfer";
export function Tags() {
  const { state, actions, run } = useWedding();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <section className="wedding-space-y-4">
        <h2 className="admin-section-title">全局标签管理</h2>
        <form
          className="d-flex wedding-gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            if (await run(() => actions.addTag(name), "已添加标签"))
              setName("");
            setBusy(false);
          }}
        >
          <input
            className="admin-input"
            aria-label="新增标签名称"
            placeholder="新增全局标签名称 (如：大学同学, VIP)"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="admin-primary-button"
            type="submit"
            disabled={busy}
          >
            添加标签
          </button>
        </form>
        <div className="wedding-grid wedding-grid-cols-2 wedding-md-grid-cols-3 wedding-gap-2">
          {state.tags.map((t) => (
            <div key={t.id} className={"managed-tag " + t.color}>
              <span>
                <FontAwesomeIcon icon={faTag} /> {t.name}
              </span>
              <button
                aria-label={`删除标签 ${t.name}`}
                className="wedding-text-red-600"
                onClick={() => {
                  if (confirm(`确定要删除标签 [${t.name}] 吗？`))
                    void run(() => actions.deleteTag(t.id), "已删除标签");
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          ))}
        </div>
      </section>
      <DataTransfer />
    </>
  );
}
