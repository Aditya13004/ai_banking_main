import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

const lineData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
  { name: "Jul", value: 7000 },
];

const barData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1398 },
  { name: "Mar", value: 4800 },
  { name: "Apr", value: 3908 },
  { name: "May", value: 4800 },
  { name: "Jun", value: 3800 },
];

const pieData = [
  { name: "Enterprise", value: 400 },
  { name: "Pro", value: 300 },
  { name: "Starter", value: 200 },
  { name: "Free", value: 100 },
];

const COLORS = [
  "hsl(239, 84%, 67%)",
  "hsl(199, 89%, 48%)",
  "hsl(152, 69%, 47%)",
  "hsl(38, 92%, 50%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(228, 14%, 14%)",
  border: "1px solid hsl(228, 14%, 22%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 92%)",
  fontSize: "13px",
};

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
    {children}
  </div>
);

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Area/Line Chart */}
      <ChartCard title="Analytics Overview">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 14%, 18%)" />
              <XAxis dataKey="name" stroke="hsl(215, 15%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 15%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="hsl(239, 84%, 67%)" fill="url(#areaGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Bar Chart */}
      <ChartCard title="Monthly Performance">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 14%, 18%)" />
              <XAxis dataKey="name" stroke="hsl(215, 15%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215, 15%, 40%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="hsl(239, 84%, 67%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Pie Chart */}
      <ChartCard title="User Distribution">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={tooltipStyle} />
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
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
