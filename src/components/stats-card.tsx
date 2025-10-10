import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

type Stat = {
  title: string
  value: string | number
  change: string
  changeType: "increase" | "decrease"
  icon: React.ElementType
  bgGradient: string
  borderColor: string
  iconBg: string
  iconColor: string
}

interface StatsCardProps {
  stat: Stat
  index: number
  loading?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({ stat, index, loading }) => {
  return (
    <Card
      key={stat.title}
      className={`${stat.bgGradient} ${stat.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm dark:text-slate-300 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
          {stat.title}
        </CardTitle>
        <div
          className={`${stat.iconBg} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-200`}
        >
          <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Value */}
        {loading ? (
          <div className="h-8 w-20 bg-slate-200 animate-pulse rounded mb-2"></div>
        ) : (
          <div className="text-3xl font-bold text-slate-900 mb-2 dark:text-slate-300">{stat.value}</div>
        )}

        {/* Change */}
        {loading ? (
          <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
        ) : (
          <div className="flex items-center text-sm">
            {stat.changeType === "increase" ? (
              <TrendingUp className="mr-2 h-4 w-4 text-emerald-600" />
            ) : (
              <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
            )}
            <span
              className={`font-semibold ${
                stat.changeType === "increase" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {stat.change}
            </span>
            <span className="ml-2 text-slate-500 dark:text-slate-400">dari bulan lalu</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
