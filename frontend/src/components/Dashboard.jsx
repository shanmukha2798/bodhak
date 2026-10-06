import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTip, XAxis, YAxis } from "recharts";
import { HowCalculated } from "@/components/ScoreBadge";

const Stat = ({ label, value, sub, testId }) => (
  <div className="bk-card p-6" data-testid={testId}>
    <div className="text-xs font-semibold uppercase tracking-wide text-[#6e6e73]">{label}</div>
    <div className="text-4xl font-semibold tracking-tight mt-1">{value}</div>
    {sub && <div className="mt-2">{sub}</div>}
  </div>
);

const ChartCard = ({ title, hint, children, testId }) => (
  <div className="bk-card p-6" data-testid={testId}>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-xs text-[#86868b] mb-4">{hint}</p>
    {children}
  </div>
);

const tipStyle = { borderRadius: 12, border: "1px solid #e5e5ea", boxShadow: "0 4px 24px -2px rgba(0,0,0,0.08)", fontSize: 12 };

export const Dashboard = ({ data }) => {
  if (!data) return null;
  const hasStories = data.story_count > 0;
  return (
    <div className="space-y-4" data-testid="instructor-dashboard">
      <div className="grid sm:grid-cols-2 gap-4">
        <Stat label="Bodhak Score" value={data.bodhak_score == null ? "–" : `${data.bodhak_score.toFixed(1)} / 5`} sub={<HowCalculated testId="dashboard-how-calculated" />} testId="dashboard-score" />
        <Stat label="Learner stories" value={data.story_count} sub={<span className="text-xs text-[#86868b]">Across all platforms you teach on</span>} testId="dashboard-stories" />
      </div>
      {!hasStories ? (
        <div className="bk-card p-6 text-sm text-[#6e6e73]" data-testid="dashboard-empty">Charts appear here once learners share their first story about you.</div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Rating by platform" hint="Average learner rating on each platform" testId="chart-by-platform">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.rating_by_platform} barSize={28}>
                <CartesianGrid vertical={false} stroke="#f0f0f2" />
                <XAxis dataKey="platform" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} width={24} />
                <ChartTip cursor={{ fill: "#f5f5f7" }} contentStyle={tipStyle} formatter={(v, _n, p) => [`${v} (${p.payload.count} stories)`, "Rating"]} />
                <Bar dataKey="rating" fill="#0071e3" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Rating trend over time" hint="Average rating of stories received each month" testId="chart-trend">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.trend}>
                <CartesianGrid vertical={false} stroke="#f0f0f2" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} />
                <YAxis domain={[2.5, 5]} ticks={[3, 4, 5]} tick={{ fontSize: 11, fill: "#6e6e73" }} axisLine={false} tickLine={false} width={24} />
                <ChartTip contentStyle={tipStyle} />
                <Line type="monotone" dataKey="rating" name="That month" stroke="#0071e3" strokeWidth={2.5} dot={{ r: 4, fill: "#0071e3", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cumulative" name="Running average" stroke="#86868b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
};
