"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { useOrderList } from "@/lib/shopee/useOrderList"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapPin, MoreVertical } from "lucide-react"
const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const statusColorMap: Record<string, string> = {
  UNPAID: "bg-yellow-500 text-white",          // Kuning
  READY_TO_SHIP: "bg-blue-500 text-white",     // Biru
  RETRY_SHIP: "bg-orange-500 text-white",      // Oranye
  SHIPPED: "bg-purple-500 text-white",         // Ungu
  TO_CONFIRM_RECEIVE: "bg-indigo-500 text-white", // Biru keunguan
  IN_CANCEL: "bg-pink-500 text-white",         // Pink
  CANCELLED: "bg-red-500 text-white",          // Merah
  TO_RETURN: "bg-amber-600 text-white",        // Amber
  COMPLETED: "bg-green-500 text-white",        // Hijau
}
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
)

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
)

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
)

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

const PackageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
)

// Sample data untuk Shopee
const shopeeSalesData = [
  { date: "2024-01-01", sales: 2400, orders: 45, rating: 4.8, visitors: 1200 },
  { date: "2024-01-02", sales: 2800, orders: 52, rating: 4.7, visitors: 1350 },
  { date: "2024-01-03", sales: 1900, orders: 38, rating: 4.9, visitors: 980 },
  { date: "2024-01-04", sales: 3200, orders: 61, rating: 4.8, visitors: 1580 },
  { date: "2024-01-05", sales: 3600, orders: 68, rating: 4.9, visitors: 1720 },
  { date: "2024-01-06", sales: 2900, orders: 55, rating: 4.7, visitors: 1450 },
  { date: "2024-01-07", sales: 3800, orders: 72, rating: 4.8, visitors: 1890 },
]

const shopeeProducts = [
  {
    id: 1,
    name: "Smartphone Case Premium",
    sku: "SP-PHN-001",
    price: "Rp 149.000",
    stock: 245,
    sold: 189,
    rating: 4.8,
    reviews: 156,
    status: "active",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Tas Wanita Elegant",
    sku: "SP-BAG-002",
    price: "Rp 299.000",
    stock: 89,
    sold: 134,
    rating: 4.9,
    reviews: 98,
    status: "active",
    category: "Fashion",
  },
  {
    id: 3,
    name: "Sepatu Sneakers Casual",
    sku: "SP-SHO-003",
    price: "Rp 399.000",
    stock: 156,
    sold: 267,
    rating: 4.7,
    reviews: 203,
    status: "active",
    category: "Fashion",
  },
  {
    id: 4,
    name: "Kitchen Utensil Set",
    sku: "SP-KIT-004",
    price: "Rp 199.000",
    stock: 0,
    sold: 89,
    rating: 4.6,
    reviews: 67,
    status: "out_of_stock",
    category: "Home & Living",
  },
]

const categoryPerformance = [
  { category: "Electronics", sales: 4500, orders: 89 },
  { category: "Fashion", sales: 6200, orders: 124 },
  { category: "Home & Living", sales: 3800, orders: 76 },
  { category: "Beauty", sales: 2900, orders: 58 },
]

export default function ShopeePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { orders, page, hasMore, loadOrders, loading, error, dataDetail } = useOrderList(10)
  const filteredProducts = shopeeProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })
  if (dataDetail != undefined) {
    console.log(dataDetail)
  }
  return (
    <div className="space-y-6 bg-white min-h-screen p-6 ">
      <div className="flex flex-col  gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Data Penjualan Shopee</h1>
          <p className="text-muted-foreground text-pretty">Kelola dan pantau performa toko di Shopee</p>
        </div>
        <Button>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Shopee Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Pesanan</p>
                <p className="text-2xl font-bold text-emerald-900">2,847</p>
                <div className="flex items-center text-xs text-emerald-600 mt-1">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +18% dari bulan lalu
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingBagIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 delay-75">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Rating Toko</p>
                <p className="text-2xl font-bold text-blue-900">4.8</p>
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +0.1 dari bulan lalu
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <StarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 delay-150">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Pengunjung Toko</p>
                <p className="text-2xl font-bold text-purple-900">12,450</p>
                <div className="flex items-center text-xs text-purple-600 mt-1">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +25% dari bulan lalu
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUpIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 delay-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Produk Aktif</p>
                <p className="text-2xl font-bold text-orange-900">156</p>
                <div className="flex items-center text-xs text-orange-600 mt-1">
                  <TrendingUpIcon className="mr-1 h-3 w-3" />
                  +12 dari bulan lalu
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <PackageIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card className="lg:col-span-1 pb-5 py-0 overflow-hidden border shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
            <CardTitle className="text-xl font-bold text-slate-900">Tren Penjualan Shopee (7 Hari Terakhir)</CardTitle>
            <CardDescription className="text-slate-600">Grafik penjualan harian dan jumlah pesanan</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <ChartContainer
              config={{
                sales: {
                  label: "Penjualan (Rp)",
                  color: "#10b981",
                },
                orders: {
                  label: "Pesanan",
                  color: "#3b82f6",
                },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shopeeSalesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("id-ID", { month: "short", day: "numeric" })
                    }
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Penjualan"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Pesanan"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card className="border pb-5 py-0 overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
            <CardTitle className="text-xl font-bold text-slate-900">Performa per Kategori</CardTitle>
            <CardDescription className="text-slate-600">
              Penjualan dan pesanan berdasarkan kategori produk
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <ChartContainer
              config={{
                sales: {
                  label: "Penjualan",
                  color: "#3b82f6",
                },
                orders: {
                  label: "Pesanan",
                  color: "#10b981",
                },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" name="Penjualan" />
                  <Bar yAxisId="right" dataKey="orders" fill="#10b981" name="Pesanan" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Distribution */}
        {/* <Card className="border shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gray-50 rounded-t-lg border-b">
            <CardTitle className="text-xl font-bold text-slate-900">Distribusi Platform</CardTitle>
            <CardDescription className="text-slate-600">Persentase penjualan per platform</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <ChartContainer
              config={{
                shopee: {
                  label: "Shopee",
                  color: "#f97316",
                },
                tiktok: {
                  label: "TikTok",
                  color: "#8b5cf6",
                },
                tokopedia: {
                  label: "Tokopedia",
                  color: "#10b981",
                },
                lazada: {
                  label: "Lazada",
                  color: "#3b82f6",
                },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Shopee", value: 45, fill: "#f97316" },
                      { name: "TikTok", value: 30, fill: "#8b5cf6" },
                      { name: "Tokopedia", value: 15, fill: "#10b981" },
                      { name: "Lazada", value: 10, fill: "#3b82f6" },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    style={{ fontSize: "12px" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card> */}
      </div>

      {/* Products Table */}
      <Card className="border pb-5 py-0 overflow-hidden shadow-lg bg-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gray-50 py-5 rounded-t-lg border-b">
          <CardTitle className="text-xl font-bold text-slate-900">Daftar Produk Shopee</CardTitle>
          <CardDescription className="text-slate-600">
            Kelola inventori dan pantau performa produk di Shopee
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                  <SelectItem value="out_of_stock">Stok Habis</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                  <SelectItem value="Home & Living">Home & Living</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter Lainnya
            </Button>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] text-center">No</TableHead>
                  <TableHead>Order SN</TableHead>
                  <TableHead>Produk</TableHead>
                  {/* <TableHead>SKU</TableHead> */}
                  <TableHead>Total Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metode Bayar</TableHead>
                  <TableHead>No. Resi</TableHead>
                  <TableHead className="text-center w-auto">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && dataDetail.map((order, idx) => (
                  <TableRow key={order.order_sn}>
                    <TableCell className="text-center font-medium">
                      {(page - 1) * 5 + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{order.order_sn}</TableCell>
                    <TableCell>{order.item_list[0].item_name}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">Rp {Number(order.total_amount).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge className={statusColorMap[order.order_status] || "bg-gray-400 text-white"}>
                        {order.order_status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.payment_method}</TableCell>
                    <TableCell>
                      {order.package_list[0].package_number ? order.package_list[0].package_number : "-"}
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
                          <DropdownMenuItem onClick={() => console.log("Detail")}>
                            <Eye className="mr-2 h-4 w-4" /> Detail
                          </DropdownMenuItem>
                          {order.package_list[0].package_number && (
                            <DropdownMenuItem onClick={() => console.log("Lacak")}>
                              <MapPin className="mr-2 h-4 w-4" /> Lacak
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && (
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
                )}
                {error && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination pakai shadcn */}
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => loadOrders(page - 1)}
                    aria-disabled={page === 1 || loading}
                  />
                </PaginationItem>

                {[...Array(page + (hasMore ? 1 : 0))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => loadOrders(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => loadOrders(page + 1)}
                    aria-disabled={!hasMore || loading}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
