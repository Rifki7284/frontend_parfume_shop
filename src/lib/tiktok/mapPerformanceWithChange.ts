// utils/mapPerformanceToStats.ts
import { ShoppingCart, Package, DollarSign, Users } from "lucide-react"

function calcChange(now: number, prev: number) {
  if (!prev || prev === 0) return { change: "0%", type: "increase" }
  const diff = ((now - prev) / prev) * 100
  return {
    change: `${diff.toFixed(1)}%`,
    type: diff >= 0 ? "increase" : "decrease"
  }
}

export function mapPerformanceWithChange(nowRes: any, prevRes: any) {
  const now = nowRes?.data.performance?.intervals?.[0] || {}
  const prev = prevRes?.data.performance?.intervals?.[0] || {}
  
  const ordersChange = calcChange(now.orders , prev.orders )
  const gmvChange = calcChange(Number(now.gmv?.amount ), Number(prev.gmv?.amount ))
  const soldChange = calcChange(now.units_sold , prev.units_sold )
  const buyersChange = calcChange(now.buyers , prev.buyers )

  return [
    {
      title: "Total Order",
      value: now.orders,
      change: ordersChange.change,
      changeType: ordersChange.type,
      icon: ShoppingCart,
      bgGradient: "bg-gradient-to-r from-indigo-100 to-indigo-50",
      borderColor: "border-indigo-200",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Total GMV",
      value: `Rp ${Number(now.gmv?.amount).toLocaleString("id-ID")}`,
      change: gmvChange.change,
      changeType: gmvChange.type,
      icon: DollarSign,
      bgGradient: "bg-gradient-to-r from-emerald-100 to-emerald-50",
      borderColor: "border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Barang Terjual",
      value: now.units_sold ,
      change: soldChange.change,
      changeType: soldChange.type,
      icon: Package,
      bgGradient: "bg-gradient-to-r from-amber-100 to-amber-50",
      borderColor: "border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Pembeli",
      value: now.buyers ,
      change: buyersChange.change,
      changeType: buyersChange.type,
      icon: Users,
      bgGradient: "bg-gradient-to-r from-rose-100 to-rose-50",
      borderColor: "border-rose-200",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ]
}
