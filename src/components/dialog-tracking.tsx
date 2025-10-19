"use client"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import {
    CheckCircle2,
    Clock,
    Package,
    Truck,
    Box,
    Send,
    XCircle,
    AlertCircle,
    AlertTriangle,
} from "lucide-react"
import { fetchOrderTrackingInfo, fetchOrderTrackingNumber } from "@/lib/shopee/api"

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
    token,
}: DialogTrackingProps) => {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<TrackingResponse | null>(null)
    const [lastUpdate, setLastUpdate] = useState<number | null>(null)
    const [trackingNumber, setTrackingNumber] = useState<TrackingResponseData | null>(null)

    // ✅ Peta status lengkap (13 status)
    const statusMap: Record<string, { label: string; icon: any; stepOrder: number }> = {
        LOGISTICS_NOT_START: { label: "Belum Diproses", icon: Clock, stepOrder: 0 },
        LOGISTICS_PENDING_ARRANGE: { label: "Menunggu Pengaturan", icon: Clock, stepOrder: 0 },
        LOGISTICS_READY: { label: "Siap Dikirim", icon: Package, stepOrder: 1 },
        LOGISTICS_COD_REJECTED: { label: "COD Ditolak", icon: XCircle, stepOrder: 1 },
        LOGISTICS_REQUEST_CREATED: { label: "Pengiriman Diatur", icon: Truck, stepOrder: 2 },
        LOGISTICS_REQUEST_CANCELED: { label: "Dibatalkan", icon: XCircle, stepOrder: 2 },
        LOGISTICS_PICKUP_RETRY: { label: "Menunggu Pickup Ulang", icon: Clock, stepOrder: 3 },
        LOGISTICS_PICKUP_DONE: { label: "Diambil Kurir", icon: Box, stepOrder: 3 },
        LOGISTICS_PICKUP_FAILED: { label: "Pickup Gagal", icon: XCircle, stepOrder: 3 },
        LOGISTICS_DELIVERY_DONE: { label: "Terkirim", icon: CheckCircle2, stepOrder: 4 },
        LOGISTICS_DELIVERY_FAILED: { label: "Pengiriman Gagal", icon: XCircle, stepOrder: 4 },
        LOGISTICS_INVALID: { label: "Dibatalkan (Invalid)", icon: AlertCircle, stepOrder: 1 },
        LOGISTICS_LOST: { label: "Paket Hilang", icon: AlertTriangle, stepOrder: 4 },
    }

    // Status yang menandakan pembatalan
    const canceledStatuses = [
        "LOGISTICS_INVALID",
        "LOGISTICS_REQUEST_CANCELED",
        "LOGISTICS_PICKUP_FAILED",
        "LOGISTICS_DELIVERY_FAILED",
        "LOGISTICS_LOST",
        "LOGISTICS_COD_REJECTED",
    ]

    // ✅ Fetch data
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchOrderTrackingInfo(serialNumber, token)
                const response = data.response
                setData(response)

                if (response.tracking_info.length > 0) {
                    const sorted = [...response.tracking_info].sort((a, b) => b.update_time - a.update_time)
                    setLastUpdate(sorted[0].update_time)
                }
            } catch (err) {
                console.error("Gagal fetch tracking info:", err)
            } finally {
                setLoading(false)
            }
        }

        const getTracking = async () => {
            try {
                const data = await fetchOrderTrackingNumber(serialNumber, token)
                setTrackingNumber(data.response)
            } catch (err) {
                console.error("Gagal fetch tracking number:", err)
            }
        }

        if (serialNumber) Promise.all([getData(), getTracking()])
    }, [serialNumber, token])

    // Hitung status pengiriman
    const sortedTracking = data?.tracking_info
        ?.slice()
        .sort((a, b) => a.update_time - b.update_time) || []

    // Ambil status terbaru dari tracking_info atau fallback ke response.logistics_status
    const latestStatus = sortedTracking.length > 0
        ? sortedTracking[sortedTracking.length - 1]?.logistics_status
        : data?.logistics_status || ""

    const isCanceled = canceledStatuses.includes(latestStatus)

    // Hitung step aktif berdasarkan stepOrder tertinggi
    let activeStepOrder = 0
    if (sortedTracking.length > 0) {
        activeStepOrder = Math.max(...sortedTracking.map(t => statusMap[t.logistics_status]?.stepOrder ?? 0))
    } else if (data?.logistics_status) {
        // Jika tracking_info kosong, gunakan logistics_status utama
        activeStepOrder = statusMap[data.logistics_status]?.stepOrder ?? 0
    }

    // Progress bar (0-4 steps = 0-100%)
    const progressPercent = isCanceled ? 100 : (activeStepOrder / 4) * 100

    // Step-step untuk stepper (5 langkah utama)
    const stepperSteps = [
        { order: 0, label: "Belum Diproses", icon: Clock },
        { order: 1, label: "Siap Dikirim", icon: Package },
        { order: 2, label: "Pengiriman Diatur", icon: Truck },
        { order: 3, label: "Diambil Kurir", icon: Box },
        { order: 4, label: "Terkirim", icon: CheckCircle2 },
    ]

    return (
        <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Tracking Barang Shopee</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Produk: {product}
                    </DialogDescription>
                </DialogHeader>

                {/* Loader */}
                {loading ? (
                    <div className="grid gap-6">
                        <div className="h-40 rounded-lg bg-muted animate-pulse" />
                        <div className="h-24 rounded-lg bg-muted animate-pulse" />
                        <div className="h-48 rounded-lg bg-muted animate-pulse" />
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* Summary */}
                        <div className="border p-4 rounded-lg bg-card">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Kurir</p>
                                    <p className="font-bold">{carrier}</p>
                                </div>
                                <Badge
                                    variant={isCanceled ? "destructive" : "default"}
                                    className="shrink-0"
                                >
                                    {isCanceled
                                        ? "Dibatalkan"
                                        : activeStepOrder === 4
                                            ? "Terkirim"
                                            : "Dalam Proses"}
                                </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Nomor Resi</p>
                                    <p className="font-semibold select-all">
                                        {trackingNumber?.tracking_number || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Terakhir Diperbarui</p>
                                    <p className="font-semibold">
                                        {lastUpdate
                                            ? new Date(lastUpdate * 1000).toLocaleString("id-ID", {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                                timeZone: "Asia/Jakarta",
                                            })
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stepper (5 langkah utama) */}
                        <div className="border p-4 rounded-lg bg-card">
                            <div className="grid grid-cols-5 gap-4">
                                {stepperSteps.map((step) => {
                                    const done = step.order <= activeStepOrder
                                    const Icon = step.icon
                                    return (
                                        <div
                                            key={step.order}
                                            className="flex flex-col items-center text-center gap-2"
                                        >
                                            <div
                                                className={`size-10 rounded-full flex items-center justify-center border transition-colors ${done
                                                    ? isCanceled
                                                        ? "bg-red-600/10 border-red-600 text-red-600"
                                                        : "bg-orange-600/10 border-orange-600 text-orange-600"
                                                    : "bg-muted border-border text-muted-foreground"
                                                    }`}
                                            >
                                                {done ? (
                                                    isCanceled && step.order === activeStepOrder ? (
                                                        <XCircle className="h-5 w-5" />
                                                    ) : (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    )
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </div>
                                            <p
                                                className={`text-xs ${done
                                                    ? "text-foreground font-medium"
                                                    : "text-muted-foreground"
                                                    }`}
                                            >
                                                {step.label}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-4">
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all rounded-full ${isCanceled ? "bg-red-500" : "bg-orange-600"
                                            }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                    <span>Mulai</span>
                                    <span>Selesai</span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="border p-4 rounded-lg bg-card">
                            <p className="text-sm font-medium mb-3">Riwayat Pengiriman</p>


                            {sortedTracking.length > 0 ? (
                                <ol className="relative border-s border-dashed border-border">
                                    {sortedTracking.map((t, idx) => {
                                        const isLatest = idx === sortedTracking.length - 1
                                        const statusInfo = statusMap[t.logistics_status] || {
                                            label: t.logistics_status,
                                            icon: Clock,
                                            stepOrder: 0,
                                        }
                                        const Icon = statusInfo.icon

                                        const waktu = new Date(t.update_time * 1000).toLocaleTimeString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            timeZone: "Asia/Jakarta",
                                        })

                                        const tanggal = new Date(t.update_time * 1000).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })

                                        return (
                                            <li key={`${t.logistics_status}-${idx}`} className="ms-4 py-3 relative">
                                                <span
                                                    className={`absolute -start-2 top-4 rounded-full border flex items-center justify-center ${isLatest
                                                        ? isCanceled
                                                            ? "bg-red-600 border-red-600 size-4"
                                                            : "bg-orange-600 border-orange-600 size-4"
                                                        : "bg-orange-600/10 border-orange-600 size-3"
                                                        }`}
                                                />
                                                <div className="flex justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className={`h-4 w-4 ${isLatest ? "text-foreground" : "text-muted-foreground"
                                                                }`} />
                                                            <p className={`text-sm font-medium ${isLatest ? "text-foreground" : "text-muted-foreground"
                                                                }`}>
                                                                {statusInfo.label}
                                                            </p>
                                                        </div>
                                                        {t.description && (
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {t.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs flex items-center gap-1 text-muted-foreground justify-end">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {waktu}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {tanggal}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ol>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        {isCanceled ? (
                                            <>
                                                <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                                                    <XCircle className="h-6 w-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-red-700">
                                                        {statusMap[latestStatus]?.label || "Pesanan Dibatalkan"}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Pesanan ini telah dibatalkan
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Clock className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Belum Ada Riwayat</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Informasi pengiriman belum tersedia
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                <DialogFooter>
                    <Button variant="outline" onClick={() => setTrackOpen(false)}>
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogTracking