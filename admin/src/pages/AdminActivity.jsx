import { useEffect, useState } from "react";
import { Activity, ShieldCheck, Clock, RefreshCw } from "lucide-react";
import DataTable from "../components/DataTable.jsx";
import Button from "../components/Button.jsx";
import { getAuditLogs } from "../services/audit.js";
import { formatDateTime } from "../utils/date.js";

export default function AdminActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const res = await getAuditLogs(100);
    if (res.data) setLogs(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns = [
    {
      header: "Timestamp",
      accessor: "created_at",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{formatDateTime(row.created_at)}</span>,
    },
    {
      header: "Administrator",
      accessor: "admin_profiles.full_name",
      render: (row) => (
        <span className="font-semibold text-xs text-ink">
          {row.admin_profiles?.full_name || "System Admin"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold uppercase text-maroon bg-maroon-surface px-2.5 py-1 rounded border border-maroon/20">
          {row.action.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Audit Details",
      accessor: "details",
      render: (row) => (
        <div className="max-w-md text-xs text-muted truncate">
          {typeof row.details === "object" ? JSON.stringify(row.details) : row.details || "—"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Admin Activity Logs</h1>
          <p className="text-xs text-muted mt-1">
            Real-time audit trail of product changes, stock adjustments, batch creation, and logins.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadLogs} icon={RefreshCw}>
          Refresh Log
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Filter activity logs by action, admin, details..."
        emptyMessage="No administrative activities logged yet."
      />
    </div>
  );
}
