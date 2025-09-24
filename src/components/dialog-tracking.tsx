import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { CheckCircle2, Clock } from "lucide-react"
import { fetchOrderTrackingInfo, fetchOrderTrackingNumber } from "@/lib/shopee/api"
import {
    Package,
    Truck,
    Box,
    Send,
} from "lucide-react"
interface DialogTrackingProps {
    trackOpen: boolean
    setTrackOpen: React.Dispatch<React.SetStateAction<boolean>>
    serialNumber: string
    product: string
    carrier: string
    token: string
}
export interface TrackingInfo {
    update_time: number
    description: string
    logistics_status: string
    icon?: React.ElementType // tambahan, kalau kamu mau assign icon di FE
    label?: string           // tambahan, kalau kamu butuh nama step untuk UI
}

export interface TrackingResponse {
    logistics_status: string
    order_sn: string
    tracking_info: TrackingInfo[]
}
interface TrackingResponseData {
    pickup_code: string
    tracking_number: string
    hint: string
}
const DialogTracking = ({
    serialNumber,
    setTrackOpen,
    trackOpen,
    product,
    carrier,
    token
}: DialogTrackingProps) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
    const [data, setData] = useState<TrackingResponse | null>(null)
    const [progressPercent, setProgressPercent] = useState<number>(0)
    const canonicalSteps = [
        { id: "step-1", label: "Diproses Seller", icon: Package, statuses: ["ORDER_CREATED"] },
        { id: "step-2", label: "Di Hub / Gudang", icon: Truck, statuses: ["LOGISTICS_REQUEST_CREATED"] },
        { id: "step-3", label: "Dalam Perjalanan", icon: Send, statuses: ["ORDER_PICKED_UP", "ORDER_SHIPPED"] },
        { id: "step-4", label: "Antar Kurir", icon: CheckCircle2, statuses: ["ORDER_DELIVERED"] },
    ]
    const [isCanceled, setIsCanceled] = useState(false)
    const [lastUpdate, setLastUpdate] = useState()
    const [trackingNumber, setTrackingNumber] = useState<TrackingResponseData | null>(null)
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchOrderTrackingInfo(serialNumber, token)
                const response = data.response
                setData(response)

                // tandai cancel
                setIsCanceled(response.logistics_status === "LOGISTICS_REQUEST_CANCELED")

                if (response.tracking_info.length > 0) {
                    const sorted = [...response.tracking_info].sort(
                        (a, b) => b.update_time - a.update_time
                    )
                    setLastUpdate(sorted[0].update_time) // simpan angka timestamp
                    // ambil semua status yang match di canonicalSteps
                    const indices = response.tracking_info
                        .map((t: { logistics_status: string }) =>
                            canonicalSteps.findIndex((step) =>
                                step.statuses.includes(t.logistics_status),
                            ),
                        )
                        .filter((i: number) => i >= 0)

                    let foundIndex = indices.length > 0 ? Math.max(...indices) : 0

                    setActiveStepIndex(foundIndex)

                    // hitung persentase (dibagi jumlah step - 1 supaya step pertama bukan langsung 100%)
                    const denom = canonicalSteps.length - 1
                    const percent = denom > 0 ? (foundIndex / denom) * 100 : 0
                    setProgressPercent(percent)
                } else {
                    setActiveStepIndex(0)
                    setProgressPercent(0)
                }
            } catch (err) {
                console.error("Gagal fetch tracking info:", err)
            }
        }
        const getTracking = async () => {
            try {
                const data = await fetchOrderTrackingNumber(serialNumber, token)
                const response = data.response
                setTrackingNumber(response)
            } catch (err) {
                console.error("Gagal fetch tracking info:", err)
            }
        }
        if (serialNumber) {
            getData()
            getTracking()
            setLoading(false)
        }
    }, [serialNumber])


    return (
        <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Tracking Barang Shopee</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {`Produk : ${product}`}
                    </DialogDescription>
                </DialogHeader>

                {loading ? <div className="grid gap-6">
                    {/* Skeleton Shipment summary */}
                    <div className="grid gap-4 rounded-lg border border-border p-4 bg-card">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Stepper */}
                    <div className="rounded-lg border border-border p-4 bg-card">
                        <div className="grid grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2">
                                    <div className="size-10 rounded-full bg-muted animate-pulse" />
                                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 h-2 w-full bg-muted rounded animate-pulse" />
                    </div>

                    {/* Skeleton Timeline */}
                    <div className="rounded-lg border border-border p-4 bg-card">
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="size-4 rounded-full bg-muted animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                                        <div className="h-3 w-44 bg-muted rounded animate-pulse" />
                                    </div>
                                    <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div> : <div className="grid gap-6">
                    {/* Shipment summary */}
                    <div className="grid gap-4 rounded-lg border border-border p-4 bg-card text-card-foreground">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Kurir</p>
                                <p className="font-bold">{carrier}</p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                                Status: {activeStepIndex < 3 ? "Dalam Proses" : "Antar Kurir"}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Nomor Resi</p>
                                <p className="font-bold select-all">{trackingNumber ? trackingNumber.tracking_number : "-"}</p>
                            </div>
                            {/* <div>
                                <p className="text-sm text-muted-foreground">Perkiraan Tiba</p>
                                <p className="font-medium">2-3 hari kerja</p>
                            </div> */}
                            <div>
                                <p className="text-sm text-muted-foreground">Terakhir Diperbarui</p>
                                <p className="font-bold">  {lastUpdate ? new Date(lastUpdate * 1000).toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                    timeZone: "Asia/Jakarta"
                                }) : "-"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Resi input */}
                    {/* <div className="grid gap-2">
                        <Label htmlFor="resi">Nomor Resi</Label>
                        <div className="flex gap-2">
                            <Input
                                id="resi"
                                placeholder="Masukkan nomor resi"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="bg-card text-card-foreground"
                            />
                            <Button
                                onClick={() => {
                                    if (!trackingNumber) {
                                        const rnd = Math.floor(Math.random() * 1_000_000_000)
                                            .toString()
                                            .padStart(9, "0")
                                        setTrackingNumber(rnd)
                                    }
                                }}
                                variant="outline"
                            >
                                Isi Otomatis
                            </Button>
                        </div>
                    </div> */}

                    {/* Horizontal stepper */}
                    <div className="rounded-lg border border-border p-4 bg-card text-card-foreground">
                        <div className="grid grid-cols-4 gap-4">
                            {data
                                ? data.tracking_info
                                    .slice()
                                    .sort((a, b) => a.update_time - b.update_time) // urut lama -> baru
                                    .map((s, idx) => {
                                        const isLast = idx === data.tracking_info.length - 1
                                        const done = !isLast && idx <= activeStepIndex

                                        // mapping icon sesuai status
                                        const statusIconMap: Record<string, React.ElementType> = {
                                            ORDER_CREATED: Package,              // 📦 paket dibuat
                                            LOGISTICS_REQUEST_CREATED: Truck,    // 🚚 permintaan pengiriman
                                            ORDER_PICKED_UP: Box,                // 📤 diambil kurir
                                            ORDER_SHIPPED: Send,                 // 🚀 dikirim
                                            ORDER_DELIVERED: CheckCircle2,       // ✅ sampai
                                            UNKNOWN: Clock,                      // fallback
                                        }

                                        const Icon = statusIconMap[s.logistics_status] || Clock

                                        // ubah status ke bahasa Indo
                                        const statusMap: Record<string, string> = {
                                            ORDER_CREATED: "Pesanan Dibuat",
                                            LOGISTICS_REQUEST_CREATED: "Permintaan Pengiriman",
                                            ORDER_PICKED_UP: "Paket Diambil Kurir",
                                            ORDER_SHIPPED: "Dalam Perjalanan",
                                            ORDER_DELIVERED: "Pesanan Terkirim",
                                            UNKNOWN: "Status Tidak Diketahui",
                                        }

                                        const statusLabel = statusMap[s.logistics_status] || s.logistics_status

                                        return (
                                            <div key={`${s.logistics_status}-${s.update_time}`} className="flex flex-col items-center text-center gap-2">
                                                <div
                                                    className={`size-10 rounded-full flex items-center justify-center border transition-colors
                ${done ? "bg-orange-600/10 border-orange-600 text-orange-600" : "bg-muted border-border text-muted-foreground"}`}
                                                >
                                                    {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                                </div>
                                                <p className={`text-xs ${done ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {statusLabel}
                                                </p>
                                            </div>
                                        )
                                    })
                                : ""}

                        </div>
                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="h-2 w-full rounded-full bg-muted relative overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${isCanceled ? "bg-red-500" : "bg-orange-600"}`}
                                    style={{ width: `${progressPercent}%` }}
                                    aria-valuenow={progressPercent}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    role="progressbar"
                                />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span>Mulai</span>
                                <span>Selesai</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-lg border border-border p-4 bg-card text-card-foreground">
                        <p className="text-sm font-medium mb-3">Status Pengiriman</p>
                        <ol className="relative border-s border-dashed border-border">
                            {data?.tracking_info.map((t, idx) => {
                                const reached = idx <= activeStepIndex

                                // Format jam Indonesia (WIB)
                                const waktu = new Date(t.update_time * 1000).toLocaleTimeString("id-ID", {
                                    timeZone: "Asia/Jakarta",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })

                                // Translate status agar lebih ramah
                                const statusMap: Record<string, string> = {
                                    ORDER_CREATED: "Pesanan Dibuat",
                                    LOGISTICS_REQUEST_CREATED: "Permintaan Pengiriman Dibuat",
                                    ORDER_PICKED_UP: "Paket Telah Diambil",
                                    ORDER_SHIPPED: "Dalam Perjalanan",
                                    ORDER_DELIVERED: "Pesanan Terkirim",
                                }

                                const statusLabel = statusMap[t.logistics_status] || t.logistics_status

                                return (
                                    <li key={t.logistics_status} className="ms-4 py-3">
                                        <span
                                            className={`absolute -start-2 top-4 flex items-center justify-center rounded-full border
                                            ${reached ? "bg-orange-600 text-white border-orange-600" : "bg-muted text-muted-foreground border-border"} size-4`}
                                        />
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="w-[80%]">
                                                <p className={`text-sm font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {statusLabel}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{t.description}</p>
                                            </div>
                                            <div className="w-auto flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>{waktu} WIB</span>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}

                        </ol>
                        {/* {!trackingNumber && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Masukkan nomor resi untuk melihat estimasi yang lebih akurat.
                            </p>
                        )} */}
                    </div>

                    {/* Map placeholder */}
                    {/* <div className="rounded-lg border border-border overflow-hidden">
                        <img
                            src="/map-preview-for-delivery-route.jpg"
                            alt="Pratinjau peta rute pengiriman"
                            className="w-full h-48 object-cover"
                        />
                    </div> */}
                </div>}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setTrackOpen(false)
                        }}
                    >
                        Tutup
                    </Button>
                    {/* <Button
                        onClick={() => {
                            setTrackOpen(true)
                        }}
                        disabled={!trackingNumber}
                    >
                        Cek Status
                    </Button> */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
export default DialogTracking