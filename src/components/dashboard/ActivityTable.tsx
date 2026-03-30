import { cn } from "@/lib/utils";

const transactions = [
  { id: "APP-001", user: "Sarah Connor", type: "Retail Savings", score: "Low Risk", status: "Approved", date: "Mar 22, 2026" },
  { id: "APP-002", user: "James Wilson", type: "Digital-Only", score: "Medium Risk", status: "Pending", date: "Mar 22, 2026" },
  { id: "APP-003", user: "Emily Zhang", type: "SME Current", score: "Low Risk", status: "Approved", date: "Mar 21, 2026" },
  { id: "APP-004", user: "Michael Park", type: "Re-KYC", score: "Low Risk", status: "Approved", date: "Mar 21, 2026" },
  { id: "APP-005", user: "Lisa Kumar", type: "Digital-Only", score: "High Risk", status: "Rejected", date: "Mar 20, 2026" },
  { id: "APP-006", user: "David Chen", type: "Retail Savings", score: "Low Risk", status: "Approved", date: "Mar 20, 2026" },
];

const statusStyles: Record<string, string> = {
  Approved: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Rejected: "bg-destructive/10 text-destructive",
};

const ActivityTable = () => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Onboarding Activity</h3>
        <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          View All →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">App ID</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Applicant</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Account Type</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Risk Score</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/30"
              >
                <td className="px-5 py-3.5 text-sm font-mono text-primary">{tx.id}</td>
                <td className="px-5 py-3.5 text-sm text-foreground">{tx.user}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{tx.type}</td>
                <td className="px-5 py-3.5 text-sm font-medium text-foreground">{tx.score}</td>
                <td className="px-5 py-3.5">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[tx.status])}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
