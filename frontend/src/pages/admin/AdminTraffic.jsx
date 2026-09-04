import { useEffect, useState } from "react";
import { TrendingUp, Wallet, ShoppingBag } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import api, { formatMoney } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminTraffic() {
  const { settings } = useSettings();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/revenue").then(({ data }) => setData(data)).catch(() => setData({ daily: [], monthly: [], yearly: [], total_revenue: 0, total_completed: 0 }));
  }, []);

  const currency = settings.currency;

  const ChartCard = ({ series, type = "area" }) => (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      {series.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-muted-foreground">Belum ada data pendapatan</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {type === "area" ? (
            <AreaChart data={series} margin={{ left: 10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={70} tickFormatter={(v) => formatMoney(v, currency)} />
              <Tooltip formatter={(v) => formatMoney(v, currency)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          ) : (
            <BarChart data={series} margin={{ left: 10, right: 10, top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} width={70} tickFormatter={(v) => formatMoney(v, currency)} />
              <Tooltip formatter={(v) => formatMoney(v, currency)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold tracking-tight">Trafik Penghasilan</h1>
      <p className="mt-1 text-muted-foreground">Gelombang pendapatan dari transaksi yang selesai.</p>

      {!data ? (
        <Skeleton className="mt-8 h-96 rounded-2xl" />
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-primary p-6 text-primary-foreground shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm text-primary-foreground/80">Total Penghasilan</p><Wallet className="h-5 w-5 opacity-70" /></div>
              <p className="mt-3 font-heading text-3xl font-bold" data-testid="traffic-total-revenue">{formatMoney(data.total_revenue, currency)}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Transaksi Selesai</p><ShoppingBag className="h-5 w-5 opacity-70" /></div>
              <p className="mt-3 font-heading text-3xl font-bold">{data.total_completed}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">Rata-rata / Transaksi</p><TrendingUp className="h-5 w-5 opacity-70" /></div>
              <p className="mt-3 font-heading text-3xl font-bold">{formatMoney(data.total_completed ? Math.round(data.total_revenue / data.total_completed) : 0, currency)}</p>
            </div>
          </div>

          <div className="mt-8">
            <Tabs defaultValue="daily">
              <TabsList data-testid="traffic-tabs">
                <TabsTrigger value="daily" data-testid="tab-daily">Harian</TabsTrigger>
                <TabsTrigger value="monthly" data-testid="tab-monthly">Bulanan</TabsTrigger>
                <TabsTrigger value="yearly" data-testid="tab-yearly">Tahunan</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-4"><ChartCard series={data.daily} type="area" /></TabsContent>
              <TabsContent value="monthly" className="mt-4"><ChartCard series={data.monthly} type="bar" /></TabsContent>
              <TabsContent value="yearly" className="mt-4"><ChartCard series={data.yearly} type="bar" /></TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
