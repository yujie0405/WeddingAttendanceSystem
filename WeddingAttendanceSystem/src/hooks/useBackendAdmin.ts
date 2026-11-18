import { useEffect, useRef, useState } from "react";
import { AppError } from "../i18n/messages";
import type { TranslationKey } from "../i18n/messages";

export function useBackendAdmin<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<TranslationKey>();
  const [saved, setSaved] = useState(false);
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const refresh = () => setRevision(value => value + 1);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    void load(controller.signal).then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof AppError ? error.key : "Backend.RequestFailed"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [load, revision]);
  useEffect(() => {
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  const perform = async (task: () => Promise<unknown>) => {
    if (pending.current) return false;
    pending.current = true; setSaving(true); setError(undefined); setSaved(false);
    try { await task(); setSaved(true); refresh(); return true; }
    catch (error) { setError(error instanceof AppError ? error.key : "Backend.RequestFailed"); return false; }
    finally { pending.current = false; setSaving(false); }
  };
  return { data, loading, saving, error, saved, refresh, perform };
}
