import { useEffect, useState } from "react";
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Inbox,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api, { formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminTraffic() {
  const { settings } = useSettings();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/admin/revenue")
      .then(({ data }) => setData(data))
      .catch(() =>
        setData({
          daily: [],
          monthly: [],
          yearly: [],
          total_revenue: 0,
          total_completed: 0,
        })
      );
  }, []);

  const currency = settings.currency;
  const avgRevenue = data?.total_completed
    ? Math.round(data.total_revenue / data.total_completed)
    : 0;

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="animate-fade-up">
        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground mb-2">
          <Activity className="h-3.5 w-3.5" />
          <span>Gelombang pendapatan dari transaksi selesai</span>
        </div>
        <h1 className="font-heading text-[26px] font-bold tracking-tight sm:text-[30px]">
          Trafik Penghasilan
        </h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Analisis performa pendapatan berdasarkan periode waktu.
        </p>
      </div>

      {!data ? (
        <div className="space-y-6">
          <div className="grid gap-3.5 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-[88px] rounded-xl animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-xl animate-fade-up [animation-delay:200ms]" />
        </div>
      ) : (
        <>
          {/* ---------- Stat Cards ---------- */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            <StatCard
              icon={Wallet}
              label="Total Penghasilan"
              value={formatMoney(data.total_revenue, currency)}
              accent
              hint="Pendapatan keseluruhan"
              testId="traffic-total-revenue"
              delay={60}
            />
            <StatCard
              icon={ShoppingBag}
              label="Transaksi Selesai"
              value={data.total_completed}
              tone="success"
              hint="Order berstatus Completed"
              delay={110}
            />
            <StatCard
              icon={TrendingUp}
              label="Rata-rata / Transaksi"
              value={formatMoney(avgRevenue, currency)}
              tone="primary"
              hint="Rata-rata nilai order"
              delay={160}
            />
          </div>

          {/* ---------- Charts ---------- */}
          <div className="animate-fade-up [animation-delay:220ms]">
            <Tabs defaultValue="daily">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-primary ring-1 ring-inset ring-primary/10">
                    <BarChart3 className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="font-heading text-[14px] font-semibold tracking-tight">
                      Grafik Pendapatan
                    </h2>
                    <p className="text-[11.5px] text-muted-foreground">
                      Pilih periode untuk melihat detail
                    </p>
                  </div>
                </div>

                <TabsList
                  className="h-8 rounded-lg bg-secondary/60 p-0.5"
                  data-testid="traffic-tabs"
                >
                  <TabsTrigger
                    value="daily"
                    className="h-7 rounded-md px-3 text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    data-testid="tab-daily"
                  >
                    Harian
                  </TabsTrigger>
                  <TabsTrigger
                    value="monthly"
                    className="h-7 rounded-md px-3 text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    data-testid="tab-monthly"
                  >
                    Bulanan
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="h-7 rounded-md px-3 text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    data-testid="tab-yearly"
                  >
                    Tahunan
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="daily" className="mt-0">
                <ChartCard
                  series={data.daily}
                  type="area"
                  currency={currency}
                  icon={LineChartIcon}
                  label="Pendapatan Harian"
                />
              </TabsContent>
              <TabsContent value="monthly" className="mt-0">
                <ChartCard
                  series={data.monthly}
                  type="bar"
                  currency={currency}
                  icon={BarChart3}
                  label="Pendapatan Bulanan"
                />
              </TabsContent>
              <TabsContent value="yearly" className="mt-0">
                <ChartCard
                  series={data.yearly}
                  type="bar"
                  currency={currency}
                  icon={BarChart3}
                  label="Pendapatan Tahunan"
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
  tone = "primary",
  testId,
  delay = 0,
}) {
  const tones = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/15",
  };

  if (accent) {
    return (
      <div
        className="group relative overflow-hidden rounded-xl border border-primary/30 bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md animate-fade-up"
        style={{ animationDelay: `${delay}ms` }}
        data-testid={testId}
      >
        <div className="absolute w-32 h-32 rounded-full pointer-events-none -top-12 -right-12 bg-white/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <p className="text-[12px] text-primary-foreground/85">{label}</p>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/15 ring-1 ring-inset ring-white/20">
            <Icon className="w-4 h-4" />
          </span>
        </div>
        <p className="relative mt-2.5 font-heading text-[20px] font-bold tabular-nums leading-tight">
          {value}
        </p>
        {hint && (
          <p className="relative mt-1.5 text-[11px] text-primary-foreground/75">
            {hint}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="group flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
      data-testid={testId}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset transition-transform group-hover:scale-105 ${tones[tone] || tones.primary}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11.5px] text-muted-foreground truncate">{label}</p>
        <p className="mt-0.5 font-heading text-[20px] font-bold tabular-nums leading-tight">
          {value}
        </p>
        {hint && (
          <p className="mt-0.5 text-[10.5px] text-muted-foreground/70 truncate">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Chart Card ---------- */
function ChartCard({ series, type = "area", currency, icon: Icon, label }) {
  const empty = !series || series.length === 0;

  return (
    <div className="overflow-hidden border shadow-sm rounded-xl border-border/70 bg-card">
      {/* Chart header */}
      <div className="flex items-center gap-2.5 border-b border-border/70 bg-secondary/30 px-4 py-3">
        <span className="flex items-center justify-center rounded-md h-7 w-7 bg-secondary text-primary ring-1 ring-inset ring-primary/10">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <p className="font-heading text-[13px] font-semibold tracking-tight">
          {label}
        </p>
      </div>

      {/* Chart body */}
      <div className="p-4">
        {empty ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-secondary text-muted-foreground ring-1 ring-inset ring-border/60">
              <Inbox className="w-5 h-5" />
            </span>
            <p className="mt-3 font-heading text-[13.5px] font-semibold tracking-tight">
              Belum ada data
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Data pendapatan akan muncul setelah ada transaksi selesai.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            {type === "area" ? (
              <AreaChart data={series} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatMoney(v, currency)}
                />
                <Tooltip
                  formatter={(v) => formatMoney(v, currency)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#rev)"
                />
              </AreaChart>
            ) : (
              <BarChart data={series} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatMoney(v, currency)}
                />
                <Tooltip
                  formatter={(v) => formatMoney(v, currency)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    marginBottom: 2,
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}