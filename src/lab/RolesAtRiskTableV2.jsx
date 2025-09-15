import React, {useMemo, useState, useCallback, useEffect} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Select,
  SelectItem,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

// small helpers + sample data generators for the lab
const STATUSES = ["Open", "On Hold"];
const CLIENTS = ["Acme Corp", "Beta LLC", "Gamma Inc", "Delta Co"];
const PRACTICES = ["Consulting", "Engineering", "Design"];

function rnd(list) { return list[Math.floor(Math.random() * list.length)]; }

function formatDatePretty(iso) {
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

function mkRow(i) {
  return {
    id: i,
    jobRecId: `REC-${1000 + i}`,
    romaId: `ROMA-${2000 + i}`,
    roleType: i % 2 ? "Internal" : "External",
    jobTitle: [`Senior Engineer`, `Product Manager`, `UX Designer`, `Data Scientist`][i % 4],
    gcm: ["NY", "LDN", "SF"][i % 3],
    hiringManager: [`Alice`, `Bob`, `Carol`, `Dan`][i % 4],
    recruiter: [`Eve`, `Frank`, `Grace`, `Heidi`][i % 4],
    practice: rnd(PRACTICES),
    client: rnd(CLIENTS),
    dateCreated: new Date(Date.now() - i * 86400000).toISOString(),
    status: rnd(STATUSES),
    riskReasons: i % 3 ? "Slow pipeline; client feedback pending" : "No recent activity; role scope unclear",
  };
}

function mkBatch(start, count) {
  return Array.from({ length: count }, (_, k) => mkRow(start + k));
}

const statusMap = {
  Open: { color: "success", dot: "#16a34a", bg: '#dcfce7', text: '#166534' }, // light green bg, dark green text
  "On Hold": { color: "warning", dot: "#f97316", bg: '#fef3c7', text: '#b45309' }, // light orange bg, dark orange text
};

// pick readable foreground (black/white) for given rgb(...) string
function contrastTextColor(color) {
  try {
    let r, g, b;
    const mRgb = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (mRgb) {
      r = Number(mRgb[1]); g = Number(mRgb[2]); b = Number(mRgb[3]);
    } else {
      const mHex = color.match(/^#?([0-9a-fA-F]{6})$/);
      if (mHex) {
        const v = mHex[1];
        r = parseInt(v.slice(0,2),16); g = parseInt(v.slice(2,4),16); b = parseInt(v.slice(4,6),16);
      } else {
        return '#fff';
      }
    }
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  } catch (e) { return '#fff'; }
}

/* =========================
   Column config + state
========================= */
const INITIAL_COLS = [
  { key: "jobRecId",    label: "Rec ID",        width: 90,  align: "center" },
  { key: "romaId",      label: "ROMA ID",       width: 110 },
  { key: "roleType",    label: "Role Type",     width: 110 },
  { key: "jobTitle",    label: "Job Title",     width: 160 },
  { key: "gcm",         label: "GCM",           width: 60,  align: "center" },
  { key: "hiringManager", label: "Hiring Manager", width: 140 },
  { key: "recruiter",   label: "Recruiter",     width: 120 },
  { key: "practice",    label: "Practice",      width: 120 },
  { key: "client",      label: "Client",        width: 120 },
  { key: "dateCreated", label: "Date Created",  width: 140, align: "center" },
  { key: "status",      label: "Status",        width: 120, align: "center" },
  { key: "riskReasons", label: "Risk Reason",   width: 320 },
  { key: "actions",     label: "Actions",       width: 96,  align: "center", stickyRight: true },
];

// build default column-state object
function makeColState(list) {
  const out = {};
  for (const c of list) out[c.key] = { ...c, visible: true, bold: false };
  return out;
}

// localStorage hydration/ persistence
const COLS_STORAGE_KEY = "rolesAtRiskV2_cols_v1";
function hydrateCols() {
  const base = makeColState(INITIAL_COLS);
  try {
    const saved = JSON.parse(localStorage.getItem(COLS_STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") {
      for (const k of Object.keys(base)) {
        if (saved[k]) {
          base[k].visible = !!saved[k].visible;
          base[k].bold = !!saved[k].bold;
          const w = Number(saved[k].width);
          base[k].width = Number.isFinite(w) ? w : base[k].width;
          // restore alignment if present
          if (saved[k].align) base[k].align = saved[k].align;
        }
      }
    }
  } catch {}
  return base;
}

/* =========================
   Component
========================= */
export default function RolesAtRiskTableV2() {

  // ref for dropdown menu
  const menuRef = React.useRef(null);
  // ...existing code...


  // ...existing state and helper declarations...

  // rows / pagination-ish
  const [rows, setRows] = useState(() => mkBatch(1, 12));
  const [offset, setOffset] = useState(13);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ui state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(new Set([]));
  const SORT_STORAGE_KEY = "rolesAtRiskV2_sort_v1";
  const [sortDescriptor, setSortDescriptor] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SORT_STORAGE_KEY) || "null");
      if (saved && saved.column) return saved;
    } catch {}
    return { column: "gcm", direction: "ascending" };
  });
  useEffect(() => {
    try { localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sortDescriptor)); } catch {}
  }, [sortDescriptor]);

  // column UI state (with persistence)
  const [cols, setCols] = useState(() => hydrateCols());
  useEffect(() => {
    localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(cols));
  }, [cols]);

  // context menu state
  const [ctxMenu, setCtxMenu] = useState({ open: false, x: 0, y: 0, key: null });

  // resizing state
  const [resizing, setResizing] = useState({ active: false, key: null, startX: 0, startW: 0 });

  // context menu helpers
  const openHeaderMenu = (e, key) => {
    e.preventDefault();
    setCtxMenu({ open: true, x: e.clientX, y: e.clientY, key });
  };
  const closeMenu = () => setCtxMenu({ open: false, x: 0, y: 0, key: null });

  // Close menu on outside click
  useEffect(() => {
    if (!ctxMenu.open) return;
    function handleClick(e) {
      // Close menu on any click when it's open
      closeMenu();
    }
    // Add a small delay to avoid closing immediately when opening
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [ctxMenu.open]);

  const toggleBoldCol = (key) => setCols(s => ({ ...s, [key]: { ...s[key], bold: !s[key].bold } }));
  const hideCol = (key) => setCols(s => ({ ...s, [key]: { ...s[key], visible: false } }));
  const showCol = (key) => setCols(s => ({ ...s, [key]: { ...s[key], visible: true } }));
  const resetWidth = (key) => setCols(s => ({ ...s, [key]: { ...s[key], width: INITIAL_COLS.find(c=>c.key===key)?.width ?? 120 } }));
  const setColAlign = (key, align) => setCols(s => ({ ...s, [key]: { ...s[key], align } }));
  const showAll = () => setCols(s => {
    const next = { ...s };
    for (const k of Object.keys(next)) next[k].visible = true;
    return next;
  });

  // resizing
  const onResizeStart = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ active: true, key, startX: e.clientX, startW: cols[key].width || 120 });
  };
  useEffect(() => {
    if (!resizing.active) return;
    const onMove = (e) => {
      const dx = e.clientX - resizing.startX;
      const w = Math.max(80, Math.min(600, resizing.startW + dx));
      setCols(s => ({ ...s, [resizing.key]: { ...s[resizing.key], width: w } }));
    };
    const onUp = () => setResizing({ active: false, key: null, startX: 0, startW: 0 });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing]);

  // edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      jobTitle: row.jobTitle,
      roleType: row.roleType,
      gcm: row.gcm,
      hiringManager: row.hiringManager,
      recruiter: row.recruiter,
      practice: row.practice,
      client: row.client,
      status: row.status,
      riskReasons: row.riskReasons,
    });
    setIsEditOpen(true);
  };
  const closeEdit = () => { setIsEditOpen(false); setEditing(null); };
  const saveEdit = () => {
    if (!editing) return;
    setRows((prev) => prev.map((r) => r.id === editing.id ? {...r, ...form} : r));
    closeEdit();
  };

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 450));
    const next = mkBatch(offset, 8);
    setRows((prev) => [...prev, ...next]);
    setOffset((n) => n + next.length);
    if (offset > 80) setHasMore(false);
    setLoadingMore(false);
  }, [offset]);

  // filter + sort
  const filtered = useMemo(() => {
    const txt = search.trim().toLowerCase();
    const statusActive = statusFilter.size ? Array.from(statusFilter) : null;

    return rows.filter((r) => {
      const passesText =
        !txt ||
        String(r.jobRecId).includes(txt) ||
        r.romaId.toLowerCase().includes(txt) ||
        r.roleType.toLowerCase().includes(txt) ||
        r.jobTitle.toLowerCase().includes(txt) ||
        r.gcm.toLowerCase().includes(txt) ||
        r.hiringManager.toLowerCase().includes(txt) ||
        r.recruiter.toLowerCase().includes(txt) ||
        r.practice.toLowerCase().includes(txt) ||
        r.client.toLowerCase().includes(txt) ||
        new Date(r.dateCreated).toLocaleDateString().toLowerCase().includes(txt) ||
        r.status.toLowerCase().includes(txt) ||
        r.riskReasons.toLowerCase().includes(txt);

      const passesStatus = !statusActive || statusActive.includes(r.status);
      return passesText && passesStatus;
    });
  }, [rows, search, statusFilter]);

  const sorted = useMemo(() => {
    const {column, direction} = sortDescriptor;
    const arr = [...filtered];
    arr.sort((a, b) => {
      let x = a[column], y = b[column];
      const isDate = column === "dateCreated";
      if (isDate) { x = new Date(x).getTime(); y = new Date(y).getTime(); }
      if (typeof x === "string") x = x.toLowerCase();
      if (typeof y === "string") y = y.toLowerCase();
      if (x < y) return direction === "ascending" ? -1 : 1;
      if (x > y) return direction === "ascending" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortDescriptor]);

  // empty state
  const empty = (
    <div className="py-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:rgba(0,0,0,0.04)] text-[13px] text-[var(--muted-text)]">
        <span>No rows to display.</span>
      </div>
    </div>
  );

  // cell renderer (uses column settings)
  const renderCell = (item, key) => {
    const colAlign = cols[key]?.align;
    const textAlignClass = colAlign === 'center' ? 'text-center' : (colAlign === 'right' ? 'text-right' : 'text-left');
    const justifyClass = colAlign === 'center' ? 'justify-center' : (colAlign === 'right' ? 'justify-end' : 'justify-start');
    switch (key) {
      case "jobRecId":     return item.jobRecId;
      case "romaId":       return item.romaId;
      case "roleType":     return (
        <span className={item.roleType === "Internal" ? "text-blue-600/80" : "text-orange-600/80"}>
          {item.roleType}
        </span>
      );
      case "jobTitle":     return <span className="font-medium truncate" title={item.jobTitle}>{item.jobTitle}</span>;
  case "gcm":          return <span className={"block " + textAlignClass}>{item.gcm}</span>;
      case "hiringManager":return <span title={item.hiringManager}>{item.hiringManager}</span>;
      case "recruiter":    return <span title={item.recruiter}>{item.recruiter}</span>;
      case "practice":     return item.practice;
      case "client":       return item.client;
  case "dateCreated":  return <span className={"block " + textAlignClass}>{formatDatePretty(item.dateCreated)}</span>;
      case "status":       return (
        <div className={"flex " + justifyClass}>
          <Chip
            size="sm"
            variant="flat"
            className={["capitalize px-2 py-0.5 border border-black/10", cols.status?.bold ? 'font-semibold' : ''].join(' ')}
            style={{ backgroundColor: statusMap[item.status]?.bg, color: statusMap[item.status]?.text }}
          >
            {item.status}
          </Chip>
        </div>
      );
      case "riskReasons":  return (
        <Chip
          size="sm"
          variant="flat"
          color="default"
          className={(cols.riskReasons?.bold ? 'font-semibold ' : '') + 'w-full max-w-[100%] overflow-hidden mr-2'}
          startContent={<span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600" />}
        >
          <div className="overflow-hidden" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', textOverflow: 'ellipsis'}}>
            <span className="block">{item.riskReasons}</span>
          </div>
        </Chip>
      );
      case "actions":      return (
        <div className={"flex items-center " + justifyClass + " gap-1.5"}>
          <button
            className="p-1.5 rounded-md text-gray-500 hover:bg-black/5 hover:text-gray-700"
            aria-label="View" onClick={(e)=>e.stopPropagation()} title="View">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 3.1c-2.94 0-5.68 1.73-7.59 4.73-.75 1.18-.75 3 0 4.18C4.32 15 7.06 16.9 10 16.9c2.94 0 5.68-1.9 7.59-4.89.75-1.18.75-3 0-4.18C15.68 4.83 12.94 3.1 10 3.1Z" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button
            className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50"
            aria-label="Edit" onClick={(e)=>{e.stopPropagation(); openEdit(item);}} title="Edit">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M11.05 3l-6.84 7.24c-.26.28-.51.82-.56 1.21l-.31 2.7c-.11.98.59 1.65 1.56 1.48l2.68-.46c.38-.07.9-.34 1.16-.62l6.84-7.24c1.19-1.25 1.72-2.68-.08-4.4-1.83-1.73-3.22-1.1-4.45-.07Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button
            className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
            aria-label="Delete" onClick={(e)=>{e.stopPropagation(); alert('Delete not wired in lab');}} title="Delete">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 5c-2.78-.27-5.57-.43-8.35-.43-1.65 0-3.31.08-4.96.25L2.5 5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7.09 4.14l.18-1.09C7.4 2.26 7.5 1.67 8.91 1.67h2.18c1.41 0 1.52.63 1.65 1.39l.19 1.09"/>
              <path d="M15.71 7.62l-.54 8.39c-.09 1.31-.17 2.33-2.48 2.33H7.31c-2.31 0-2.39-1.02-2.48-2.33l-.54-8.39" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
      );
      default: return item[key];
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] p-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <h1 className="text-2xl font-bold">Roles at Risk — v2 (HeroUI)</h1>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            isClearable
            size="sm"
            radius="md"
            className="w-[280px]"
            placeholder="Search roles…"
            value={search}
            onValueChange={setSearch}
            onClear={() => setSearch("")}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="flat" className="capitalize">
                {statusFilter.size ? `Status: ${Array.from(statusFilter).join(", ")}` : "Filter: Status"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Filter by status"
              disallowEmptySelection
              selectionMode="multiple"
              selectedKeys={statusFilter}
              onSelectionChange={setStatusFilter}
            >
              {STATUSES.map(s => <DropdownItem key={s}>{s}</DropdownItem>)}
            </DropdownMenu>
          </Dropdown>
          <Button size="sm" variant="flat" onPress={() => setStatusFilter(new Set())} isDisabled={!statusFilter.size}>
            Clear filters
          </Button>
        </div>

        {/* Card wrapper */}
        <div className="rounded-2xl border shadow-md bg-[var(--card-bg)]">
          {/* Horizontal scroller is the sticky ancestor */}
          <div className="relative overflow-x-auto rounded-2xl">
            <Table
              aria-label="Roles at Risk table"
              isHeaderSticky
              selectionMode="single"
              selectionBehavior="replace"
              color="danger"
              removeWrapper
              classNames={{
                base: "w-full",
                table: "table-fixed min-w-[1100px]",
                thead: "sticky top-0 z-30",
                th: [
                  // centered & bold headers
                  "text-[13px] font-semibold text-center",
                  // normalize header cell height/vertical alignment
                  "h-10 leading-[2.2]",
                  // purple-ish bg
                  "bg-[color-mix(in_srgb,var(--accent)_18%,white)]",
                  // borders
                  "border-b border-black/10",
                  "px-3 py-2",
                  // vertical column dividers
                  "border-r border-black/10 first:border-l last:border-r-0",
                ].join(" "),
                tr: [
                  "cursor-pointer transition-colors",
                  // lighter horizontal row divider (lighter than vertical column dividers)
                  "border-b border-black/6",
                  "data-[hover=true]:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)]",
                  // reduced selected row intensity
                  "data-[selected=true]:bg-[color:rgba(239,68,68,0.06)]",
                ].join(" "),
                td: [
                  "text-[13px] py-3 px-3 first:rounded-l-xl last:rounded-r-xl whitespace-nowrap align-middle",
                  // vertical column dividers
                  "border-r border-black/10 first:border-l last:border-r-0",
                ].join(" "),
              }}
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
              bottomContent={null}
            >
              <TableHeader>
                {INITIAL_COLS.filter(c => cols[c.key]?.visible).map(col => {
                  const meta = cols[col.key];
                  return (
                    <TableColumn
                      key={col.key}
                      // Disable header-click sorting; sorting moved to context menu only
                      allowsSorting={false}
                      onContextMenu={(e) => openHeaderMenu(e, col.key)}
                      className={[
                        // header text alignment is centered globally now
                        meta.stickyRight ? "sticky right-0 z-40 bg-[color-mix(in_srgb,var(--accent)_18%,white)]" : "",
                        "font-bold", // always bold header
                        "relative select-none",
                      ].join(" ")}
                      width={meta.width}
                      style={{ width: meta.width }}
                    >
                      <div className="flex items-center justify-center">
                        <span className="truncate">{meta.label}</span>
                        {/* grabber */}
                        <span
                          className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize"
                          onMouseDown={(e) => onResizeStart(e, col.key)}
                          title="Drag to resize"
                        />
                      </div>
                    </TableColumn>
                  );
                })}
              </TableHeader>

              <TableBody items={sorted} emptyContent={empty}>
                {(item) => (
                  <TableRow key={item.id}>
                    {INITIAL_COLS.filter(c => cols[c.key]?.visible).map(col => {
                      const isRisk = col.key === 'riskReasons';
                      const isTrunc = ["jobTitle","hiringManager","recruiter","client","romaId","dateCreated"].includes(col.key);
                      return (
                      <TableCell
                        key={col.key}
                        className={[
                          // bold entire column via TD class (affects header + cells)
                          cols[col.key]?.bold ? "font-semibold" : "",
                          // body alignment per column (use persisted per-column align if set)
                          (cols[col.key]?.align ? (cols[col.key].align === 'center' ? 'text-center' : (cols[col.key].align === 'right' ? 'text-right' : 'text-left')) : (["gcm","dateCreated","status","jobRecId"].includes(col.key) ? "text-center" : "text-left")),
                          // sticky right actions — keep clean seam and overlay to block overflow
                          col.key === "actions"
                            ? "sticky right-0 z-40 bg-transparent before:absolute before:inset-y-0 before:-left-px before:w-px before:bg-black/10"
                            : "",
                          // ensure cells don't wrap under sticky actions and keep dividers
                          isRisk
                            ? "max-w-[320px] align-middle pr-3 overflow-hidden whitespace-normal break-words"
                            : isTrunc
                              ? "max-w-[160px] pr-3 overflow-hidden truncate align-middle"
                              : "whitespace-nowrap align-middle",
                        ].join(" ")}
                        style={{ width: cols[col.key]?.width }}
                        title={["jobTitle","hiringManager","recruiter","riskReasons"].includes(col.key) ? item[col.key] : undefined}
                      >
                        {renderCell(item, col.key)}
                      </TableCell>
                    )})}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Right-click column menu (HeroUI Dropdown) */}
          {ctxMenu.open && (
            <>
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-black/10 z-[90]"
                onClick={closeMenu}
              />
              <div ref={menuRef} style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 100 }} onClick={(e) => e.stopPropagation()}>
                <Dropdown 
                  isOpen={ctxMenu.open} 
                  onOpenChange={(open) => { if (!open) closeMenu(); }}
                  placement="bottom-start"
                >
                  <DropdownTrigger>
                    <Button
                      className="w-0 h-0 p-0 opacity-0 pointer-events-none"
                      aria-hidden="true"
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Column menu"
                    closeOnSelect={false}
                    onAction={() => closeMenu()}
                    autoFocus
                    className="bg-white rounded-xl shadow-xl ring-1 ring-black/10 min-w-[240px] p-1"
                  >
                <DropdownSection title={`Column: ${cols[ctxMenu.key]?.label}`}></DropdownSection>
                <DropdownItem 
                  onPress={() => { toggleBoldCol(ctxMenu.key); closeMenu(); }}
                  startContent={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                    </svg>
                  }
                >
                  {cols[ctxMenu.key]?.bold ? "Unbold column" : "Bold column"}
                </DropdownItem>
                <DropdownSection title="Alignment">
                  <DropdownItem 
                    onPress={() => { setColAlign(ctxMenu.key, 'left'); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="21" y1="6" x2="3" y2="6"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                        <line x1="17" y1="18" x2="3" y2="18"/>
                      </svg>
                    }
                  >
                    Align left
                  </DropdownItem>
                  <DropdownItem 
                    onPress={() => { setColAlign(ctxMenu.key, 'center'); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="6"/>
                        <line x1="21" y1="12" x2="3" y2="12"/>
                        <line x1="16" y1="18" x2="8" y2="18"/>
                      </svg>
                    }
                  >
                    Align center
                  </DropdownItem>
                  <DropdownItem 
                    onPress={() => { setColAlign(ctxMenu.key, 'right'); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="21" y1="6" x2="3" y2="6"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                        <line x1="21" y1="18" x2="7" y2="18"/>
                      </svg>
                    }
                  >
                    Align right
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Sorting">
                  <DropdownItem 
                    onPress={() => { setSortDescriptor({ column: ctxMenu.key, direction: sortDescriptor.direction === 'ascending' ? 'descending' : 'ascending' }); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M7 12h10"/>
                        <path d="M10 18h4"/>
                      </svg>
                    }
                  >
                    Sort: {sortDescriptor.column === ctxMenu.key ? (sortDescriptor.direction === 'ascending' ? 'Ascending' : 'Descending') : 'Set sort'}
                  </DropdownItem>
                  <DropdownItem 
                    onPress={() => { setSortDescriptor({ column: ctxMenu.key, direction: 'ascending' }); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M6 12h12"/>
                        <path d="M9 18h6"/>
                      </svg>
                    }
                  >
                    Sort Ascending
                  </DropdownItem>
                  <DropdownItem 
                    onPress={() => { setSortDescriptor({ column: ctxMenu.key, direction: 'descending' }); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 6h6"/>
                        <path d="M6 12h12"/>
                        <path d="M3 18h18"/>
                      </svg>
                    }
                  >
                    Sort Descending
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Column options">
                  <DropdownItem 
                    onPress={() => { hideCol(ctxMenu.key); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <path d="M1 1l22 22"/>
                      </svg>
                    }
                  >
                    Hide column
                  </DropdownItem>
                  <DropdownItem 
                    onPress={() => { resetWidth(ctxMenu.key); closeMenu(); }}
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M8 12h8"/>
                        <path d="M3 18h18"/>
                      </svg>
                    }
                  >
                    Reset width
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Show columns">
                  {INITIAL_COLS.filter(c => !cols[c.key]?.visible).map(c => (
                    <DropdownItem 
                      key={c.key} 
                      onPress={() => { showCol(c.key); closeMenu(); }}
                      startContent={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      }
                    >
                      • {c.label}
                    </DropdownItem>
                  ))}
                  {INITIAL_COLS.every(c => cols[c.key]?.visible) && (
                    <DropdownItem key="none-hidden" isDisabled className="text-gray-400">— none hidden —</DropdownItem>
                  )}
                  <DropdownItem 
                    onPress={() => { showAll(); closeMenu(); }} 
                    className="border-t"
                    startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 6h13"/>
                        <path d="M8 12h13"/>
                        <path d="M8 18h13"/>
                        <path d="M3 6h.01"/>
                        <path d="M3 12h.01"/>
                        <path d="M3 18h.01"/>
                      </svg>
                    }
                  >
                    Show all
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        </>
      )}

          {/* Footer bar outside the scroller — never clipped */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-black/10 rounded-b-2xl bg-black/5">
            <span className="text-sm text-[var(--muted-text)]">{sorted.length} row(s)</span>
            <Button
              variant="solid"
              color="danger"
              isLoading={loadingMore}
              onPress={loadMore}
              isDisabled={!hasMore}
            >
              {hasMore ? "Load more" : "No more data"}
            </Button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen} size="lg" backdrop="blur" placement="center">
        <ModalContent>
          <ModalHeader className="text-lg font-semibold">Edit role</ModalHeader>
          <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Job title"
              value={form.jobTitle ?? ""}
              onValueChange={(v) => setForm((f) => ({...f, jobTitle: v}))}
            />
            <Select
              label="Role type"
              selectedKeys={new Set([form.roleType ?? "Internal"])}
              onSelectionChange={(keys) => setForm((f) => ({...f, roleType: Array.from(keys)[0]}))}
            >
              {["Internal","External"].map((rt) => <SelectItem key={rt}>{rt}</SelectItem>)}
            </Select>
            <Select
              label="GCM"
              selectedKeys={new Set([form.gcm ?? "0"])}
              onSelectionChange={(keys) => setForm((f) => ({...f, gcm: String(Array.from(keys)[0])}))}
            >
              {Array.from({length:10}, (_,i)=>String(i)).map((g) => <SelectItem key={g}>{g}</SelectItem>)}
            </Select>
            <Input
              label="Hiring manager"
              value={form.hiringManager ?? ""}
              onValueChange={(v) => setForm((f) => ({...f, hiringManager: v}))}
            />
            <Input
              label="Recruiter"
              value={form.recruiter ?? ""}
              onValueChange={(v) => setForm((f) => ({...f, recruiter: v}))}
            />
            <Select
              label="Practice"
              selectedKeys={new Set([form.practice ?? PRACTICES[0]])}
              onSelectionChange={(keys) => setForm((f) => ({...f, practice: Array.from(keys)[0]}))}
            >
              {PRACTICES.map((p) => <SelectItem key={p}>{p}</SelectItem>)}
            </Select>
            <Select
              label="Client"
              selectedKeys={new Set([form.client ?? CLIENTS[0]])}
              onSelectionChange={(keys) => setForm((f) => ({...f, client: Array.from(keys)[0]}))}
            >
              {CLIENTS.map((c) => <SelectItem key={c}>{c}</SelectItem>)}
            </Select>
            <Select
              label="Status"
              selectedKeys={new Set([form.status ?? "Open"])}
              onSelectionChange={(keys) => setForm((f) => ({...f, status: Array.from(keys)[0]}))}
            >
              {STATUSES.map((s) => <SelectItem key={s}>{s}</SelectItem>)}
            </Select>
            <div className="md:col-span-2">
              <Textarea
                label="Risk reasons"
                minRows={3}
                value={form.riskReasons ?? ""}
                onValueChange={(v) => setForm((f) => ({...f, riskReasons: v}))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeEdit}>Cancel</Button>
            <Button color="warning" onPress={saveEdit}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
