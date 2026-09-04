import { Badge } from "@/components/ui/badge";

const MAP = {
  "Waiting Payment": { label: "Waiting Payment", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400" },
  "Waiting Admin Confirmation": { label: "Waiting Confirmation", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" },
  "Completed": { label: "Completed", cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" },
  "Payment Rejected": { label: "Rejected", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" },
};

export function StatusBadge({ status, testId }) {
  const cfg = MAP[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <Badge
      data-testid={testId}
      variant="secondary"
      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </Badge>
  );
}
