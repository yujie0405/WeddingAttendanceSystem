import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useWedding } from "../../../hooks/useWedding";
import { usePagination } from "../../../hooks/usePagination";
import { tableUsage } from "../../../utils/selectors";
import { Listing } from "../../../component/listing";
import { Pagination } from "../../../component/pagination";
export function Tables() {
  const { state, actions, run } = useWedding();
  const page = usePagination(state.tables, 10);
  const [capacity, setCapacity] = useState("10");
  const [busy, setBusy] = useState(false);
  return (
    <section className="wedding-space-y-4">
      <h2 className="admin-section-title">桌位设置</h2>
      <form
        className="admin-table-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          setBusy(true);
          if (await run(() => actions.addTable(Number(capacity)), "已添加桌位"))
            page.setPage(Math.ceil((state.tables.length + 1) / 10));
          setBusy(false);
        }}
      >
        <label className="admin-label">
          下一桌号
          <input
            className="admin-input"
            readOnly
            value={String(state.nextTableNumber).padStart(2, "0") + "（自动）"}
          />
        </label>
        <label className="admin-label">
          容纳人数
          <input
            className="admin-input"
            type="number"
            min="1"
            step="1"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </label>
        <button className="admin-primary-button" type="submit" disabled={busy}>
          <FontAwesomeIcon icon={faPlus} /> 添加桌位
        </button>
      </form>
      <p className="admin-help">
        编号自动递增；删除不会改变其他桌号，也不会自动重用已删除的编号。
      </p>
      <Listing
        mode="cards"
        className="admin-table-grid"
        items={page.items}
        getKey={(t) => t.id}
        empty="暂无桌位，请先添加桌位。"
        renderItem={(t) => {
          const usage = tableUsage(state, t.tableNo);
          return (
            <article className="admin-table-card" data-table={t.tableNo}>
              <div>
                <h3 className="admin-table-number">
                  <FontAwesomeIcon icon={faChair} /> {t.tableNo} 桌
                </h3>
                <p className="admin-subtext">容量：{t.capacity} 人</p>
                <p className="admin-subtext">已安排：{usage.count} 人</p>
              </div>
              <div className="admin-table-actions">
                <button
                  className="admin-danger-button"
                  disabled={usage.blocked}
                  aria-label={`删除 ${t.tableNo} 桌`}
                  onClick={() => {
                    if (
                      confirm(
                        `确定要删除 ${t.tableNo} 桌吗？其他桌号不会改变。`,
                      )
                    )
                      void run(() => actions.deleteTable(t.id), "已删除桌位");
                  }}
                >
                  <FontAwesomeIcon icon={faTrashCan} /> 删除
                </button>
                <p className="admin-help">
                  {usage.blocked ? "请先重新安排宾客或家庭桌位" : "空桌可删除"}
                </p>
              </div>
            </article>
          );
        }}
      />
      <Pagination {...page} />
    </section>
  );
}
