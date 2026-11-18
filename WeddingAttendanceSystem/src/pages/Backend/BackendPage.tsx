import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { backend } from "../../api/backend";
import type { ApiGuest, ApiTable, GuestInput, GuestPage, Lookup } from "../../api/backend";
import { AppError } from "../../i18n/messages";
import type { TranslationKey } from "../../i18n/messages";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../../component/Modal";
import { LocalizedForm } from "../../component/LocalizedForm";
import { formatRM } from "../../utils/format";

type Mode = "checkin" | "guests" | "gifts";
const emptyPage: GuestPage = { items: [], page: 1, pageSize: 20, totalCount: 0 };
const failure = (error: unknown): TranslationKey => error instanceof AppError ? error.key : "Backend.RequestFailed";

export function BackendPage({ mode }: { mode: Mode }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [rows, setRows] = useState<GuestPage>(emptyPage);
  const [tags, setTags] = useState<Lookup[]>([]);
  const [statuses, setStatuses] = useState<Lookup[]>([]);
  const [tables, setTables] = useState<ApiTable[]>([]);
  const [search, setSearch] = useState("");
  const [side, setSide] = useState("");
  const [status, setStatus] = useState("");
  const [relation, setRelation] = useState("");
  const [table, setTable] = useState("");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<TranslationKey>();
  const [saved, setSaved] = useState(false);
  const [edit, setEdit] = useState<ApiGuest>();
  const [amounts, setAmounts] = useState<Record<number, number>>({});
  const [total, setTotal] = useState<number | undefined>();
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const controller = new AbortController();
    const signal = controller.signal;
    setLoading(true);
    setError(undefined);
    const query = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search.trim()) query.set("search", search.trim());
    if (side) query.set("weddingSide", side);
    if (status) query.set("attendanceStatusId", status);
    if (relation) query.set("relationId", relation);
    if (table) query.set("tableNumber", table);
    void (async () => {
      const [nextTags, nextStatuses, nextRows, nextTables] = await Promise.all([
        backend.tags(signal), backend.statuses(signal),
        backend.guests(query, signal),
        backend.tables(signal),
      ]);
      if (signal.aborted) return;
      setTags(nextTags); setStatuses(nextStatuses); setRows(nextRows);
      setTables(nextTables);
      if (mode === "gifts") {
        const [money, sum] = await Promise.all([
          Promise.all(nextRows.items.map(guest => backend.money(guest.id, signal))), backend.total(signal),
        ]);
        if (signal.aborted) return;
        setAmounts(Object.fromEntries(money.map(item => [item.guestId, item.amount])));
        setTotal(sum.amount);
      }
    })().catch(error => { if (!signal.aborted) setError(failure(error)); })
      .finally(() => { if (!signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [user, mode, search, side, status, relation, table, page, revision]);

  useEffect(() => {
    const refresh = () => setRevision(value => value + 1);
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const perform = async (task: () => Promise<unknown>, onSuccess?: () => void) => {
    if (saving) return;
    setSaving(true); setError(undefined); setSaved(false);
    try {
      await task(); onSuccess?.(); setSaved(true); setRevision(value => value + 1);
    } catch (error) { setError(failure(error)); }
    finally { setSaving(false); }
  };
  const changeFilter = (update: (value: string) => void, value: string) => { update(value); setPage(1); setSaved(false); };
  const title = mode === "gifts" ? t("Nav.Dashboard") : mode === "guests" ? t("Nav.Guests") : t("Nav.Home");

  return <div className="wedding-space-y-4">
    <div className="admin-section-heading">
      <h2 className="admin-section-title">{title}</h2>
      <button type="button" className="admin-outline-button" disabled={loading || saving} onClick={() => setRevision(value => value + 1)}>{t("Backend.Refresh")}</button>
    </div>
    {error && <div role="alert" className="admin-section"><p>{t(error)}</p>
      <button type="button" onClick={() => setRevision(value => value + 1)}>{t("Backend.Retry")}</button>
    </div>}
    {saved && <p role="status">{t("Backend.Saved")}</p>}
    {loading && <p role="status">{t("Backend.Loading")}</p>}

    <>
      {mode === "guests" && <section className="admin-section">
        <h3>{t("Backend.NewGuest")}</h3>
        <GuestForm key={formKey} tags={tags} statuses={statuses} tables={tables} disabled={saving || loading} onSave={input => perform(() => backend.saveGuest(input), () => { setFormKey(key => key + 1); setPage(1); })} />
      </section>}
      {mode === "gifts" && <section className="admin-section">
        <h3>{t("Backend.SummaryTotal")}</h3>
        <strong>{loading || error || total === undefined ? "—" : formatRM(total, i18n.resolvedLanguage)}</strong>
        <p>{t("Backend.TotalHelp")}</p>
      </section>}
      <section className="admin-section wedding-space-y-3">
        <label className="admin-label">{t("Backend.Search")}<input type="search" className="admin-input" value={search} onChange={event => changeFilter(setSearch, event.target.value)} /></label>
        <div className="form-grid">
          <select aria-label={t("Common.Side")} className="admin-input" value={side} onChange={event => changeFilter(setSide, event.target.value)}>
            <option value="">{t("Backend.AllSides")}</option><option value="1">{t("Common.Groom")}</option><option value="2">{t("Common.Bride")}</option>
          </select>
          <select aria-label={t("Backend.Attendance")} className="admin-input" value={status} onChange={event => changeFilter(setStatus, event.target.value)}>
            <option value="">{t("Backend.AllStatuses")}</option>{statuses.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
          <select aria-label={t("Backend.Relationship")} className="admin-input" value={relation} onChange={event => changeFilter(setRelation, event.target.value)}>
            <option value="">{t("Backend.AllRelationships")}</option>{tags.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
          <label className="admin-label">{t("Common.Table")}<select className="admin-input" value={table} onChange={event => changeFilter(setTable, event.target.value)}>
            <option value="">{t("Backend.AllTables")}</option>
            {tables.map(item => <option key={item.tableNumber} value={item.tableNumber}>{t("Common.TableNumber", { table: item.tableNumber })}</option>)}
          </select></label>
        </div>
        <p>{t("Backend.Records", { count: rows.totalCount })}</p>
        {!loading && !error && !rows.items.length && <p>{t("Backend.Empty")}</p>}
        {!loading && !error && rows.items.map(guest => <article key={guest.id} data-guest-id={guest.id} className="guest-card">
          <div className="admin-section-heading"><div>
            <h3 className="wedding-text-base wedding-font-bold">{guest.guestName}</h3>
            <p>{guest.relationship} · {guest.weddingSide === 1 ? t("Common.Groom") : t("Common.Bride")}</p>
            <p>{guest.tableNumber === null ? t("Backend.Unassigned") : t("Common.TableNumber", { table: guest.tableNumber })} · {t("Backend.GuestNum")}: {guest.guestNum}</p>
          </div>
            {user?.role === "admin" && <button type="button" className="admin-outline-button" disabled={saving} onClick={() => setEdit(guest)}>{t("Common.Edit")}</button>}
          </div>
          <label className="admin-label">{t("Backend.Attendance")}
            <select aria-label={t("Backend.Attendance")} className="admin-input" disabled={saving} value={guest.attendanceStatusId} onChange={event => {
              void perform(() => backend.attendance(guest.id, Number(event.target.value)));
            }}>{statuses.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select>
          </label>
          {mode === "gifts" && amounts[guest.id] !== undefined && <AmountEditor amount={amounts[guest.id]} disabled={saving} onSave={amount => perform(() => backend.setMoney(guest.id, amount))} />}
        </article>)}
        <div className="admin-row-actions">
          <button type="button" disabled={loading || saving || page === 1} onClick={() => setPage(value => value - 1)}>{t("Backend.Previous")}</button>
          <span>{t("Backend.Page", { page })}</span>
          <button type="button" disabled={loading || saving || page * rows.pageSize >= rows.totalCount} onClick={() => setPage(value => value + 1)}>{t("Backend.Next")}</button>
        </div>
      </section>
    </>
    {edit && <Modal title={t("Backend.EditGuest")} onClose={() => { if (!saving) setEdit(undefined); }} wide>
      <GuestForm initial={edit} tags={tags} statuses={statuses} tables={tables} disabled={saving} onSave={input => perform(() => backend.saveGuest(input, edit.id), () => setEdit(undefined))} />
      {error && <p role="alert">{t(error)}</p>}
    </Modal>}
  </div>;
}

function GuestForm({ initial, tags, statuses, tables, disabled, onSave }: {
  initial?: ApiGuest; tags: Lookup[]; statuses: Lookup[]; tables: ApiTable[]; disabled: boolean;
  onSave: (input: GuestInput) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.guestName || "");
  const [relation, setRelation] = useState(initial ? String(initial.relationId) : "");
  const [side, setSide] = useState(String(initial?.weddingSide || 1));
  const [count, setCount] = useState(String(initial?.guestNum || 1));
  const [status, setStatus] = useState(initial ? String(initial.attendanceStatusId) : "1");
  const [table, setTable] = useState(initial?.tableNumber?.toString() || "");
  return <LocalizedForm className="wedding-space-y-3" onSubmit={async event => {
    event.preventDefault();
    if (disabled) return;
    await onSave({ guestName: name.trim(), relationId: Number(relation), weddingSide: Number(side), guestNum: Number(count), attendanceStatusId: Number(status), tableNumber: table ? Number(table) : null });
  }}>
    <fieldset disabled={disabled} className="form-grid">
      <label className="admin-label">{t("Backend.Name")}<input className="admin-input" required maxLength={150} value={name} onChange={event => setName(event.target.value)} /></label>
      <label className="admin-label">{t("Backend.Relationship")}<select aria-label={t("Backend.Relationship")} className="admin-input" required value={relation} onChange={event => setRelation(event.target.value)}>
        <option value="" disabled>{t("Backend.Select")}</option>{tags.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select></label>
      <label className="admin-label">{t("Common.Side")}<select aria-label={t("Common.Side")} className="admin-input" value={side} onChange={event => setSide(event.target.value)}>
        <option value="1">{t("Common.Groom")}</option><option value="2">{t("Common.Bride")}</option>
      </select></label>
      <label className="admin-label">{t("Backend.GuestNum")}<input type="number" className="admin-input" min="1" step="1" max="32767" required value={count} onChange={event => setCount(event.target.value)} /></label>
      <label className="admin-label">{t("Backend.Attendance")}<select aria-label={t("Backend.Attendance")} className="admin-input" required value={status} onChange={event => setStatus(event.target.value)}>
        <option value="" disabled>{t("Backend.Select")}</option>{statuses.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
      </select></label>
      <label className="admin-label">{t("Common.Table")}<select className="admin-input" value={table} onChange={event => setTable(event.target.value)}>
        <option value="">{t("Backend.Unassigned")}</option>
        {tables.map(item => <option key={item.tableNumber} value={item.tableNumber}>{t("Common.TableNumber", { table: item.tableNumber })}</option>)}
      </select></label>
    </fieldset>
    {!disabled && !tags.length && <p className="admin-help">{t("Backend.AddTagFirst")}</p>}
    {!disabled && !initial && !statuses.some(item => item.id === 1) && <p role="alert">{t("Backend.DefaultStatusMissing")}</p>}
    <button className="admin-primary-button" disabled={disabled || !tags.length || !statuses.length || !statuses.some(item => String(item.id) === status)}>{t(disabled ? "Backend.PendingWrite" : "Backend.Save")}</button>
  </LocalizedForm>;
}

function AmountEditor({ amount, disabled, onSave }: { amount: number; disabled: boolean; onSave: (amount: number) => Promise<void> }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(amount.toFixed(2));
  useEffect(() => setDraft(amount.toFixed(2)), [amount]);
  return <LocalizedForm className="wedding-space-y-3" onSubmit={async event => {
    event.preventDefault();
    if (!disabled && confirm(t("Backend.ReplaceConfirmation"))) await onSave(Number(draft));
  }}>
    <label className="admin-label">{t("Backend.CurrentTotal")}<input className="admin-input" type="number" min="0" max="9999999999.99" step="0.01" required disabled={disabled} value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button className="admin-primary-button" disabled={disabled}>{t("Backend.ReplaceTotal")}</button>
  </LocalizedForm>;
}
