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
import { ChevronDown, CreditCard, DollarSign, DownloadIcon, MapPin, MoreVertical, Package, ShoppingCart, Sparkles, TrendingDown, Truck, Users } from "lucide-react"
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { ShopeeStatsResponse } from "../shopee/page"


// Inline SVG components
const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)



export interface MonthlyStats {
  total_orders: number;
  customers: number;
  sold: number;
  gmv: number;
}


export interface TiktokStatsResponse {
  this_month: MonthlyStats;
  last_month: MonthlyStats;
}
export default function TikTokPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [tokens, setTokens] = useState<{ [page: number]: string }>({ 1: "" });
  const [hasNext, setHasNext] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [stats, setStats] = useState<ShopeeStatsResponse | null>(null)
  const [pageSize, setPageSize] = useState(5)
  // const [statsNow, setStatsNow] = useState<any[]>([]);
  const [keyword, setKeyword] = useState("")

  const [loadStatsNow, setLoadStatsNow] = useState<boolean>(true)
  const [loadStatsPrev, setLoadStatsPrev] = useState<boolean>(true)
  const api = process.env.NEXT_PUBLIC_API_URL
  async function loadStats() {
    if (!session?.user?.accessToken) return

    try {

      const res = await fetch(`${api}/tiktok/shop/stats/${process.env.NEXT_PUBLIC_SHOP_CIPHER}/performance`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      setStats(data)
      setLoadStatsNow(false)
      setLoadStatsPrev(false)
    } catch (err) {
      console.log(err)
    }
  }
  const [chartData, setChartData] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  function mapIntervalsToChart(intervals: any[]) {
    // pastikan urut by start_date ascending
    const sorted = [...intervals].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return sorted.map((it: any) => ({
      date: it.start_date,
      orders: it.orders,
      units: it.units_sold,
      gmv: Number(it.gmv?.amount),
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
            orders: it?.orders,
            units: it?.units_sold,
            gmv: Number(it?.gmv?.amount),
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
  const filteredOrders = orders.filter((order: any) => {
    const q = keyword.toLowerCase();
    return (
      order.id?.toLowerCase().includes(q) ||
      order.payment_method_name?.toLowerCase().includes(q) ||
      order.status?.toLowerCase().includes(q) ||
      order.line_items?.some((item: any) =>
        item.product_name?.toLowerCase().includes(q)
      ) ||
      order.line_items?.some((item: any) =>
        item.tracking_number?.toLowerCase().includes(q)
      )
    );
  });

  async function loadPage(page: number) {
    if (!session?.user?.accessToken) return;
    const token = tokens[page];
    if (token === undefined) return;

    setTableLoading(true); // ⬅️ hanya table yg loading
    try {
      setHasNext(false);
      const data = await fetchOrders(
        process.env.NEXT_PUBLIC_SHOP_CIPHER ?? "",
        session?.user?.accessToken,
        pageSize,
        token,
        statusFilter
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
      setTableLoading(false);
      setOrders([])
    }
  }

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (session?.user?.accessToken && !initialized) {
      loadPage(1);
      loadStats();
      setInitialized(true);
    }
  }, [session?.user?.accessToken, initialized]);

  // === 2️⃣ Saat filter berubah ===
  useEffect(() => {
    if (initialized) {
      loadPage(1); // reset ke halaman pertama setiap kali filter berubah
    }
  }, [statusFilter, keyword]);



  if (status == "loading") return <ModernGlassPreloader />;
  // if (status === "unauthenticated") return <p>Silakan login dulu</p>;
  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex flex-col  gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Data Penjualan Tiktok</h1>
          <p className="text-muted-foreground text-pretty">Kelola dan pantau performa toko di Tiktok</p>
        </div>
        {/* <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export Data
        </Button> */}
      </div>

      {/* Engagement Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {!stats && loadStatsNow ? (
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
          <>
            <StatsCard index={1} stat={{
              title: "Total Order",
              value: stats?.this_month.total_orders ?? 0,
              change: (() => {
                const current = stats?.this_month.total_orders ?? 0
                const prev = stats?.last_month.total_orders ?? 0
                if (prev === 0) {
                  return current > 0 ? "+100%" : "0%"
                }
                const percent = ((current - prev) / prev) * 100
                return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`
              })(),
              changeType:
                (stats?.this_month.total_orders ?? 0) >= (stats?.last_month.total_orders ?? 0)
                  ? "increase"
                  : "decrease",
              icon: ShoppingCart,
              bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
              iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
              iconColor: "text-white",
              borderColor: "border-blue-200",
            }} />
            <StatsCard index={1} stat={{
              title: "Total GMV",
              value: `Rp ${Number(stats?.this_month.gmv).toLocaleString("id-ID")}`,
              change: (() => {
                const current = stats?.this_month.gmv ?? 0
                const prev = stats?.last_month.gmv ?? 0
                if (prev === 0) {
                  return current > 0 ? "+100%" : "0%"
                }
                const percent = ((current - prev) / prev) * 100
                return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`
              })(),
              changeType:
                (stats?.this_month.gmv ?? 0) >= (stats?.last_month.gmv ?? 0)
                  ? "increase"
                  : "decrease",
              icon: DollarSign,
              bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
              iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
              iconColor: "text-white",
              borderColor: "border-emerald-200",
            }} />
            <StatsCard index={1} stat={{
              title: "Produk Terjual",
              value: stats?.this_month.sold ?? 0,
              change: (() => {
                const current = stats?.this_month.sold ?? 0
                const prev = stats?.last_month.sold ?? 0
                if (prev === 0) {
                  return current > 0 ? `+100%` : "0%"
                }
                const percent = ((current - prev) / prev) * 100
                return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`
              })(),
              changeType:
                (stats?.this_month.sold ?? 0) >= (stats?.last_month.sold ?? 0)
                  ? "increase"
                  : "decrease",
              icon: Package,
              bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50",
              iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
              iconColor: "text-white",
              borderColor: "border-orange-200",
            }} />
            <StatsCard index={1} stat={{
              title: "Pelanggan",
              value: stats?.this_month.customers ?? 0,
              change: (() => {
                const current = stats?.this_month.customers ?? 0
                const prev = stats?.last_month.customers ?? 0
                if (prev === 0) {
                  return current > 0 ? "+100%" : "0%"
                }
                const percent = ((current - prev) / prev) * 100
                return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`
              })(),
              changeType:
                (stats?.this_month.customers ?? 0) >= (stats?.last_month.customers ?? 0)
                  ? "increase"
                  : "decrease",
              icon: Users,
              bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50",
              iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
              iconColor: "text-white",
              borderColor: "border-purple-200",
            }} />

          </>
        )}
      </div>

      {/* <div className="grid gap-6 lg:grid-cols-2">
  
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
      </div> */}

      {/* Products Table */}
      <Card className="border  py-0 overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
          <CardTitle className="text-xl font-bold text-slate-900">Daftar Pesanan TikTok</CardTitle>
          <CardDescription className="text-slate-600">Kelola dan pantau status pesanan dari TikTok Shop</CardDescription>
        </CardHeader>
        <CardContent className=" pb-8">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6">
            {/* Container untuk filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Left side - Search & Filter */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
                {/* Search Input */}
                <div className="relative w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari produk atau pembeli..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="UNPAID">Belum Dibayar</SelectItem>
                    <SelectItem value="ON_HOLD">Ditahan</SelectItem>
                    <SelectItem value="AWAITING_SHIPMENT">Menunggu Dikirim</SelectItem>
                    <SelectItem value="AWAITING_COLLECTION">Menunggu Diambil</SelectItem>
                    <SelectItem value="IN_TRANSIT">Sedang Dikirim</SelectItem>
                    <SelectItem value="DELIVERED">Terkirim</SelectItem>
                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                    <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Right side - bisa ditambahkan tombol action jika diperlukan */}
            </div>
          </div>

          {/* Table */}
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[60px] text-center">No</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metode Bayar</TableHead>
                    <TableHead>No. Resi</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableLoading ? (
                    <TableRow>
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
                    </TableRow>
                  ) : (
                    filteredOrders.length > 0 ? filteredOrders.map((order: any, idx: number) => (
                      <TableRow
                        key={order.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"}
                      >
                        <TableCell className="text-center font-medium">
                          {(currentPage - 1) * 5 + idx + 1}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.line_items[0]?.product_name}</TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          Rp {Number(order.line_items[0]?.sale_price).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "COMPLETED"
                                ? "default"
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
                        <TableCell className="text-center">
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
                    )) : <TableRow>
                      <TableCell colSpan={8} className="h-64">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              className="w-10 h-10 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <p className="text-lg font-semibold text-gray-500 mb-2">Tidak Ada Data</p>
                          <p className="text-sm text-gray-400">Belum ada pesanan yang tersedia</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {tableLoading ? (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <svg
                      className="animate-spin h-8 w-8 text-muted-foreground"
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
                    <span className="text-sm font-medium">Memuat data...</span>
                  </div>
                </div>
              ) : (
                filteredOrders.map((order: any, idx: number) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                          {(currentPage - 1) * 5 + idx + 1}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Order ID</p>
                          <p className="text-sm font-mono font-semibold text-gray-900">{order.id}</p>
                        </div>
                      </div>
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
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Product Info */}
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium mb-1">Produk</p>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {order.line_items[0]?.product_name}
                          </p>
                        </div>
                      </div>

                      {/* Price & Status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Harga</p>
                          <p className="text-base font-bold text-emerald-600">
                            Rp {Number(order.line_items[0]?.sale_price).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                          <Badge
                            variant={
                              order.status === "COMPLETED"
                                ? "default"
                                : order.status === "CANCELLED"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={order.status === "COMPLETED" ? "bg-green-500 text-white" : ""}
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Metode Pembayaran</p>
                          <p className="text-sm font-medium text-gray-900">{order.payment_method_name}</p>
                        </div>
                      </div>

                      {/* Tracking Number */}
                      {order.line_items[0]?.tracking_number ? (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">No. Resi</p>
                            <p className="text-sm font-mono font-medium text-gray-900">
                              {order.line_items[0].tracking_number}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <Truck className="h-4 w-4 text-gray-300" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500">No. Resi</p>
                            <p className="text-sm text-gray-400">Belum tersedia</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Empty State - Mobile */}
              {!tableLoading && orders.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                    <Package className="h-12 w-12 text-gray-400" />
                    <p className="text-sm font-medium">Tidak ada data pesanan</p>
                  </div>
                </div>
              )}
            </div>
          </>


          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Data per halaman:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                    }}
                    className="px-3 py-2 pr-8 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              <span className="text-sm text-gray-700 w-auto">
                Halaman {currentPage}
              </span>
              <div>
                <Pagination>
                  <PaginationContent>
                    {/* Previous */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => loadPage(currentPage - 1)}
                        aria-disabled={currentPage === 1}
                        className={`
                        ${currentPage === 1 || loading
                            ? 'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 text-gray-400 border-gray-200'
                            : 'cursor-pointer hover:bg-gray-50 border-gray-300 text-gray-700 bg-white'
                          }
                      `}
                      />
                    </PaginationItem>



                    {/* Next */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => loadPage(currentPage + 1)}
                        aria-disabled={!hasNext}
                        className={`
                        ${!hasNext || loading
                            ? 'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 text-gray-400 border-gray-200'
                            : 'cursor-pointer hover:bg-gray-800 bg-gray-900 text-white border-gray-900'
                          }
                      `}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  )
}
