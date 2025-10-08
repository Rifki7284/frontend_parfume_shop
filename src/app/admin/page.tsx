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
  const [topProductTiktok, setTopProductTiktok] = useState<any[]>()
  const [decisionTopProduct, setDecisionTopProduct] = useState<string>("shopee")
  const cipher = process.env.NEXT_PUBLIC_SHOP_CIPHER
  const api = process.env.NEXT_PUBLIC_API_URL
  async function loadStatsTiktok() {
    if (!session?.user?.accessToken) return

    try {
      const res = await fetch(`${api}/tiktok/shop/stats/${cipher}/performance`, {
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
      const resShopee = await fetch(`${api}/shopee/products/best/seller`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const dataShopee = await resShopee.json()
      const resTiktok = await fetch(`${api}/tiktok/shop/${cipher}/top-product`, {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
          "Content-Type": "application/json",
        },
      })
      const dataTiktok = await resTiktok.json()
      setTopProductShopee(dataShopee)
      setTopProductTiktok(dataTiktok)
    } catch (err) {
      console.log(err)
    }
  }
  async function loadSalesData() {
    if (!session?.user?.accessToken) return

    try {
      const [shopeeRes, tiktokRes] = await Promise.all([
        fetch(`${api}/shopee/orders/total/year`, {
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${api}/tiktok/shop/stats/${cipher}/performance/year`, {
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
      const res = await fetch(`${api}/shopee/shop/performance`, {
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
      bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
      iconColor: "text-white",
      borderColor: "border-blue-200",
    },
    {
      title: "Total GMV",
      value: `Rp ${(combined?.this_month.gmv ?? 0).toLocaleString()}`,
      change: calcChange(combined?.this_month.gmv ?? 0, combined?.last_month.gmv ?? 0),
      changeType: (combined?.this_month.gmv ?? 0) >= (combined?.last_month.gmv ?? 0) ? "increase" : "decrease",
      icon: DollarSign,
      bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
      iconColor: "text-white",
      borderColor: "border-emerald-200",
    },
    {
      title: "Produk Terjual",
      value: combined?.this_month.sold ?? 0,
      change: calcChange(combined?.this_month.sold ?? 0, combined?.last_month.sold ?? 0),
      changeType: (combined?.this_month.sold ?? 0) >= (combined?.last_month.sold ?? 0) ? "increase" : "decrease",
      icon: Package,
      bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50",
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
      iconColor: "text-white",
      borderColor: "border-orange-200",
    },
    {
      title: "Pelanggan",
      value: combined?.this_month.customers ?? 0,
      change: calcChange(combined?.this_month.customers ?? 0, combined?.last_month.customers ?? 0),
      changeType: (combined?.this_month.customers ?? 0) >= (combined?.last_month.customers ?? 0) ? "increase" : "decrease",
      icon: Users,
      bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
      iconColor: "text-white",
      borderColor: "border-purple-200",
    },


  ]

  useEffect(() => {
    if (session?.user?.accessToken != undefined) {
      loadStatsTiktok()
      loadStatsShopee()
      loadTopProductShopee()
      setLoadStats(false)
      loadSalesData()
    }
  }, [status, session?.user?.accessToken]);
  if (status == "loading") return <ModernGlassPreloader />;
  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-8 p-6  mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Dashboard</h1>
          <p className="text-slate-600 text-lg">Ringkasan performa penjualan TikTok dan Shopee Anda</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* {statsCards.map((stat, index) => (
            <Card
              key={stat.title}
              className={`${stat.bgGradient} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {stat.title}
                </CardTitle>
                <div
                  className={`${stat.iconBg} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="flex items-center text-sm">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="mr-2 h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`font-semibold ${stat.changeType === "increase" ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-2 text-slate-500">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
          ))} */}
          {loadStats || !combined ? Array.from({ length: 4 }).map((_, index) => (
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
          )) : stats.map((stat, index) => (
            <Card
              key={stat.title}
              className={`${stat.bgGradient} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {stat.title}
                </CardTitle>
                <div
                  className={`${stat.iconBg} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="flex items-center text-sm">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="mr-2 h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`font-semibold ${stat.changeType === "increase" ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-2 text-slate-500">dari bulan lalu</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="md:col-span-2 pb-5 py-0 overflow-hidden border shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="py-5 bg-gray-50 rounded-t-lg border-b">
              <CardTitle className="text-2xl font-bold text-slate-900">Tren Penjualan Bulanan</CardTitle>
              <CardDescription className="text-slate-600 text-base">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="tiktok" stroke="#42B549" strokeWidth={4} name="TikTok" />
                    <Line type="monotone" dataKey="shopee" stroke="#EE4D2D" strokeWidth={4} name="Shopee" />
                    <Line type="monotone" dataKey="total" stroke="hsl(270, 60%, 50%)" strokeWidth={4} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border py-0 pb-5 overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
              <CardTitle className="text-xl font-bold text-slate-900">Distribusi Platform</CardTitle>
              <CardDescription className="text-slate-600">Persentase penjualan per platform</CardDescription>
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
                }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "TikTok", value: statsTiktok?.this_month.total_orders, color: "#42B549" },
                        { name: "Shopee", value: statsShopee?.this_month.total_orders, color: "#EE4D2D" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "TikTok", value: statsTiktok?.this_month.total_orders, color: "#42B549" },
                        { name: "Shopee", value: statsShopee?.this_month.total_orders, color: "#EE4D2D" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border shadow-lg py-0 pb-5 overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
              <CardTitle className="text-xl font-bold text-slate-900">Produk Terlaris</CardTitle>
              <CardDescription className="text-slate-600">Performa produk di kedua platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5">
                <Select
                  value={decisionTopProduct}
                  onValueChange={(val) => setDecisionTopProduct(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih platform]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopee">Shopee</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                }}
                className="h-[250px] w-full"
              >

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={decisionTopProduct == "shopee" ? topProductShopee : topProductTiktok}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />   {/* ✅ ini wajib biar tooltip muncul */}
                    <Legend />
                    <Bar dataKey="sold" fill={decisionTopProduct == "shopee" ? "#EE4D2D" : "#42B549"} name="Terjual" />
                  </BarChart>
                </ResponsiveContainer>

              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
