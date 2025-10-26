import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { X, Package, Calendar, CreditCard, Truck, Clock, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
interface image_info {
    image_url: string;
}
interface ItemList {
    item_name: string;
    model_quantity_purchased: number;
    model_original_price: number;
    model_discounted_price: number;
    image_info: image_info
    weight: number;
    item_id?: number;
    model_id?: number;
}

interface PackageList {
    package_number: string;
    logistics_status: string;
    shipping_carrier: string;
    group_shipment_id?: string | null;
    item_list?: any[];
}

interface OrderData {
    order_sn: string;
    order_status: string;
    create_time: number;
    ship_by_date: number;
    payment_method: string;
    currency: string;
    total_amount: number;
    shipping_carrier: string;
    item_list: ItemList[];
    package_list: PackageList[];
}

interface OrderDetailModalProps {
    orderData: OrderData | null;
    isOpen?: boolean;
    onClose: () => void;
}

interface StatusConfig {
    bg: string;
    text: string;
    label: string;
}

const ShopeeOrderDetail: React.FC<OrderDetailModalProps> = ({
    orderData,
    isOpen = true,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [shouldRender, setShouldRender] = useState<boolean>(isOpen);


    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            setTimeout(() => setShouldRender(false), 300);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    if (!orderData || !shouldRender) return null;

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getStatusConfig = (status: string): StatusConfig => {
        const statusConfig: Record<string, StatusConfig> = {
            'UNPAID': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Belum Dibayar' },
            'READY_TO_SHIP': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Siap Dikirim' },
            'PROCESSED': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', label: 'Diproses' },
            'SHIPPED': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Dikirim' },
            'COMPLETED': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Selesai' },
            'IN_CANCEL': { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Dalam Pembatalan' },
            'CANCELLED': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', label: 'Dibatalkan' },
            'INVOICE_PENDING': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Invoice Tertunda' },
            'LOGISTICS_REQUEST_CREATED': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Menunggu Pickup' },
            'LOGISTICS_PICKUP_DONE': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Sudah Dipickup' },
            'LOGISTICS_READY_TO_SHIP': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', label: 'Siap Dikirim' },
            'LOGISTICS_IN_TRANSIT': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', label: 'Dalam Perjalanan' },
            'LOGISTICS_DELIVERED': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Terkirim' }
        };
        return statusConfig[status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', label: status };
    };

    const subtotal: number = orderData.item_list.reduce((sum, item) =>
        sum + (item.model_discounted_price * item.model_quantity_purchased), 0
    );
    const shippingFee: number = orderData.total_amount - subtotal;
    const statusConfig: StatusConfig = getStatusConfig(orderData.order_status);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='p-0 sm:max-w-3xl rounded-2xl'>
                <DialogHeader className='p-7 pb-0 pt-5 rounded-t-2xl '>
                    <DialogTitle>
                        <h2 className="text-3xl font-bold ">Detail Pesanan</h2>
                    </DialogTitle>
                    <DialogDescription>
                        <div>
                            <div className="flex items-center gap-3 ">
                                <p className=" text-sm font-medium">No. Pesanan</p>
                                <code className="bg-white/20 px-3 py-1 rounded-md text-sm font-mono backdrop-blur-sm">
                                    {orderData.order_sn}
                                </code>
                                  <span className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-lg text-sm font-semibold`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <div className='max-h-[90dvh]'>
                    {/* Content */}
                    <div className="overflow-y-auto flex-1 px-8 py-6 max-h-[60vh]">
                        {/* Timeline Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-orange-300 dark:hover:border-orange-600 transition-all hover:shadow-md dark:bg-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                            Tanggal Pesanan
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                            {formatDate(orderData.create_time)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-md dark:bg-gray-800/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                            Batas Pengiriman
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                            {formatDate(orderData.ship_by_date)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Section */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Produk yang Dipesan</h3>
                            </div>

                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                {orderData.item_list.map((item, index) => (
                                    <div key={index}>
                                        {index > 0 && <div className="border-t border-gray-200 dark:border-gray-700" />}
                                        <div className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex gap-5">
                                                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                                                    <img
                                                        src={item.image_info.image_url}
                                                        alt={item.item_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-base">
                                                        {item.item_name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            Berat: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.weight} kg</span>
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            Jumlah: <span className="font-semibold text-gray-700 dark:text-gray-300">x{item.model_quantity_purchased}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <div>
                                                            {item.model_original_price !== item.model_discounted_price && (
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 line-through mb-1">
                                                                    {formatPrice(item.model_original_price)}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                            {formatPrice(item.model_discounted_price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Shipping Info */}
                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md dark:bg-gray-800/50 transition-shadow">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pengiriman</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                            Kurir Pengiriman
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {orderData.shipping_carrier}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700" />

                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                            Nomor Resi
                                        </p>
                                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md inline-block font-semibold text-gray-800 dark:text-gray-200">
                                            {orderData.package_list[0].package_number}
                                        </code>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700" />

                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                            Status Pengiriman
                                        </p>
                                        {(() => {
                                            const logisticsStatus: StatusConfig = getStatusConfig(orderData.package_list[0].logistics_status);
                                            return (
                                                <span className={`${logisticsStatus.bg} ${logisticsStatus.text} px-3 py-1.5 rounded-lg text-sm font-semibold inline-block`}>
                                                    {logisticsStatus.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md dark:bg-gray-800/50 transition-shadow">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pembayaran</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                            Metode Pembayaran
                                        </p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                            {orderData.payment_method}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700" />

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal Produk</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Ongkos Kirim</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {formatPrice(shippingFee)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700" />

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total Pembayaran</span>
                                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                            {formatPrice(orderData.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t h-auto border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-8 py-5 flex gap-3 justify-end rounded-b-2xl">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all font-semibold"
                        >
                            Tutup
                        </button>

                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
export default ShopeeOrderDetail