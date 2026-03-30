import { cn } from "@/lib/utils";

const transactions = [
  { id: "TXN-001", user: "Sarah Connor", type: "Payment", amount: "$1,250.00", status: "Completed", date: "Mar 22, 2026" },
  { id: "TXN-002", user: "James Wilson", type: "Refund", amount: "$340.00", status: "Processing", date: "Mar 22, 2026" },
  { id: "TXN-003", user: "Emily Zhang", type: "Payment", amount: "$2,100.00", status: "Completed", date: "Mar 21, 2026" },
  { id: "TXN-004", user: "Michael Park", type: "Subscription", amount: "$49.99", status: "Completed", date: "Mar 21, 2026" },
  { id: "TXN-005", user: "Lisa Kumar", type: "Payment", amount: "$890.00", status: "Failed", date: "Mar 20, 2026" },
  { id: "TXN-006", user: "David Chen", type: "Payment", amount: "$3,400.00", status: "Completed", date: "Mar 20, 2026" },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  Processing: "bg-warning/10 text-warning",
  Failed: "bg-destructive/10 text-destructive",
};

const ActivityTable = () => {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
          View All →
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Transaction</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
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
                <td className="px-5 py-3.5 text-sm font-medium text-foreground">{tx.amount}</td>
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
