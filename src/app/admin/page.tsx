"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, ShoppingBag } from "lucide-react"
import { useSession } from "next-auth/react"
import ModernGlassPreloader from "@/components/modern-glass-preloader"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { fetchPerformance } from "@/lib/tiktok/shopPerformance"
import { mapPerformanceWithChange } from "@/lib/tiktok/mapPerformanceWithChange"
import { StatsCard } from "@/components/stats-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// const salesData = [
//   { month: "Jan", tiktok: 4000, shopee: 2400, total: 6400 },
//   { month: "Feb", tiktok: 3000, shopee: 1398, total: 4398 },
//   { month: "Mar", tiktok: 2000, shopee: 9800, total: 11800 },
//   { month: "Apr", tiktok: 2780, shopee: 3908, total: 6688 },
//   { month: "May", tiktok: 1890, shopee: 4800, total: 6690 },
//   { month: "Jun", tiktok: 2390, shopee: 3800, total: 6190 },
// ]


export interface MonthlyStats {
  total_orders: number;
  customers: number;
  sold: number;
  gmv: number;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export interface ShopStatsResponse {
  this_month: MonthlyStats;
  last_month: MonthlyStats;
}
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [statsTiktok, setStatsTiktok] = useState<ShopStatsResponse | null>(null)
  const [statsShopee, setStatsShopee] = useState<ShopStatsResponse | null>(null)
  const [loadStats, setLoadStats] = useState<boolean>(true)
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProductShopee, setTopProductShopee] = useState<any[]>()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [topProductTiktok, setTopProductTiktok] = useState<any[]>()
  const [decisionTopProduct, setDecisionTopProduct] = useState<string>("shopee")
  const cipher = process.env.NEXT_PUBLIC_SHOP_CIPHER
  const api = process.env.NEXT_PUBLIC_API_URL
  async function loadStatsTiktok() {
    if (!session?.user?.accessToken) return

    try {
      const query = `?month=${selectedMonth}&year=${selectedYear}`
      const res = await fetch(`${api}/tiktok/shop/stats/${cipher}/performance${query}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      setStatsTiktok(data)
    } catch (err) {
      console.log(err)
    }
  }
  async function loadTopProductShopee() {
    if (!session?.user?.accessToken) return

    try {
      const query = `?month=${selectedMonth}&year=${selectedYear}`

      const resShopee = await fetch(`${api}/shopee/products/best/seller${query}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const dataShopee = await resShopee.json()

      const resTiktok = await fetch(`${api}/tiktok/shop/${cipher}/top-product${query}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const dataTiktok = await resTiktok.json()
      console.log(dataShopee)
      setTopProductShopee(dataShopee)
      setTopProductTiktok(dataTiktok)
    } catch (err) {
      console.log(err)
    }
  }

  async function loadSalesData() {
    if (!session?.user?.accessToken) return
    const query = `?year=${selectedYear}`
    try {
      const [shopeeRes, tiktokRes] = await Promise.all([
        fetch(`${api}/shopee/orders/total/year${query}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${api}/tiktok/shop/stats/${cipher}/performance/year${query}`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      const shopee = await shopeeRes.json();
      const tiktok = await tiktokRes.json();

      const merged = monthNames.map((m, idx) => {
        const month = (idx + 1).toString();
        const shopeeVal = shopee[month] ?? 0;
        const tiktokVal = tiktok[month] ?? 0;
        return {
          month: m,
          shopee: shopeeVal,
          tiktok: tiktokVal,
          total: shopeeVal + tiktokVal,
        };
      });

      setSalesData(merged);
    } catch (err) {
      console.log(err)
    }
  }

  async function loadStatsShopee() {
    if (!session?.user?.accessToken) return

    try {
      const query = `?month=${selectedMonth}&year=${selectedYear}`
      const res = await fetch(`${api}/shopee/shop/performance${query}`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      setStatsShopee(data)
    } catch (err) {
      console.log(err)
    }
  }
  const combineStats = (a: ShopStatsResponse | null, b: ShopStatsResponse | null): ShopStatsResponse | null => {
    if (!a && !b) return null
    return {
      this_month: {
        total_orders: (a?.this_month.total_orders ?? 0) + (b?.this_month.total_orders ?? 0),
        customers: (a?.this_month.customers ?? 0) + (b?.this_month.customers ?? 0),
        sold: (a?.this_month.sold ?? 0) + (b?.this_month.sold ?? 0),
        gmv: (a?.this_month.gmv ?? 0) + (b?.this_month.gmv ?? 0)
      },
      last_month: {
        total_orders: (a?.last_month.total_orders ?? 0) + (b?.last_month.total_orders ?? 0),
        customers: (a?.last_month.customers ?? 0) + (b?.last_month.customers ?? 0),
        sold: (a?.last_month.sold ?? 0) + (b?.last_month.sold ?? 0),
        gmv: (a?.last_month.gmv ?? 0) + (b?.last_month.gmv ?? 0)
      }
    }
  }

  const combined = combineStats(statsTiktok, statsShopee)

  const calcChange = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? "+100%" : "0%"
    const percent = ((current - prev) / prev) * 100
    return `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`
  }

  const stats = [
    {
      title: "Total Order",
      value: combined?.this_month.total_orders ?? 0,
      change: calcChange(combined?.this_month.total_orders ?? 0, combined?.last_month.total_orders ?? 0),
      changeType: (combined?.this_month.total_orders ?? 0) >= (combined?.last_month.total_orders ?? 0) ? "increase" : "decrease",
      icon: ShoppingCart,
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600",
      iconColor: "text-white",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Total GMV",
      value: `Rp ${(combined?.this_month.gmv ?? 0).toLocaleString()}`,
      change: calcChange(combined?.this_month.gmv ?? 0, combined?.last_month.gmv ?? 0),
      changeType: (combined?.this_month.gmv ?? 0) >= (combined?.last_month.gmv ?? 0) ? "increase" : "decrease",
      icon: DollarSign,
      bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600",
      iconColor: "text-white",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Produk Terjual",
      value: combined?.this_month.sold ?? 0,
      change: calcChange(combined?.this_month.sold ?? 0, combined?.last_month.sold ?? 0),
      changeType: (combined?.this_month.sold ?? 0) >= (combined?.last_month.sold ?? 0) ? "increase" : "decrease",
      icon: Package,
      bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600",
      iconColor: "text-white",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: "Pelanggan",
      value: combined?.this_month.customers ?? 0,
      change: calcChange(combined?.this_month.customers ?? 0, combined?.last_month.customers ?? 0),
      changeType: (combined?.this_month.customers ?? 0) >= (combined?.last_month.customers ?? 0) ? "increase" : "decrease",
      icon: Users,
      bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-500 dark:from-purple-600 dark:to-violet-600",
      iconColor: "text-white",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
  ]
  useEffect(() => {
    if (session?.user?.accessToken != undefined) {
      setLoadStats(true)
      loadStatsTiktok()
      loadStatsShopee()
      loadTopProductShopee()
      loadSalesData()
      setLoadStats(false)
    }
  }, [status, session?.user?.accessToken, selectedMonth, selectedYear]);
  if (status == "loading") return <ModernGlassPreloader />;
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="space-y-8 p-6  mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 text-lg dark:text-white/60">Ringkasan performa penjualan TikTok dan Shopee Anda</p>
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all">
            <label className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Bulan:</label>
            <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
              <SelectTrigger className="w-[150px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 rounded-xl">
                {[
                  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                ].map((m, i) => (
                  <SelectItem key={i} value={String(i + 1)} className="text-slate-900 dark:text-white rounded-lg">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all">
            <label className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Tahun:</label>
            <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
              <SelectTrigger className="w-[120px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 rounded-xl">
                {[2023, 2024, 2025].map((year) => (
                  <SelectItem key={year} value={String(year)} className="text-slate-900 dark:text-white rounded-lg">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loadStats && !combined ? Array.from({ length: 4 }).map((_, index) => (
            <StatsCard
              key={index}
              stat={{
                title: "Loading...",
                value: 0,
                change: "0%",
                changeType: "increase",
                icon: () => <div />,
                bgGradient: "bg-gray-50 dark:bg-gray-800",
                borderColor: "border-gray-200 dark:border-gray-700",
                iconBg: "bg-gray-200 dark:bg-gray-700",
                iconColor: "text-gray-400 dark:text-gray-500",
              }}
              index={index}
              loading={true}
            />
          )) : stats.map((stat, index) => (
            <Card
              key={stat.title}
              className={`${stat.bgGradient} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {stat.title}
                </CardTitle>
                <div
                  className={`${stat.iconBg} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div className="flex items-center text-sm">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDown className="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                  )}
                  <span
                    className={`font-semibold ${stat.changeType === "increase"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-500 dark:text-red-400"
                      }`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="md:col-span-2 pb-5 py-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="py-5 bg-gray-50 dark:bg-slate-800 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Tren Penjualan Bulanan
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                Perbandingan penjualan TikTok vs Shopee dalam 6 bulan terakhir
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <ChartContainer
                config={{
                  tiktok: {
                    label: "TikTok",
                    color: "#42B549",
                  },
                  shopee: {
                    label: "Shopee",
                    color: "#EE4D2D",
                  },
                  total: {
                    label: "Total",
                    color: "hsl(270, 60%, 50%)",
                  },
                }}
                className="h-[350px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-700"
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      className="dark:stroke-slate-400"
                    />
                    <YAxis
                      stroke="#64748b"
                      className="dark:stroke-slate-400"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tiktok"
                      stroke="#42B549"
                      strokeWidth={4}
                      name="TikTok"
                    />
                    <Line
                      type="monotone"
                      dataKey="shopee"
                      stroke="#EE4D2D"
                      strokeWidth={4}
                      name="Shopee"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(270, 60%, 50%)"
                      strokeWidth={4}
                      name="Total"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribusi Platform */}
          <Card className="border border-slate-200 dark:border-slate-800 py-0 pb-5 overflow-hidden shadow-lg bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gray-50 dark:bg-slate-800 py-5 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Distribusi Platform
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Persentase penjualan per platform
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-8">
              {/* Hitung total order */}
              {(() => {
                const tiktokOrders = statsTiktok?.this_month.total_orders ?? 0
                const shopeeOrders = statsShopee?.this_month.total_orders ?? 0
                const total = tiktokOrders + shopeeOrders

                if (total === 0) {
                  // 👉 Jika tidak ada data
                  return (
                    <div className="flex flex-col items-center justify-center h-[250px] text-slate-500 dark:text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2 text-slate-400 dark:text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zm9.75-3.75A9.75 9.75 0 1 1 2.25 12a9.75 9.75 0 0 1 19.5 0z" />
                      </svg>
                      <p className="text-sm font-medium">Belum ada data penjualan bulan ini</p>
                    </div>
                  )
                }

                // 👉 Jika ada data
                return (
                  <ChartContainer
                    config={{
                      tiktok: { label: "TikTok", color: "#42B549" },
                      shopee: { label: "Shopee", color: "#EE4D2D" },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "TikTok", value: tiktokOrders, color: "#42B549" },
                            { name: "Shopee", value: shopeeOrders, color: "#EE4D2D" },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: "TikTok", value: tiktokOrders, color: "#42B549" },
                            { name: "Shopee", value: shopeeOrders, color: "#EE4D2D" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )
              })()}
            </CardContent>
          </Card>


          {/* Bar Chart - Produk Terlaris */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-lg py-0 pb-5 overflow-hidden bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gray-50 dark:bg-slate-800 py-5 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Produk Terlaris
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Performa produk di kedua platform
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Select Platform */}
              <div className="mb-5">
                <Select
                  value={decisionTopProduct}
                  onValueChange={(val) => setDecisionTopProduct(val)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem
                      value="shopee"
                      className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Shopee
                    </SelectItem>
                    <SelectItem
                      value="tiktok"
                      className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      TikTok
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chart / Empty State */}
              {(() => {
                const data =
                  decisionTopProduct === "shopee" ? topProductShopee : topProductTiktok
                const hasData = Array.isArray(data) && data.length > 0

                if (!hasData) {
                  return (
                    <div className="flex flex-col items-center justify-center h-[250px] text-slate-500 dark:text-slate-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2 text-slate-400 dark:text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m0 3.75h.007v.008H12v-.008zm9.75-3.75A9.75 9.75 0 1 1 2.25 12a9.75 9.75 0 0 1 19.5 0z"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        Belum ada data produk terlaris untuk platform ini
                      </p>
                    </div>
                  )
                }

                return (
                  <ChartContainer
                    config={{
                      tiktok: { label: "TikTok", color: "#42B549" },
                      shopee: { label: "Shopee", color: "#EE4D2D" },
                    }}
                    className="h-[250px] w-full"
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          className="dark:stroke-slate-700"
                        />
                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          className="dark:stroke-slate-400"
                        />
                        <YAxis
                          stroke="#64748b"
                          className="dark:stroke-slate-400"
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="sold"
                          fill={decisionTopProduct === "shopee" ? "#EE4D2D" : "#42B549"}
                          name="Terjual"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )
              })()}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
