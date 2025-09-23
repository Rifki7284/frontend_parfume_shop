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
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
const salesData = [
  { month: "Jan", tiktok: 4000, shopee: 2400, total: 6400 },
  { month: "Feb", tiktok: 3000, shopee: 1398, total: 4398 },
  { month: "Mar", tiktok: 2000, shopee: 9800, total: 11800 },
  { month: "Apr", tiktok: 2780, shopee: 3908, total: 6688 },
  { month: "May", tiktok: 1890, shopee: 4800, total: 6690 },
  { month: "Jun", tiktok: 2390, shopee: 3800, total: 6190 },
]

const topProducts = [
  { name: "Produk A", tiktok: 1200, shopee: 800 },
  { name: "Produk B", tiktok: 900, shopee: 1100 },
  { name: "Produk C", tiktok: 700, shopee: 600 },
  { name: "Produk D", tiktok: 500, shopee: 900 },
]

const statsCards = [
  {
    title: "Total Penjualan",
    value: "Rp 125.4M",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: DollarSign,
    bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    iconColor: "text-white",
    borderColor: "border-emerald-200",
  },
  {
    title: "Total Pesanan",
    value: "2,847",
    change: "+8.2%",
    changeType: "increase" as const,
    icon: ShoppingCart,
    bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    iconColor: "text-white",
    borderColor: "border-blue-200",
  },
  {
    title: "Pelanggan Aktif",
    value: "1,234",
    change: "-2.1%",
    changeType: "decrease" as const,
    icon: Users,
    bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
    iconColor: "text-white",
    borderColor: "border-purple-200",
  },
  {
    title: "Produk Terjual",
    value: "5,678",
    change: "+15.3%",
    changeType: "increase" as const,
    icon: Package,
    bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-500",
    iconColor: "text-white",
    borderColor: "border-orange-200",
  },
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-8 p-6  mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Dashboard</h1>
          <p className="text-slate-600 text-lg">Ringkasan performa penjualan TikTok dan Shopee Anda</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
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
                        { name: "TikTok", value: 45, color: "#42B549" },
                        { name: "Shopee", value: 55, color: "#EE4D2D" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "TikTok", value: 45, color: "#42B549" },
                        { name: "Shopee", value: 55, color: "#EE4D2D" },
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
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="tiktok" fill="#42B549" name="TikTok" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="shopee" fill="#EE4D2D" name="Shopee" radius={[0, 4, 4, 0]} />
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
