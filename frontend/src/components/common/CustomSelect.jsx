import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((option) => String(option.value) === String(value ?? ""));
  const showSearch = options.length > 8;
  const filtered = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) return undefined;

    const place = () => {
      const box = buttonRef.current?.getBoundingClientRect();
      if (!box) return;
      const spaceBelow = window.innerHeight - box.bottom;
      const openUp = spaceBelow < 240 && box.top > spaceBelow;
      setMenuStyle({
        position: "fixed",
        left: box.left,
        width: box.width,
        zIndex: 200,
        ...(openUp
          ? { bottom: window.innerHeight - box.top + 6 }
          : { top: box.bottom + 6 }),
      });
    };

    const onPointer = (event) => {
      if (buttonRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    place();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-page px-3 py-2.5 text-left text-sm text-fg disabled:opacity-60 ${className}`}
      >
        <span className={`truncate ${selected ? "" : "text-muted"}`}>
          {selected?.label || placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}>
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              style={menuStyle}
              className="max-h-64 overflow-auto rounded-xl border border-line bg-surface p-1 shadow-2xl"
            >
              {showSearch && (
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="mb-1 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-fg outline-none"
                />
              )}
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted">No matches</p>
              ) : (
                filtered.map((option, index) => {
                  const active = String(option.value) === String(value ?? "");
                  return (
                    <button
                      key={`${option.value}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={`flex w-full rounded-lg px-3 py-2 text-left text-sm ${
                        active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default CustomSelect;
