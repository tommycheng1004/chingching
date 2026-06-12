"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#db2777", "#f472b6", "#9d174d", "#f0a8c0", "#fbbf24", "#a98c99"];

type Series = { name: string; count: number }[];

export default function Charts({
  byAge,
  byFund,
  byPlan,
  byTime,
}: {
  byAge: Series;
  byFund: Series;
  byPlan: Series;
  byTime: Series;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Panel title="年齡分布">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byAge}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#db2777" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="職業分布">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={byFund} dataKey="count" nameKey="name" outerRadius={90} label>
              {byFund.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="諮詢方案">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={byPlan} dataKey="count" nameKey="name" outerRadius={90} label>
              {byPlan.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="地區分布">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byTime}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis allowDecimals={false} fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#f472b6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}
