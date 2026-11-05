"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribeNever = () => () => {};

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/** Bottom sheet on a native <dialog>: focus trap, Esc to close and inert background come built in. */
export function Sheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Portal to <body>: inside a sticky/blurred header the dialog would be positioned against the header
  const host = useSyncExternalStore(subscribeNever, () => document.body, () => null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open, host]);

  if (!host) return null;
  return createPortal(
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between border-b border-line px-4">
            <h2 id={titleId} className="py-3 text-xl font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="tap -mr-2 rounded-full px-3 text-sm font-semibold text-maroon">
              Done
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-4 pt-3 pad-b-safe">{children}</div>
        </div>
      )}
    </dialog>,
    host,
  );
}
