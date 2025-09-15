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

function mkRow(i) {
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
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
  "Open":    { color: "success",   label: "Open" },
  "At Risk": { color: "warning",   label: "At Risk" },
  "Paused":  { color: "secondary", label: "Paused" },
};

export default function RolesAtRiskTableV2() {
  // raw rows (append on "Load more")
  const [rows, setRows] = useState(() => mkBatch(1, 12));
  const [offset, setOffset] = useState(13);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ui state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(new Set([])); // heroUI selection set
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [sortDescriptor, setSortDescriptor] = useState({column: "gcm", direction: "ascending"});

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    // simulate latency
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
      // basic type-aware sorting
      const isDate = column === "dateCreated";
      if (isDate) {
        x = new Date(x).getTime();
        y = new Date(y).getTime();
      }
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

  // empty content
  const empty = (
    <div className="py-8 text-sm text-[var(--muted-text)]">
      No rows to display.
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--surface-bg)] p-6">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <h1 className="text-2xl font-bold">Roles at Risk — v2 (HeroUI)</h1>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            isClearable
            className="w-[280px]"
            placeholder="Search roles…"
            value={search}
            onValueChange={setSearch}
            onClear={() => setSearch("")}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" className="capitalize">
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
              {STATUSES.map(s => (
                <DropdownItem key={s}>{s}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button variant="flat" onPress={() => setStatusFilter(new Set())} disabled={!statusFilter.size}>
            Clear filters
          </Button>
        </div>

        {/* Table */}
        <Table
          aria-label="Roles at Risk table"
          className="rounded-2xl shadow-md border"
          selectionMode="single"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          color="warning"                 // selection color
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          isHeaderSticky
          // HeroUI/NextUI props: provide custom content areas
          bottomContent={
            <div className="flex items-center justify-between p-3">
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
              <TableColumn key={col.key} allowsSorting className="text-center">
                {col.label}
              </TableColumn>
            ))}
          </TableHeader>

          <TableBody
            items={sorted}
            emptyContent={empty}
            isLoading={false}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.jobRecId}</TableCell>
                <TableCell>{item.romaId}</TableCell>
                <TableCell>{item.roleType}</TableCell>
                <TableCell className="font-medium">{item.jobTitle}</TableCell>
                <TableCell>{item.gcm}</TableCell>
                <TableCell>{item.hiringManager}</TableCell>
                <TableCell>{item.recruiter}</TableCell>
                <TableCell>{item.practice}</TableCell>
                <TableCell>{item.client}</TableCell>
                <TableCell>{new Date(item.dateCreated).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={statusMap[item.status]?.color || "default"}
                  >
                    {statusMap[item.status]?.label || item.status}
                  </Chip>
                </TableCell>
                <TableCell title={item.riskReasons} className="max-w-[320px] truncate">
                  {item.riskReasons}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
