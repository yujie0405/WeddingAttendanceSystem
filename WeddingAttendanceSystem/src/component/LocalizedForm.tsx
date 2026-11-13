import { useId, useState } from "react";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { translateMessage } from "../i18n/messages";
import type { Message } from "../i18n/messages";
// Browser-native validation follows browser language, so display our own translated messages.
export function LocalizedForm({
  children,
  onSubmit,
  onInput,
  ...props
}: ComponentProps<"form">) {
  const { t } = useTranslation();
  const id = useId();
  const [error, setError] = useState<Message>();
  return (
    <form
      {...props}
      noValidate
      aria-describedby={error ? id : props["aria-describedby"]}
      onInput={(e) => {
        setError(undefined);
        onInput?.(e);
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const invalid = [...e.currentTarget.elements].find(
          (el) =>
            (el instanceof HTMLInputElement ||
              el instanceof HTMLSelectElement ||
              el instanceof HTMLTextAreaElement) &&
            el.willValidate &&
            !el.validity.valid,
        );
        if (
          invalid instanceof HTMLInputElement ||
          invalid instanceof HTMLSelectElement ||
          invalid instanceof HTMLTextAreaElement
        ) {
          const v = invalid.validity;
          if (v.valueMissing) setError({ key: "Validation.Required" });
          else if (invalid instanceof HTMLInputElement && v.rangeUnderflow)
            setError({
              key: "Validation.Minimum",
              params: { min: invalid.min },
            });
          else if (invalid instanceof HTMLInputElement && v.rangeOverflow)
            setError({
              key: "Validation.Maximum",
              params: { max: invalid.max },
            });
          else if (invalid instanceof HTMLInputElement && v.stepMismatch)
            setError({
              key: "Validation.Step",
              params: { step: invalid.step || "1" },
            });
          else setError({ key: "Validation.Invalid" });
          invalid.focus();
          return;
        }
        setError(undefined);
        onSubmit?.(e);
      }}
    >
      {children}
      {error && (
        <p className="form-error" role="alert" id={id}>
          {translateMessage(t, error)}
        </p>
      )}
    </form>
  );
}
