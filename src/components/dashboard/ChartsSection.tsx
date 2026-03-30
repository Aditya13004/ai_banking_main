import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend
} from "recharts";

// Applications started vs completed (showing increasing AI conversion efficiency)
const applicationData = [
  { name: "Jan", started: 2100, completed: 1200 },
  { name: "Feb", started: 2800, completed: 1800 },
  { name: "Mar", started: 3200, completed: 2400 },
  { name: "Apr", started: 4100, completed: 3400 },
  { name: "May", started: 4500, completed: 4000 },
  { name: "Jun", started: 5200, completed: 4900 },
  { name: "Jul", started: 5800, completed: 5600 },
];

// KYC Validations showing auto-approval rates vs manual review (AI Agent value prop)
const validationData = [
  { name: "Jan", autoApproved: 800, manualReview: 350, rejected: 50 },
  { name: "Feb", autoApproved: 1300, manualReview: 400, rejected: 100 },
  { name: "Mar", autoApproved: 1900, manualReview: 400, rejected: 100 },
  { name: "Apr", autoApproved: 2900, manualReview: 350, rejected: 150 },
  { name: "May", autoApproved: 3500, manualReview: 300, rejected: 200 },
  { name: "Jun", autoApproved: 4400, manualReview: 250, rejected: 250 },
];

const pieData = [
  { name: "Retail Savings", value: 3800 },
  { name: "Digital-Only", value: 2400 },
  { name: "SME Current", value: 1500 },
  { name: "Re-KYC", value: 800 },
];

const COLORS = [
  "hsl(239, 84%, 67%)", // Primary Blue
  "hsl(199, 89%, 48%)", // Secondary Cyan
  "hsl(152, 69%, 47%)", // Success Green
  "hsl(38, 92%, 50%)",  // Warning Yellow
];

const STATUS_COLORS = {
  autoApproved: "hsl(152, 69%, 47%)", // Green
  manualReview: "hsl(38, 92%, 50%)",  // Yellow
  rejected: "hsl(346, 87%, 60%)",     // Red
};

const tooltipStyle = {
  backgroundColor: "hsl(228, 14%, 14%)",
  border: "1px solid hsl(228, 14%, 22%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 92%)",
  fontSize: "13px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
};

const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
    {subtitle && <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>}
    {children}
  </div>
);

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Area Chart: Application Funnel */}
      <ChartCard title="Applications Funnel" subtitle="Started vs Successfully Completed">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={applicationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 14%, 18%)" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(215, 15%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 15%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="started" name="Started" stroke={COLORS[1]} fillOpacity={1} fill="url(#colorStarted)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke={COLORS[0]} fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Bar Chart: Verification Automation */}
      <ChartCard title="Verification Outcomes" subtitle="AI Auto-Approval vs Operations Handoffs">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={validationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 14%, 18%)" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(215, 15%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 15%, 40%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(228, 14%, 18%)', opacity: 0.4 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="autoApproved" name="Auto-Approved" stackId="a" fill={STATUS_COLORS.autoApproved} radius={[0, 0, 4, 4]} />
              <Bar dataKey="manualReview" name="Manual Review" stackId="a" fill={STATUS_COLORS.manualReview} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill={STATUS_COLORS.rejected} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Pie Chart: Account Distributions */}
      <ChartCard title="Onboarding Demographics" subtitle="Distribution by account type requested">
        <div className="h-64 flex flex-col items-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity duration-300 outline-none" style={{ filter: `drop-shadow(0px 4px 6px ${COLORS[index % COLORS.length]}40)` }} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 w-full mt-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[i], boxShadow: `0 0 8px ${COLORS[i]}` }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default ChartsSection;
