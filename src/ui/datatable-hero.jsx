import React, { useMemo, useState, useEffect, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { Button } from "./index.js";

// Portal-based Dropdown with basic positioning (side="left", align="end")
function Dropdown({ trigger, children, portalContainer = typeof document !== 'undefined' ? document.body : null, side = 'left', align = 'end', sideOffset = 6, collisionPadding = 12 }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [menuSize, setMenuSize] = useState({ w: 0, h: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      const t = triggerRef.current;
      const m = menuRef.current;
      if (t && t.contains(e.target)) return; // allow toggle by trigger
      if (m && m.contains(e.target)) return; // clicks inside menu don't close immediately
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick, true);
    return () => document.removeEventListener('mousedown', onDocClick, true);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const t = triggerRef.current;
    const m = menuRef.current;
    if (!t || !m) return;
    const rect = t.getBoundingClientRect();
    // Measure menu
    const mw = m.offsetWidth || 200;
    const mh = m.offsetHeight || 44;
    let left = rect.right;
    let top = rect.bottom;
    if (side === 'left') {
      left = rect.left - mw - sideOffset;
      if (align === 'end') {
        top = rect.bottom - mh;
      } else if (align === 'center') {
        top = rect.top + rect.height / 2 - mh / 2;
      } else {
        top = rect.top;
      }
    } else if (side === 'right') {
      left = rect.right + sideOffset;
      top = align === 'end' ? rect.bottom - mh : align === 'center' ? rect.top + rect.height / 2 - mh / 2 : rect.top;
    } else { // bottom
      top = rect.bottom + sideOffset;
      left = align === 'end' ? rect.right - mw : align === 'center' ? rect.left + rect.width / 2 - mw / 2 : rect.left;
    }
    // Collision handling within viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    left = Math.max(collisionPadding, Math.min(left, vw - collisionPadding - mw));
    top = Math.max(collisionPadding, Math.min(top, vh - collisionPadding - mh));
    setMenuSize({ w: mw, h: mh });
    setPos({ left, top });
  }, [open, side, align, sideOffset, collisionPadding]);

  return (
    <div className="relative inline-block">
      <span ref={triggerRef} onClick={() => setOpen((v) => !v)}>{trigger}</span>
      {open && portalContainer && (
        ReactDOM.createPortal(
          <div
            ref={menuRef}
            className="z-[1000] fixed min-w-[180px] rounded-lg border border-black/10 bg-[var(--card-bg)] shadow-lg p-2"
            style={{ left: `${pos.left}px`, top: `${pos.top}px`, overflow: 'visible' }}
            onClick={() => setOpen(false)}
          >
            {children}
          </div>,
          portalContainer
        )
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, ...props }) {
  return (
    <input type="checkbox" checked={checked} onChange={e => onChange?.(e.target.checked)} className="accent-[var(--accent)] rounded border-gray-300" {...props} />
  );
}

function Chip({ children, variant }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const variants = {
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-rose-500/10 text-rose-600",
    default: "bg-[var(--hover-bg)] text-[var(--text)]/80"
  };
  return <span className={`${base} ${variants[variant] || variants.default}`}>{children}</span>;
}

function Pagination({ table, pageSizeOptions }) {
  return (
    <div className="flex items-center gap-4 justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--text)]/60">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} size="sm">Prev</Button>
        <Button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} size="sm">Next</Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs">Rows per page:</span>
        <select
          className="rounded border px-2 py-1 text-xs bg-[var(--surface-bg)]"
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function DataTableHero({
  columns,
  data,
  searchAccessorKey,
  statusFilter,
  defaultVisible,
  pageSizeOptions = [5, 10, 15],
  actionsSlot,
  onViewRow,
  onEditRow,
  onDeleteRow,
  onBulkDelete,
  getRowId,
  showTopToolbar = true,
  maxBodyHeight = null,
  boldColumns = [],
  headerTint = "accent"
}) {
  // State
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState(() => {
    try {
      const saved = localStorage.getItem('datatable-roles-visibility');
      if (saved) return JSON.parse(saved);
    } catch {}
    if (!defaultVisible) return undefined;
    const vis = {};
    (columns || []).forEach(col => { const id = col.id ?? col.uid ?? col.accessorKey; if (id) vis[id] = defaultVisible.includes(id); });
    return vis;
  });
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState(() => {
    try {
      const saved = localStorage.getItem('datatable-roles-sort');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = localStorage.getItem('datatable-roles-widths');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  React.useEffect(() => {
    const t = setTimeout(() => setGlobalFilter(searchInput), 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Normalize columns: compute consistent keys/names
  const normalizedColumns = useMemo(() => {
    return (columns || []).map(col => {
      const key = col.uid ?? col.id ?? col.accessorKey;
      const name = col.name ?? col.header ?? String(key);
      return { ...col, id: key, accessorKey: key, header: name, _key: key, _name: name };
    });
  }, [columns]);

  // Custom global filter: only search the searchAccessorKey
  const table = useReactTable({
    columns: useMemo(() => [
      // Selection column
      {
        id: "_select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        ),
        size: 36,
        enableSorting: false,
        enableResizing: false
      },
      ...normalizedColumns.map(col => ({
        ...col,
        id: col._key,
        accessorKey: col._key,
        header: col._name,
        cell: (info) => {
          const raw = info.getValue();
          if (col.meta?.chip) {
            return <Chip variant={statusChipVariant(raw)}>{raw}</Chip>;
          }
          const key = col._key;
          if (Array.isArray(raw)) return raw.join(', ');
          if (key === 'dateCreated') {
            if (!raw) return '';
            const d = raw instanceof Date ? raw : new Date(raw);
            if (isNaN(d)) return String(raw);
            return d.toISOString().slice(0, 10);
          }
          return String(raw ?? '');
        },
        meta: col.meta,
        filterFn: (statusFilter && col.accessorKey === statusFilter.accessorKey) ? 'statusMulti' : col.filterFn
      })),
      // Actions column
      {
        id: "_actions",
        header: "",
        cell: ({ row }) => (
          <Dropdown trigger={<Button size="icon" variant="ghost">⋯</Button>}>
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="ghost" onClick={() => onViewRow?.(row.original)}>View</Button>
              <Button size="sm" variant="ghost" onClick={() => onEditRow?.(row.original)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => onDeleteRow?.(row.original)}>Delete</Button>
            </div>
          </Dropdown>
        ),
        size: 48,
        enableSorting: false,
        enableResizing: false
      }
    ], [normalizedColumns, onViewRow, onEditRow, onDeleteRow]),
    data,
    state: {
      globalFilter,
      columnVisibility,
      columnFilters,
      rowSelection,
      sorting
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(columnVisibility) : updater;
      setColumnVisibility(next);
      try { localStorage.setItem('datatable-roles-visibility', JSON.stringify(next)); } catch {}
    },
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      try { localStorage.setItem('datatable-roles-sort', JSON.stringify(next)); } catch {}
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    getRowId: (originalRow, index, parent) => {
      try {
        const fromProp = typeof getRowId === 'function' ? getRowId(originalRow, index, parent) : undefined;
        const id = fromProp ?? (originalRow?.id ?? index);
        return String(id);
      } catch {
        return String(originalRow?.id ?? index);
      }
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (!searchAccessorKey) return true;
      const v = row.getValue(searchAccessorKey);
      return String(v || "").toLowerCase().includes(String(filterValue || "").toLowerCase());
    },
    filterFns: {
      statusMulti: (row, columnId, filterValue) => {
        if (!filterValue?.length) return true;
        return filterValue.includes(row.getValue(columnId));
      }
    },
    initialState: {
      columnVisibility: columnVisibility,
      pagination: { pageSize: pageSizeOptions[0] || 10 }
    }
  });

  // Column resizing handlers
  const isMouseDownRef = useRef(false);
  const startPosRef = useRef({ x: 0, key: null, startWidth: 0 });
  const startResize = (e, key) => {
    const current = colWidths[key] || 0;
    startPosRef.current = { x: e.clientX, key, startWidth: current };
    isMouseDownRef.current = true;
    e.preventDefault();
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!isMouseDownRef.current) return;
      const { x, key, startWidth } = startPosRef.current;
      const delta = e.clientX - x;
      const newWidth = Math.max(96, (startWidth || 0) + delta);
      setColWidths(prev => ({ ...prev, [key]: newWidth }));
    };
    const onUp = () => {
      if (!isMouseDownRef.current) return;
      isMouseDownRef.current = false;
      try { localStorage.setItem('datatable-roles-widths', JSON.stringify(colWidths)); } catch {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [colWidths]);

  // Status filter logic
  const statusColId = statusFilter?.accessorKey;
  const statusOptions = statusFilter?.options || [];
  const statusValues = columnFilters.find(f => f.id === statusColId)?.value || [];
  function toggleStatusValue(val) {
    setColumnFilters(filters => {
      const prev = filters.find(f => f.id === statusColId)?.value || [];
      const next = prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val];
      return [
        ...filters.filter(f => f.id !== statusColId),
        { id: statusColId, value: next }
      ];
    });
  }

  // Column chooser logic
  const allLeafColumns = table.getAllLeafColumns().filter(col => !col.id.startsWith("_"));

  // Chip color mapping
  function statusChipVariant(val) {
    if (typeof val !== "string") return "default";
    if (["Open", "Active", "Success"].includes(val)) return "success";
    if (["On Leave", "Warning"].includes(val)) return "warning";
    if (["Closed", "Danger", "Error"].includes(val)) return "danger";
    return "default";
  }

  // Selection summary
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  // Color mapping for risk reason dots
  function dotColorFor(reason) {
    const r = (reason || "").toLowerCase();
    if (r.includes("salary")) return "#f59e0b"; // amber
    if (r.includes("client")) return "#38bdf8"; // sky
    if (r.includes("scope")) return "#a78bfa"; // violet
    return "rgba(0,0,0,.3)"; // default
  }

  // Cell renderer for special columns
  function renderCell(item, col) {
    const raw = item[col._key];
    
    // Handle arrays
    if (Array.isArray(raw)) {
      return raw.join(", ");
    }
    
    // Date formatting for dateCreated
    if (col._key === "dateCreated" && raw) {
      try {
        const d = new Date(raw);
        return new Intl.DateTimeFormat("en-GB", { 
          day: "2-digit", 
          month: "long", 
          year: "numeric" 
        }).format(d);
      } catch {
        return raw;
      }
    }
    
    // Role Type coloring
    if (col._key === "roleType" && raw) {
      if (raw === "External") {
        return <span className="text-amber-600">{raw}</span>;
      }
      if (raw === "Internal") {
        return <span className="text-indigo-600">{raw}</span>;
      }
      return raw;
    }
    
    // Risk reasons as chips with colored dots
    if (col._key === "riskReason" && raw) {
      if (Array.isArray(raw)) {
        return (
          <div className="flex flex-wrap gap-1">
            {raw.map((reason, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-xs mr-2">
                <span 
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: dotColorFor(reason) }}
                />
                {reason}
              </span>
            ))}
          </div>
        );
      }
      return raw; // Not array, show as string
    }
    
    return raw;
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-[var(--card-bg)] shadow-sm">
      {/* Toolbar */}
      {showTopToolbar && (
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-black/5 bg-[var(--surface-bg)] sticky top-0 z-10">
        {/* Search */}
        {searchAccessorKey && (
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="w-48 px-3 py-2 rounded-lg border text-sm bg-[var(--card-bg)] border-black/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        )}
        {/* Status filter */}
        {statusColId && (
          <Dropdown
            trigger={<Button variant="outline" size="sm">Status{statusValues.length ? ` (${statusValues.length})` : ""}</Button>}
          >
            <div className="flex flex-col gap-1">
              {statusOptions.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 px-2 py-1 cursor-pointer">
                  <Checkbox checked={statusValues.includes(opt.value)} onChange={() => toggleStatusValue(opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </Dropdown>
        )}
        {/* Column chooser */}
        <Dropdown
          trigger={<Button variant="outline" size="sm">Columns</Button>}
        >
          <div className="flex flex-col gap-1">
            {allLeafColumns.map(col => (
              <label key={col.id} className="flex items-center gap-2 px-2 py-1 cursor-pointer">
                <Checkbox checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} />
                <span>{col.columnDef.header}</span>
              </label>
            ))}
          </div>
        </Dropdown>
        {/* Actions slot */}
        <div className="ml-auto">{actionsSlot}</div>
      </div>
      )}
      {/* Table */}
      <div className={maxBodyHeight ? "overflow-x-auto overflow-y-auto" : "overflow-x-auto overflow-y-visible"} style={maxBodyHeight ? { maxHeight: maxBodyHeight } : undefined}>
        <table className="w-full text-left rounded-2xl overflow-visible">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr className="bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]" key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIdx) => {
                  const align = header.column.columnDef?.meta?.align;
                  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
                  const key = header.column.id;
                  const widthPx = colWidths[key];
                  const isFirst = headerIdx === 0;
                  const isLast = headerIdx === headerGroup.headers.length - 1;
                  const cornerClass = isFirst ? 'rounded-tl-2xl' : isLast ? 'rounded-tr-2xl' : '';
                  
                  return (
                  <th
                    key={header.id}
                    className={`relative px-3 py-2 text-xs font-bold text-[var(--text)] select-none cursor-pointer border-t border-black/5 first:border-l-0 border-l ${cornerClass} ${alignClass}`}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{ width: widthPx ? `${widthPx}px` : undefined, minWidth: 96 }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === "asc" ? " ▲" : header.column.getIsSorted() === "desc" ? " ▼" : null}
                      </span>
                    )}
                    {/* Resizer handle (skip selection/actions) */}
                    {!key.startsWith('_') && (
                      <span
                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize select-none"
                        onMouseDown={(e) => startResize(e, key)}
                        title="Drag to resize"
                      />
                    )}
                  </th>
                );})}
              </tr>
            ))}
          </thead>
          <tbody className="overflow-visible">
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-sm text-[var(--text)]/60" colSpan={table.getAllLeafColumns().length}>
                  No roles found
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row, rowIdx) => {
              const isLastRow = rowIdx === table.getRowModel().rows.length - 1;
              return (
                <tr key={row.id} className="hover:bg-[var(--hover-bg)] transition-colors">
                  {row.getVisibleCells().map((cell, cellIdx) => {
                    const align = cell.column.columnDef?.meta?.align;
                    const alignClass = align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : 'text-left';
                    const key = cell.column.id;
                    const widthPx = colWidths[key];
                    const isBold = cell.column.columnDef?.meta?.bold;
                    const boldClass = isBold ? 'font-semibold' : '';
                    
                    const isFirstCell = cellIdx === 0;
                    const isLastCell = cellIdx === row.getVisibleCells().length - 1;
                    const cornerClass = isLastRow ? (isFirstCell ? 'rounded-bl-2xl' : isLastCell ? 'rounded-br-2xl' : '') : '';
                    
                    return (
                    <td key={cell.id} className={`px-3 py-2 text-sm border-t border-black/5 first:border-l-0 border-l ${alignClass} ${boldClass} ${cornerClass}`} style={{ width: widthPx ? `${widthPx}px` : undefined, minWidth: 96, overflow: 'visible' }}>
                      {renderCell(row.original, cell.column)}
                    </td>
                  );})}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-black/5 bg-[var(--surface-bg)] text-xs">
        <div className="flex items-center gap-3">
          {selectedCount > 0 ? (
            <>
              <span>{selectedCount} of {totalCount} selected</span>
              {onBulkDelete && (
                <Button size="sm" variant="destructive" onClick={() => {
                  const selectedRows = table.getFilteredSelectedRowModel().rows.map(r => r.original);
                  Promise.resolve(onBulkDelete(selectedRows)).finally(() => setRowSelection({}));
                }}>Delete Selected</Button>
              )}
            </>
          ) : (
            <span>{totalCount} rows</span>
          )}
        </div>
        <Pagination table={table} pageSizeOptions={pageSizeOptions} />
      </div>
    </div>
  );
}
