"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useSession } from "next-auth/react"
import { DollarSign, DownloadIcon, MapPin, MoreVertical, Package, ShoppingCart, Sparkles, TrendingDown, Users } from "lucide-react"
import { fetchOrders } from "@/lib/tiktok/order"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchPerformance } from "@/lib/tiktok/shopPerformance"
import dayjs from "dayjs";
import { mapPerformanceWithChange } from "@/lib/tiktok/mapPerformanceWithChange"
import { StatsCard } from "@/components/stats-card"
import ModernGlassPreloader from "@/components/modern-glass-preloader"


// Inline SVG components
const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const Filter = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </svg>
)



const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
    <polyline points="16,7 22,7 22,13" />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M20.84 4.61a8.38 8.38 0 0 0-7.78 0L12 5.67l-1.06-1.06a8.38 8.38 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a8.38 8.38 0 0 0 0-7.78z" />
  </svg>
)

const Share = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const MessageCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const tiktokSalesData = [
  { date: "2024-01-01", sales: 1200, views: 45000, likes: 2300, shares: 150 },
  { date: "2024-01-02", sales: 1500, views: 52000, likes: 2800, shares: 180 },
  { date: "2024-01-03", sales: 900, views: 38000, likes: 1900, shares: 120 },
  { date: "2024-01-04", sales: 1800, views: 61000, likes: 3200, shares: 220 },
  { date: "2024-01-05", sales: 2100, views: 68000, likes: 3600, shares: 250 },
  { date: "2024-01-06", sales: 1600, views: 55000, likes: 2900, shares: 190 },
  { date: "2024-01-07", sales: 2300, views: 72000, likes: 3800, shares: 280 },
]


const engagementData = [
  {
    title: "Views",
    value: "45,000",
    change: "+12%",
    changeType: "increase" as const,
    icon: Eye,
    bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    iconColor: "text-white",
    borderColor: "border-blue-200",
  },
  {
    title: "Likes",
    value: "2,300",
    change: "+8%",
    changeType: "increase" as const,
    icon: Heart,
    bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    iconColor: "text-white",
    borderColor: "border-emerald-200",
  },
  {
    title: "Shares",
    value: "150",
    change: "+15%",
    changeType: "increase" as const,
    icon: Share,
    bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
    iconColor: "text-white",
    borderColor: "border-purple-200",
  },
  {
    title: "Comments",
    value: "89",
    change: "+5%",
    changeType: "increase" as const,
    icon: MessageCircle,
    bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
    iconColor: "text-white",
    borderColor: "border-orange-200",
  },
]

export default function TikTokPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tokens, setTokens] = useState<{ [page: number]: string }>({ 1: "" });
  const [hasNext, setHasNext] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  // Bulan ini
  const startThisMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const endThisMonth = dayjs().endOf("month").format("YYYY-MM-DD");

  // Bulan lalu
  const startLastMonth = dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
  const endLastMonth = dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD");
  const [statsNow, setStatsNow] = useState<any[]>([]);
  const [loadStatsNow, setLoadStatsNow] = useState<boolean>(true)
  const [loadStatsPrev, setLoadStatsPrev] = useState<boolean>(true)
  const [statsPrev, setStatsPrev] = useState<any[]>([]);
  async function loadStats(startNow: string, endNow: string, startPrev: string, endPrev: string) {
    if (!session?.user?.accessToken) return
    setTableLoading(true)

    try {
      const [nowRes, prevRes] = await Promise.all([
        fetchPerformance(process.env.NEXT_PUBLIC_SHOP_CIPHER ?? "", session.user.accessToken, startNow, endNow),
        fetchPerformance(process.env.NEXT_PUBLIC_SHOP_CIPHER ?? "", session.user.accessToken, startPrev, endPrev)
      ])

      const mapped = mapPerformanceWithChange(nowRes, prevRes)
      setStatsNow(mapped)
      setLoadStatsNow(false)
      setLoadStatsPrev(false)
    } catch (err) {
      console.log(err)
    } finally {
      setTableLoading(false)
    }
  }
  const [chartData, setChartData] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  function mapIntervalsToChart(intervals: any[]) {
    // pastikan urut by start_date ascending
    const sorted = [...intervals].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return sorted.map((it: any) => ({
      date: it.start_date,
      orders: it.orders ?? 0,
      units: it.units_sold ?? 0,
      gmv: Number(it.gmv?.amount ?? 0),
    }));
  }


  async function loadChartLast7Days() {
    if (!session?.user?.accessToken) return;
    setLoading(true);

    try {
      const end = dayjs().format("YYYY-MM-DD");
      const start = dayjs().subtract(6, "day").format("YYYY-MM-DD"); // 7 hari terakhir

      // coba ambil rentang sekaligus
      const aggregate = await fetchPerformance(
        process.env.NEXT_PUBLIC_SHOP_CIPHER ?? "",
        session.user.accessToken,
        start,
        end
      );

      const intervals = aggregate?.performance?.intervals ?? [];

      if (Array.isArray(intervals) && intervals.length >= 7) {
        // API sudah mengembalikan data harian untuk range -> langsung pakai
        const mapped = mapIntervalsToChart(intervals);
        setChartData(mapped);
        console.log("Chart mapped from single range call:", mapped);
      } else {
        // fallback: fetch per-day (start=end) — safer when API returns aggregated single interval
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          dates.push(dayjs().subtract(i, "day").format("YYYY-MM-DD"));
        }

        // lakukan parallel fetch per tanggal. catch agar 1 gagal tidak menghentikan semuanya.
        const promises = dates.map((d) =>
          fetchPerformance(
            process.env.NEXT_PUBLIC_SHOP_CIPHER ?? "",
            session.user.accessToken,
            d,
            d
          ).catch((err) => {
            console.error("fetchPerformance fail for", d, err);
            return null;
          })
        );

        const results = await Promise.all(promises);

        // tiap result diambil intervals[0] jika ada
        const mapped = dates.map((d, idx) => {
          const res = results[idx];
          const it = res?.performance?.intervals?.[0] ?? null;
          return {
            date: d,
            orders: it?.orders ?? 0,
            units: it?.units_sold ?? 0,
            gmv: Number(it?.gmv?.amount ?? 0),
          };
        });

        // pastikan terurut (dates dibuat ascend), langsung set
        setChartData(mapped);
        console.log("Chart mapped from per-day calls:", mapped);
      }
    } catch (err) {
      console.error("loadChartLast7Days error:", err);
    } finally {
      setLoading(false);
    }
  }


  async function loadPage(page: number) {
    if (!session?.user?.accessToken) return;
    const token = tokens[page];
    if (token === undefined) return;

    setTableLoading(true); // ⬅️ hanya table yg loading
    try {
      const data = await fetchOrders(
        process.env.NEXT_PUBLIC_SHOP_CIPHER ?? "",
        session?.user?.accessToken,
        5,
        token
      );

      setOrders(data.data.orders || []);
      setCurrentPage(page);

      if (data.data.next_page_token) {
        setTokens((prev) => ({
          ...prev,
          [page + 1]: data.data.next_page_token,
        }));
        setHasNext(true);
      } else {
        setHasNext(false);
      }
      setTableLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (session?.user?.accessToken != undefined) {
      loadPage(1);
      loadChartLast7Days()
      loadStats(startThisMonth, endThisMonth, startLastMonth, endLastMonth)
      setInitialized(true);
    }
  }, [status, session?.user?.accessToken, initialized]);




  if (status == "loading") return <ModernGlassPreloader />;
  // if (status === "unauthenticated") return <p>Silakan login dulu</p>;
  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex flex-col  gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Data Penjualan Tiktok</h1>
          <p className="text-muted-foreground text-pretty">Kelola dan pantau performa toko di Tiktok</p>
        </div>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsNow.length === 0 && loadStatsNow ? (
          // tampilkan skeleton card dummy
          Array.from({ length: 4 }).map((_, index) => (
            <StatsCard
              key={index}
              stat={{
                title: "Loading...",
                value: 0,
                change: "0%",
                changeType: "increase",
                icon: () => <div />,
                bgGradient: "bg-gradient-to-br from-gray-50 to-gray-100",
                borderColor: "border-gray-200",
                iconBg: "bg-gray-200",
                iconColor: "text-gray-400",
              }}
              index={index}
              loading={true}
            />
          ))
        ) : (
          statsNow.map((stat, index) => (
            <StatsCard key={stat.title} stat={stat} index={index} />
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card className="border shadow-lg pb-5 py-0 overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
            <CardTitle className="text-2xl font-bold text-slate-900">Tren Penjualan TikTok (7 Hari Terakhir)</CardTitle>
            <CardDescription className="text-slate-600">Grafik penjualan harian dan engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-600">Memuat data...</span>
              </div>
            ) : (
              <ChartContainer
                config={{
                  orders: { label: "Orders", color: "#8b5cf6" },
                  units: { label: "Units Sold", color: "#06b6d4" },
                }}
                className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" })
                      }
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      name="Orders"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="units"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      name="Units Sold"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Placeholder Card */}
        <Card className="border shadow-lg pb-5 py-0 overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
            <CardTitle className="text-xl font-bold text-slate-900">Engagement Metrics</CardTitle>
            <CardDescription className="text-slate-600">Analisis interaksi dan engagement pengguna</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              <div className="text-center px-4">
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-4 text-slate-400" />
                <p className="text-base sm:text-lg font-medium">Engagement Analytics</p>
                <p className="text-xs sm:text-sm">Fitur akan segera tersedia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border  py-0 overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
          <CardTitle className="text-xl font-bold text-slate-900">Daftar Pesanan TikTok</CardTitle>
          <CardDescription className="text-slate-600">Kelola dan pantau status pesanan dari TikTok Shop</CardDescription>
        </CardHeader>
        <CardContent className=" pb-8">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk atau SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full md:w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter Lainnya
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[60px] text-center">No</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Produk</TableHead>
                  {/* <TableHead>SKU</TableHead> */}
                  <TableHead>Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metode Bayar</TableHead>
                  <TableHead >No. Resi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableLoading ? <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <svg
                        className="animate-spin h-5 w-5 text-muted-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <span>Memuat data...</span>
                    </div>
                  </TableCell>
                </TableRow> : orders.map((order, idx) => (
                  <TableRow
                    key={order.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"}
                  >
                    {/* Nomor urut */}
                    <TableCell className="text-center font-medium">
                      {(currentPage - 1) * 5 + idx + 1}
                    </TableCell>

                    <TableCell className="font-mono text-sm">{order.id}</TableCell>
                    <TableCell>{order.line_items[0]?.product_name}</TableCell>
                    {/* <TableCell>{order.line_items[0]?.sku_name}</TableCell> */}
                    <TableCell className="font-semibold text-emerald-600">
                      Rp {Number(order.line_items[0]?.sale_price).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "COMPLETED"
                            ? "default" // hijau bisa pakai className tambahan
                            : order.status === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                        }
                        className={order.status === "COMPLETED" ? "bg-green-500 text-white" : ""}
                      >
                        {order.status}
                      </Badge>

                    </TableCell>
                    <TableCell>{order.payment_method_name}</TableCell>
                    <TableCell>
                      {order.line_items[0]?.tracking_number || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => console.log("Detail", order.id)}>
                            <Eye className="mr-2 h-4 w-4" /> Detail
                          </DropdownMenuItem>
                          {order.line_items[0]?.tracking_number && (
                            <DropdownMenuItem onClick={() => console.log("Lacak", order.id)}>
                              <MapPin className="mr-2 h-4 w-4" /> Lacak
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>


          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => loadPage(currentPage - 1)}
            >
              Prev
            </Button>

            {[...Array(currentPage + (hasNext ? 1 : 0))].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  onClick={() => loadPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              disabled={!hasNext}
              onClick={() => loadPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
