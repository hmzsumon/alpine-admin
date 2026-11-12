/* ── Component: accessible searchable single select, preserving native form/controlled behavior ── */
"use client";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type SelectHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { matchesDropdownOption } from "@/utils/dropdownSearch";
import "./searchable-select.css";
type Props = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "multiple" | "size"
> & { searchPlaceholder?: string };
type Option = {
  value: string;
  label: string;
  disabled: boolean;
  keywords: string;
};
export default function SearchableSelect({
  children,
  className,
  style,
  searchPlaceholder = "বাংলা নাম, English বা কোড লিখুন…",
  onChange,
  onInvalid,
  ...props
}: Props) {
  const id = useId(),
    native = useRef<HTMLSelectElement>(null),
    trigger = useRef<HTMLButtonElement>(null),
    root = useRef<HTMLSpanElement>(null),
    popup = useRef<HTMLDivElement>(null),
    search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [options, setOptions] = useState<Option[]>([]),
    [current, setCurrent] = useState(""),
    [label, setLabel] = useState(""),
    [invalid, setInvalid] = useState(false),
    [active, setActive] = useState(0),
    [position, setPosition] = useState({
      left: 0,
      top: 0,
      width: 240,
      maxHeight: 300,
    });
  const read = useCallback(() => {
    if (!native.current) return;
    setOptions(
      Array.from(native.current.options).map((o) => ({
        value: o.value,
        label: o.label,
        disabled: o.disabled || !!o.closest("optgroup")?.disabled,
        keywords: o.dataset.search || "",
      })),
    );
    setCurrent(native.current.value);
    const parentLabel = native.current.closest("label");
    setLabel(
      props["aria-label"] ||
        Array.from(parentLabel?.childNodes || [])
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join(" ")
          .trim() ||
        "অপশন নির্বাচন",
    );
  }, [children, props.value, props.defaultValue, props["aria-label"]]);
  useEffect(read, [read]);
  const close = useCallback((focus = false) => {
    setOpen(false);
    setQuery("");
    setActive(0);
    if (focus) trigger.current?.focus();
  }, []);
  const place = useCallback(() => {
    if (!trigger.current) return;
    const r = trigger.current.getBoundingClientRect(),
      height = window.innerHeight,
      roomBelow = height - r.bottom - 10,
      roomAbove = r.top - 10;
    const above = roomBelow < 220 && roomAbove > roomBelow,
      maxHeight = Math.min(340, Math.max(160, above ? roomAbove : roomBelow));
    const width = Math.min(Math.max(r.width, 260), window.innerWidth - 16),
      left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    setPosition({
      left,
      top: above ? Math.max(8, r.top - maxHeight - 5) : r.bottom + 5,
      width,
      maxHeight,
    });
  }, []);
  useEffect(() => {
    if (!open) return;
    place();
    const frame = requestAnimationFrame(() => search.current?.focus());
    function outside(e: PointerEvent) {
      if (
        !root.current?.contains(e.target as Node) &&
        !popup.current?.contains(e.target as Node)
      )
        close();
    }
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place, close]);
  useEffect(() => {
    const form = native.current?.form;
    if (!form) return;
    const reset = () => requestAnimationFrame(read);
    form.addEventListener("reset", reset);
    return () => form.removeEventListener("reset", reset);
  }, [read]);
  useEffect(() => {
    if (props.disabled) close();
  }, [props.disabled, close]);
  const matches = options.filter((o) =>
      matchesDropdownOption(o.label, o.value, query, o.keywords),
    ),
    visible = matches.slice(0, 250),
    selected = options.find((o) => o.value === current),
    selectedLabel = selected?.label || options[0]?.label || "বাছুন";
  function choose(option: Option) {
    const select = native.current;
    if (!select || option.disabled || select.matches(":disabled")) return;
    // Dispatch a genuine native change: existing e.target.value handlers and FormData stay intact.
    select.value = option.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    setCurrent(select.value);
    setInvalid(false);
    close(true);
  }
  function keys(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((n) =>
        Math.max(
          0,
          Math.min(visible.length - 1, n + (e.key === "ArrowDown" ? 1 : -1)),
        ),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (visible[active]) choose(visible[active]);
    } else if (e.key === "Tab") {
      close(true);
    }
  }
  useEffect(() => {
    if (open)
      popup.current
        ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);
  return (
    <span
      ref={root}
      className={"search-select " + (className || "")}
      style={style}
    >
      <select
        {...props}
        ref={native}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          minWidth: 0,
          maxWidth: 1,
          height: 1,
          minHeight: 0,
          maxHeight: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          padding: 0,
          border: 0,
          margin: 0,
          clipPath: "inset(50%)",
        }}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => {
          setCurrent(e.currentTarget.value);
          setInvalid(false);
          onChange?.(e);
        }}
        onInvalid={(e) => {
          onInvalid?.(e);
          e.preventDefault();
          setInvalid(true);
          setOpen(true);
        }}
      >
        {children}
      </select>
      <button
        type="button"
        ref={trigger}
        className="search-select-trigger"
        disabled={props.disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        aria-required={props.required}
        aria-invalid={invalid || undefined}
        aria-label={label + ": " + selectedLabel}
        onClick={(e) => {
          e.preventDefault();
          if (open) close();
          else {
            read();
            setQuery("");
            setActive(0);
            setOpen(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            read();
            setOpen(true);
          }
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            close(true);
          }
        }}
      >
        <span className={!current ? "search-select-placeholder" : ""}>
          {selectedLabel}
        </span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      {invalid && (
        <small className="search-select-error">
          তালিকা থেকে একটি অপশন বাছুন।
        </small>
      )}
      {open &&
        createPortal(
          <div
            ref={popup}
            className="search-select-popup"
            style={position}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-select-search">
              <Search size={16} aria-hidden="true" />
              <input
                ref={search}
                role="combobox"
                aria-label={label + " — সার্চ"}
                aria-expanded="true"
                aria-controls={id}
                aria-autocomplete="list"
                aria-activedescendant={
                  visible[active] ? id + "-" + active : undefined
                }
                value={query}
                placeholder={searchPlaceholder}
                autoComplete="off"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={keys}
              />
              {query && (
                <button
                  type="button"
                  aria-label="সার্চ মুছুন"
                  onClick={() => {
                    setQuery("");
                    setActive(0);
                    search.current?.focus();
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <div
              className="search-select-options"
              role="listbox"
              id={id}
              aria-label={label}
            >
              {visible.map((option, i) => (
                <button
                  type="button"
                  id={id + "-" + i}
                  key={option.value + ":" + i}
                  role="option"
                  aria-selected={option.value === current}
                  disabled={option.disabled}
                  data-index={i}
                  className={i === active ? "is-highlighted" : ""}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {option.value === current && (
                    <Check size={16} aria-hidden="true" />
                  )}
                </button>
              ))}
              {!matches.length && (
                <p className="search-select-empty">
                  মিল পাওয়া যায়নি। অন্য নাম বা কোড লিখুন।
                </p>
              )}
            </div>
            <div className="search-select-count">
              {matches.length.toLocaleString("bn-BD")}টি মিল
              {matches.length > 250
                ? " · প্রথম ২৫০টি দেখাচ্ছে; আরও নির্দিষ্ট করে খুঁজুন"
                : ""}
            </div>
          </div>,
          document.body,
        )}
    </span>
  );
}
