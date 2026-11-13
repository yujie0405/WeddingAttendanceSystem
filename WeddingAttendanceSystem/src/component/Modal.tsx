import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
const dialogs: symbol[] = [];
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const id = useId();
  const element = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const token = Symbol();
    dialogs.push(token);
    const previous = document.activeElement;
    document.body.classList.add("wedding-dialog-open");
    const root = element.current!;
    (root.querySelector<HTMLElement>("input,select,button") || root).focus();
    const keyboard = (e: KeyboardEvent) => {
      if (dialogs.at(-1) !== token) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key === "Tab") {
        const fields = [
          ...root.querySelectorAll<HTMLElement>(
            'button,input,select,textarea,a[href],[tabindex="0"]',
          ),
        ].filter(
          (f) => !f.hasAttribute("disabled") && f.getClientRects().length,
        );
        const first = fields[0],
          last = fields.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === root)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      dialogs.splice(dialogs.indexOf(token), 1);
      if (!dialogs.length)
        document.body.classList.remove("wedding-dialog-open");
      document.removeEventListener("keydown", keyboard);
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, []);
  return createPortal(
    <div className="modal-overlay">
      <div
        ref={element}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        className={"wedding-modal " + (wide ? "wide" : "")}
      >
        <div className="modal-heading">
          <h2 id={id}>{title}</h2>
          <button type="button" aria-label="关闭" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
