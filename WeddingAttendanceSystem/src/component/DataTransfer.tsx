import { useRef } from "react";
import { useWedding } from "../hooks/useWedding";
import { normalizeData } from "../api/migrations";
export function DataTransfer() {
  const { state, actions, run } = useWedding();
  const input = useRef<HTMLInputElement>(null);
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ data: state }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-data.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <section className="admin-section">
      <h2 className="admin-section-title">数据备份与导入</h2>
      <p className="admin-help">
        导入前会验证完整记录，并备份当前数据。不同网站地址的浏览器数据需通过
        JSON 文件转移。
      </p>
      <div className="admin-row-actions">
        <button className="admin-outline-button" onClick={download}>
          导出 JSON 备份
        </button>
        <button
          className="admin-outline-button"
          onClick={() => input.current?.click()}
        >
          导入 JSON
        </button>
      </div>
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept=".json,application/json"
        aria-label="导入 JSON 数据"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          await run(async () => {
            const data = normalizeData(JSON.parse(await file.text()));
            if (
              confirm(
                `导入 ${data.guests.length} 位宾客、${data.tables.length} 张桌位和 ${data.angpaoRecords.length} 笔礼金，替换当前数据？`,
              )
            )
              await actions.importData(data);
          }, "数据文件已处理");
        }}
      />
    </section>
  );
}
