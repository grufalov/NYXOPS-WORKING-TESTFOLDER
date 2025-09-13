import React from 'react';
import { flag } from '../config/flags.js';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

// Fallback HTML table renderer using provided columns [{header, accessorKey}] and data
function FallbackTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--surface-bg)]">
      <table className="w-full text-left">
        <thead className="bg-[var(--card-bg)]">
          <tr>
            {columns.map((col) => (
              <th key={col.accessorKey} className="px-3 py-2 border-b border-[var(--surface-bg)] text-sm font-semibold">
                {typeof col.header === 'function' ? col.header() : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[var(--card-bg)]">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-[var(--hover-bg)]">
              {columns.map((col) => (
                <td key={col.accessorKey} className="px-3 py-2 border-b border-[var(--surface-bg)] text-sm">
                  {String(row[col.accessorKey] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TanStackTableImpl({ columns = [], data = [] }) {
  const table = useReactTable({ columns, data, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto rounded-md border border-[var(--surface-bg)]">
      <table className="w-full text-left">
        <thead className="bg-[var(--card-bg)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 border-b border-[var(--surface-bg)] text-sm font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-[var(--card-bg)]">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-[var(--hover-bg)]">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 border-b border-[var(--surface-bg)] text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Table(props) {
  const enabled = flag('NEW_TABLE');
  if (!enabled) return <FallbackTable {...props} />;
  return <TanStackTableImpl {...props} />;
}

/*
  .env.local example to enable this probe:
  VITE_NEW_TABLE=true
*/
