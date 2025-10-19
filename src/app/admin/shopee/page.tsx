"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { ChevronDown, CreditCard, DollarSign, MapPin, MoreVertical, Package, ShoppingCart, Truck, Users } from "lucide-react"
import DialogTracking from "@/components/dialog-tracking"
import { useSession } from "next-auth/react"
import ModernGlassPreloader from "@/components/modern-glass-preloader"
import { StatsCard } from "@/components/stats-card"
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


export interface MonthlyStats {
  total_orders: number;
  customers: number;
  sold: number;
  gmv: number;
}
export interface ShopeeStatsResponse {
  this_month: MonthlyStats;
  last_month: MonthlyStats;
}
export default function ShopeePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [openDialog, setOpenDialog] = useState(false)
  const [product, setProduct] = useState<string>("")
  const [stats, setStats] = useState<ShopeeStatsResponse | null>(null)
  const [serialNumber, setSerialNumber] = useState<string>("")
  const [carrier, setCarrier] = useState<string>("")
  const { data: session, status } = useSession();
  const api = process.env.NEXT_PUBLIC_API_URL
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [pageSize, setPageSize] = useState(5)
  const [loadStatsNow, setLoadStatsNow] = useState<boolean>(true)
  const [loadStatsPrev, setLoadStatsPrev] = useState<boolean>(true)
  async function loadStats() {
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
      setStats(data)
      setLoadStatsNow(false)
      setLoadStatsPrev(false)
    } catch (err) {
      console.log(err)
    }
  }

  const { page, hasMore, loadOrders, loading, error, dataDetail } = useOrderList(pageSize, session?.user?.accessToken ?? "", statusFilter)
  const filteredData = dataDetail.filter((order: any) => {
    const term = searchTerm.toLowerCase();

    // cek jika search kosong => tampilkan semua
    if (!term) return true;

    return (
      order.order_sn.toLowerCase().includes(term) || // cari di Order ID
      order.item_list[0]?.item_name.toLowerCase().includes(term) || // cari di nama produk
      order.payment_method?.toLowerCase().includes(term) || // cari di metode bayar
      String(order.total_amount).includes(term) // cari di harga
    );
  });
  const handleOpenDialog = (product: string, serialNumber: string, carrier: string) => {
    setOpenDialog(true)
    setProduct(product)
    setSerialNumber(serialNumber)
    setCarrier(carrier)
  }
  useEffect(() => {
    if (session?.user?.accessToken != undefined) {
      loadStats()

    }
  }, [status, session?.user?.accessToken]);
  if (status == "loading") return <ModernGlassPreloader />;

  return (
    <div className="space-y-6 bg-white min-h-screen p-6 dark:bg-gray-950">
      <div className="flex flex-col  gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Data Penjualan Shopee</h1>
          <p className="text-muted-foreground text-pretty">Kelola dan pantau performa toko di Shopee</p>
        </div>

      </div>

      {/* Shopee Metrics */}
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
                bgGradient: "bg-gray-50 dark:bg-gray-800",
                borderColor: "border-gray-200 dark:border-gray-700",
                iconBg: "bg-gray-200 dark:bg-gray-700",
                iconColor: "text-gray-400 dark:text-gray-500",
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
              bgGradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
              iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600",
              iconColor: "text-white",
              borderColor: "border-blue-200 dark:border-blue-800",
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
              bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
              iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600",
              iconColor: "text-white",
              borderColor: "border-emerald-200 dark:border-emerald-800",
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
              bgGradient: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
              iconBg: "bg-gradient-to-br from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600",
              iconColor: "text-white",
              borderColor: "border-orange-200 dark:border-orange-800",
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
              bgGradient: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
              iconBg: "bg-gradient-to-br from-purple-500 to-violet-500 dark:from-purple-600 dark:to-violet-600",
              iconColor: "text-white",
              borderColor: "border-purple-200 dark:border-purple-800",
            }} />

          </>
        )}
      </div>

      {/* Products Table */}
      <Card className="border border-slate-200 dark:border-slate-800 py-0 overflow-hidden shadow-lg bg-white dark:bg-slate-900 hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gray-50 dark:bg-slate-800 py-5 rounded-t-lg border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Daftar Produk Shopee</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
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
                  className="pl-8 w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="UNPAID">Belum Dibayar</SelectItem>
                  <SelectItem value="READY_TO_SHIP">Siap Dikirim</SelectItem>
                  <SelectItem value="SHIPPED">Dikirim</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                  <SelectItem value="TO_CONFIRM_RECEIVE">Menunggu Konfirmasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <TableHead className="w-[60px] text-center text-slate-700 dark:text-slate-300">No</TableHead>
                    <TableHead>Order SN</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Total Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metode Bayar</TableHead>
                    <TableHead className="text-center w-auto">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {loading ? (
                    <TableRow className="dark:bg-slate-900">
                      <TableCell colSpan={8} className="text-center py-6 dark:bg-slate-900">
                        <div className="flex items-center justify-center gap-2 dark:bg-slate-900 text-muted-foreground">
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
                  ) : filteredData.length > 0 ? filteredData.map((order: any, idx: number) => (
                    <TableRow key={order.order_sn} className={idx % 2 === 0
                      ? "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
                      : "bg-gray-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800"
                    }>
                      <TableCell className="text-center font-medium">
                        {(page - 1) * pageSize + idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">{order.order_sn}</TableCell>
                      <TableCell>{order.item_list[0].item_name}</TableCell>
                      <TableCell className="font-semibold text-emerald-600">
                        Rp {Number(order.total_amount).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColorMap[order.order_status] || "bg-gray-400 text-white"}>
                          {order.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.payment_method}</TableCell>
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
                            <DropdownMenuItem onClick={() => console.log("Detail")}>
                              <Eye className="mr-2 h-4 w-4" /> Detail
                            </DropdownMenuItem>
                            {order.package_list[0]?.package_number && (
                              <DropdownMenuItem
                                onClick={() => handleOpenDialog(
                                  order.item_list[0].item_name,
                                  order.order_sn,
                                  order.shipping_carrier
                                )}
                              >
                                <MapPin className="mr-2 h-4 w-4" /> Lacak
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (<TableRow>
                    <TableCell colSpan={8} className="h-64">
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
                        <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-gray-300 dark:text-slate-600"
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
                        <p className="text-lg font-semibold text-gray-500 dark:text-slate-400 mb-2">Tidak Ada Data</p>
                        <p className="text-sm text-gray-400 dark:text-slate-500">Belum ada pesanan yang tersedia</p>
                      </div>
                    </TableCell>
                  </TableRow>)}
                  {error && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-red-500 text-center py-4">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {!loading && filteredData.map((order: any, idx: number) => (
                <div
                  key={order.order_sn}
                  className="bg-white overflow-hidden dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                        {(page - 1) * pageSize + idx + 1}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Order SN</p>
                        <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{order.order_sn}</p>
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
                        <DropdownMenuItem onClick={() => console.log("Detail")}>
                          <Eye className="mr-2 h-4 w-4" /> Detail
                        </DropdownMenuItem>
                        {order.package_list[0]?.package_number && (
                          <DropdownMenuItem
                            onClick={() => handleOpenDialog(
                              order.item_list[0].item_name,
                              order.order_sn,
                              order.shipping_carrier
                            )}
                          >
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
                      <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">Produk</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {order.item_list[0].item_name}
                        </p>
                      </div>
                    </div>

                    {/* Price & Status */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">Total Harga</p>
                        <p className="text-base font-bold text-emerald-600">
                          Rp {Number(order.total_amount).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">Status</p>
                        <Badge className={statusColorMap[order.order_status] || "bg-gray-400 text-white"}>
                          {order.order_status}
                        </Badge>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                      <CreditCard className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 dark:text-slate-400">Metode Pembayaran</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{order.payment_method}</p>
                      </div>
                    </div>

                    {/* Tracking Info (if available) */}
                    {order.package_list[0]?.package_number && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <Truck className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-slate-400">Kurir</p>
                          <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{order.shipping_carrier}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading State - Mobile */}
              {loading && (
                <div className="bg-white border border-gray-200 dark:bg-slate-900 rounded-lg p-8">
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
              )}

              {/* Error State - Mobile */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 text-center font-medium">{error}</p>
                </div>
              )}

              {/* Empty State - Mobile */}
              {!loading && !error && dataDetail.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                    <Package className="h-12 w-12 text-gray-400" />
                    <p className="text-sm font-medium">Tidak ada data pesanan</p>
                  </div>
                </div>
              )}
            </div>
          </>

          {/* Pagination pakai shadcn */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-slate-300">Data per halaman:</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                    }}
                    className="px-3 py-2 pr-8 border border-gray-300 dark:border-slate-700 rounded-lg appearance-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
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
              <span className="text-sm text-gray-700 dark:text-slate-300 w-auto">
                Halaman {page}
              </span>
              <div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (page > 1 && !loading) {
                            loadOrders(page - 1);
                          }
                        }}
                        aria-disabled={page === 1 || loading}
                        className={`
                        ${page === 1 || loading
                            ? 'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 border-gray-200 dark:border-slate-700'
                            : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                          }
                      `}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (hasMore && !loading) {
                            loadOrders(page + 1);
                          }
                        }}
                        aria-disabled={!hasMore || loading}
                        className={`
                        ${!hasMore || loading
                            ? 'opacity-50 cursor-not-allowed pointer-events-none bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 border-gray-200 dark:border-slate-700'
                            : 'cursor-pointer hover:bg-gray-800 dark:hover:bg-white bg-gray-900 dark:bg-slate-700 text-white dark:text-slate-900 dark:hover:text-black border-gray-900 dark:border-slate-600'
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
      <DialogTracking token={session?.user?.accessToken ?? ""} setTrackOpen={setOpenDialog} trackOpen={openDialog} product={product} serialNumber={serialNumber} carrier={carrier} />
    </div>
  )
}
