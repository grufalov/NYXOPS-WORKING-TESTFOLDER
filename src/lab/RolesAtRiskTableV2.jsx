import React, {useMemo, useState, useCallback} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@heroui/react";

// ---- mock data helpers (replace with Supabase later) ----
const STATUSES = ["Open", "At Risk", "Paused"];
const PRACTICES = ["Advisory", "Cloud", "Data", "Security"];
const CLIENTS = ["Globex", "Initech", "Umbrella", "Hooli"];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function mkRow(i) {
  return {
    id: `row-${i}`,
    jobRecId: 1000 + i,
    romaId: `ROMA-${2000 + i}`,
    roleType: i % 2 ? "Contract" : "Full-time",
    jobTitle: ["FE Engineer", "BE Engineer", "Data Analyst", "PM"][i % 4],
    gcm: ["L1", "L2", "L3", "L4"][i % 4],
    hiringManager: ["Kim", "Jordan", "Riley", "Alex"][i % 4],
    recruiter: ["Sam", "Taylor", "Morgan", "Casey"][i % 4],
    practice: rnd(PRACTICES),
    client: rnd(CLIENTS),
    dateCreated: new Date(Date.now() - i * 86400000).toISOString(),
    status: rnd(STATUSES),
    riskReasons: i % 3 ? "Slow pipeline; client feedback pending" : "No recent activity; role scope unclear",
  };
}
function mkBatch(start, count) {
  return Array.from({length: count}, (_, k) => mkRow(start + k));
}

// Status chip colors
const statusMap = {
  Open:    { color: "success",   label: "Open" },
  "At Risk": { color: "warning",   label: "At Risk" },
  Paused:  { color: "secondary", label: "Paused" },
};

export default function RolesAtRiskTableV2() {
  // rows / pagination-ish
  const [rows, setRows] = useState(() => mkBatch(1, 12));
  const [offset, setOffset] = useState(13);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ui state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(new Set([]));
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState({column: "gcm", direction: "ascending"});

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    await new Promise(r => setTimeout(r, 450));
    const next = mkBatch(offset, 8);
    setRows((prev) => [...prev, ...next]);
    setOffset((n) => n + next.length);
    if (offset > 80) setHasMore(false); // fake end
    setLoadingMore(false);
  }, [offset]);

  // filter + sort (client-side for lab)
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

  // columns
  const columns = [
    { key: "jobRecId",      label: "Job Rec ID" },
    { key: "romaId",        label: "ROMA ID" },
    { key: "roleType",      label: "Role Type" },
    { key: "jobTitle",      label: "Job Title" },
    { key: "gcm",           label: "GCM" },
    { key: "hiringManager", label: "Hiring Manager" },
    { key: "recruiter",     label: "Recruiter" },
    { key: "practice",      label: "Practice" },
    { key: "client",        label: "Client" },
    { key: "dateCreated",   label: "Date Created" },
    { key: "status",        label: "Status" },
    { key: "riskReasons",   label: "Risk Reasons" },
  ];

  // empty state
  const empty = (
    <div className="py-12 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:rgba(0,0,0,0.04)] text-[13px] text-[var(--muted-text)]">
        <span>No rows to display.</span>
      </div>
    </div>
  );

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

        {/* Table */}
        <Table
          aria-label="Roles at Risk table"
          className="rounded-2xl shadow-md border bg-[var(--card-bg)]"
          classNames={{
            wrapper: "rounded-2xl",
            table: "min-w-full",
            th: "text-[13px] font-semibold text-[color:var(--text)]/80 bg-[color:rgba(99,102,241,0.05)] border-b",
            tr: "transition-all",
            td: "text-[13px] py-3",
          }}
          isHeaderSticky
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          color="warning"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          bottomContent={
            <div className="flex items-center justify-between p-3 rounded-b-2xl bg-[color:rgba(0,0,0,0.02)]">
              <span className="text-sm text-[var(--muted-text)]">{sorted.length} row(s)</span>
              <Button
                variant="solid"
                color="warning"
                isLoading={loadingMore}
                onPress={loadMore}
                isDisabled={!hasMore}
              >
                {hasMore ? "Load more" : "No more data"}
              </Button>
            </div>
          }
        >
          <TableHeader>
            {columns.map(col => (
              <TableColumn
                key={col.key}
                allowsSorting
                className={`${["jobRecId","gcm","dateCreated","status"].includes(col.key) ? "text-center" : "text-left"}`}
                width={
                  col.key === "gcm" ? 60 :
                  col.key === "jobRecId" ? 100 :
                  col.key === "dateCreated" ? 120 :
                  col.key === "status" ? 120 :
                  undefined
                }
              >
                {col.label}
              </TableColumn>
            ))}
          </TableHeader>

          <TableBody items={sorted} emptyContent={empty} isLoading={false}>
            {(item) => (
              <TableRow
                key={item.id}
                className="even:bg-[color:rgba(0,0,0,0.015)] hover:bg-[color:rgba(99,102,241,0.06)] hover:shadow-sm hover:-translate-y-[1px] transition-all duration-150"
                onClick={() => setSelectedKeys(new Set([item.id]))}
              >
                <TableCell className="text-center">{item.jobRecId}</TableCell>
                <TableCell>{item.romaId}</TableCell>
                <TableCell>{item.roleType}</TableCell>
                <TableCell className="font-medium">{item.jobTitle}</TableCell>
                <TableCell className="text-center">{item.gcm}</TableCell>
                <TableCell>{item.hiringManager}</TableCell>
                <TableCell>{item.recruiter}</TableCell>
                <TableCell>{item.practice}</TableCell>
                <TableCell>{item.client}</TableCell>
                <TableCell className="text-center">{new Date(item.dateCreated).toLocaleDateString()}</TableCell>
                <TableCell className="text-center">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={statusMap[item.status]?.color || "default"}
                    className="capitalize"
                    startContent={
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          background:
                            statusMap[item.status]?.color === "success" ? "rgb(34,197,94)" :
                            statusMap[item.status]?.color === "warning" ? "rgb(234,179,8)" :
                            "rgb(99,102,241)"
                        }}
                      />
                    }
                  >
                    {statusMap[item.status]?.label || item.status}
                  </Chip>
                </TableCell>
                <TableCell title={item.riskReasons} className="max-w-[360px]">
                  <span className="line-clamp-2">{item.riskReasons}</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
