"use client"

import React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2, ImageIcon, UploadCloud, Search, ChevronDown, Package, TrendingUp, AlertTriangle, X, ExternalLink, Image, SearchIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import ModernGlassPreloader from "@/components/modern-glass-preloader"
import toast, { Toaster } from 'react-hot-toast';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
interface DeleteConfirmationDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    itemName?: string

}

type Props = {
    page: number
    setPage: (page: number) => void
    totalPages: number
}
function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    itemName,
}: DeleteConfirmationDialogProps) {
    const [isAnimating, setIsAnimating] = useState<boolean>(false)

    React.useEffect(() => {
        if (isOpen) {
            setIsAnimating(true)
        }
    }, [isOpen])

    const handleClose = () => {
        setIsAnimating(false)
        setTimeout(() => {
            onClose()
        }, 200) // Delay sesuai durasi animasi
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/10 h-[100vh] z-50 transition-opacity duration-200 ${isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={`bg-white rounded-xl shadow-2xl max-w-md w-full transition-all duration-200 ${isAnimating
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'
                        }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Konfirmasi Hapus</h3>
                                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:rotate-90"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p className="text-gray-700 mb-4 transition-all duration-300">
                            Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-900">{itemName}</span>?
                        </p>

                        {/* {itemDetails && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 transform transition-all duration-300 hover:scale-[1.02]">
                <p className="text-sm text-gray-600">{itemDetails}</p>
              </div>
            )} */}

                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded transform transition-all duration-300 hover:translate-x-1">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-bounce" />
                                <p className="text-sm text-red-800">
                                    Data yang dihapus tidak dapat dikembalikan. Pastikan Anda benar-benar ingin melanjutkan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                handleClose()
                            }}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
interface ProductImage {
    id: number
    image: string
}

interface Product {
    id: number
    slug: string
    name: string
    description: string
    brand?: string
    gender?: string
    volume_ml?: number
    fragrance_notes_top?: string
    fragrance_notes_middle?: string
    fragrance_notes_base?: string
    tokopedia_link?: string
    shopee_link?: string
    tiktok_link?: string
    price: number
    images: ProductImage[]
}
export default function ProductsPage() {
    const [pageSize, setPageSize] = useState(5)
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true)
    const [search, setSearch] = useState("")
    const [products, setProducts] = useState<Product[]>([])
    const [errorMsg, setErrorMsg] = useState<string>("")
    const { data: session, status } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [genderFilter, setGenderFilter] = useState<string>("all")
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
    const [formState, setFormState] = useState({
        name: "",
        brand: "",
        description: "",
        gender: "unisex",
        volume_ml: "50",
        fragrance_notes_top: "",
        fragrance_notes_middle: "",
        fragrance_notes_base: "",
        tokopedia_link: "",
        slug: "",
        shopee_link: "",
        tiktok_link: "",
        price: "",
        images: [] as File[],
    })
    const [existingImages, setExistingImages] = useState<ProductImage[]>([])
    const [deletedImages, setDeletedImages] = useState<number[]>([])
    const [isPageSizeOpen, setIsPageSizeOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
    const [selectedItem, setSelectedItem] = useState<any>()
    const [nextCursor, setNextCursor] = useState(null);
    const [prevCursor, setPrevCursor] = useState(null);
    const api = process.env.NEXT_PUBLIC_API_URL
    const handleDeleteClick = (item: any): void => {
        setSelectedItem(item)
        setIsDialogOpen(true)
    }


    const fetchProducts = async (
        cursorUrl = "",
        size = pageSize,
        query = search,
        gender = genderFilter,
        resetPage = false
    ) => {
        try {
            setLoading(true);

            // Base URL API
            let url = `${api}/api/products/?page_size=${size}&search=${encodeURIComponent(query)}`;

            // Tambahkan filter gender (kecuali "all")
            if (gender && gender !== "all") {
                url += `&gender=${encodeURIComponent(gender)}`;
            }

            // Jika ada cursor (next/previous)
            if (cursorUrl) {
                url = cursorUrl;
            }

            const res = await fetch(url);
            const data = await res.json();

            setProducts(data.results || []);
            setNextCursor(data.next);
            setPrevCursor(data.previous);

            // Reset ke halaman pertama jika fetch baru
            if (resetPage) setCurrentPage(1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts("", pageSize, search, genderFilter, true);
    }, [pageSize, search, genderFilter]);
    const handleNext = () => {
        if (nextCursor) {
            setCurrentPage((prev) => prev + 1);
            fetchProducts(nextCursor);
        }
    };

    const handlePrev = () => {
        if (prevCursor && currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
            fetchProducts(prevCursor);
        }
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormState((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        setFormState((prev) => ({
            ...prev,
            images: [...prev.images, ...Array.from(files)],
        }))
    }

    const handleRemoveImage = (index: number) => {
        setFormState((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }))
        console.log(formState.images)
    }

    const markImageForDeletion = (id: number) => {
        setDeletedImages((prev) => [...prev, id])
        setExistingImages((prev) => prev.filter((img) => img.id !== id))

    }

    const handleSaveProduct = async () => {
        const remainingExisting = existingImages.filter(
            (img) => !deletedImages.includes(img.id)
        )
        const totalImages = remainingExisting.length + formState.images.length

        if (totalImages < 1) {
            setErrorMsg("Minimal 1 foto produk wajib diunggah.")
            return
        } else {
            setErrorMsg("")
        }
        try {
            if (session?.user.accessToken != undefined) {
                setErrorMsg("")
                const formData = new FormData()
                for (const key in formState) {
                    if (key !== "images") formData.append(key, (formState as any)[key])
                }

                let product
                if (currentProduct) {
                    const res = await fetch(`http://localhost:8000/api/products/${currentProduct.id}/`, {
                        method: "PATCH",
                        body: formData,
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                    product = await res.json()
                } else {
                    const res = await fetch("http://localhost:8000/api/products/", {
                        method: "POST",
                        body: formData,
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                    product = await res.json()
                }

                // Hapus gambar
                for (const id of deletedImages) {
                    await fetch(`http://localhost:8000/api/products/${product.id}/images/${id}/`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                }

                // Upload gambar baru
                for (const file of formState.images) {
                    const imgData = new FormData()
                    imgData.append("image", file)
                    await fetch(`http://localhost:8000/api/products/${product.id}/upload-image/`, {
                        method: "POST",
                        body: imgData,
                        headers: {
                            Authorization: `Bearer ${session.user.accessToken}`,
                        },
                    })
                }

                toast.success("Data berhasil disimpan")
                fetchProducts()
                setIsModalOpen(false)
                resetForm()
            }
        } catch (error) {
            toast.error("Terjadi kesalahan")
            console.error("Error saving product:", error)
        }
    }

    const handleEditProduct = (product: Product) => {
        setCurrentProduct(product)
        setFormState({
            name: product.name,
            brand: product.brand || "",
            description: product.description,
            gender: product.gender || "unisex",
            slug: product.slug,
            volume_ml: String(product.volume_ml || 50),
            fragrance_notes_top: product.fragrance_notes_top || "",
            fragrance_notes_middle: product.fragrance_notes_middle || "",
            fragrance_notes_base: product.fragrance_notes_base || "",
            tokopedia_link: product.tokopedia_link || "",
            shopee_link: product.shopee_link || "",
            tiktok_link: product.tiktok_link || "",
            price: String(product.price),
            images: [],
        })
        setExistingImages(product.images)
        setDeletedImages([])
        setIsModalOpen(true)
    }

    const handleDeleteProduct = async (id: number) => {
        if (session?.user.accessToken != undefined) {
            try {
                await fetch(`http://localhost:8000/api/products/${id}/`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${session.user.accessToken}`,
                    },
                })
                setProducts((prev) => prev.filter((p) => p.id !== id))
                toast.success("Data berhasil dihapus")
            }
            catch (e) {
                console.log(e)
                toast.error("Terjadi kesalahan")
            }
        }
    }

    const resetForm = () => {
        setFormState({
            name: "",
            brand: "",
            description: "",
            gender: "unisex",
            volume_ml: "50",
            fragrance_notes_top: "",
            fragrance_notes_middle: "",
            fragrance_notes_base: "",
            tokopedia_link: "",
            slug: "",
            shopee_link: "",
            tiktok_link: "",
            price: "",
            images: [],
        })
        setExistingImages([])
        setDeletedImages([])
        setCurrentProduct(null)
    }

    if (status == "loading") return <ModernGlassPreloader />;

    return (
        <div className="space-y-6 bg-white min-h-screen p-6 dark:bg-gray-950">
            <Toaster position="top-right" />

            <div className=" mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Data Produk
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola daftar produk Anda dengan mudah</p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={resetForm}
                                className="gap-2 bg-black dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                <PlusCircle className="h-4 w-4" /> Tambah Produk
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-2xl font-bold">{currentProduct ? "Edit Produk" : "Tambah Produk Baru"}</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-6 px-2 py-4 max-h-[70vh] overflow-y-auto" style={{

                                scrollbarWidth: "none",     // Hilangkan scrollbar di Firefox
                                msOverflowStyle: "none",    // Hilangkan scrollbar di IE & Edge lama
                            }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Produk</Label>
                                        <Input id="name" name="name" value={formState.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Brand</Label>
                                        <Input id="brand" name="brand" value={formState.brand} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Harga</Label>
                                        <Input id="price" name="price" type="number" min={1} value={formState.price} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Gender</Label>
                                        <select id="gender" name="gender" value={formState.gender} onChange={handleInputChange} className="border rounded-md p-2 w-full">
                                            <option value="male">Pria</option>
                                            <option value="female">Wanita</option>
                                            <option value="unisex">Unisex</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="volume_ml">Volume (ml)</Label>
                                        <Input id="volume_ml" name="volume_ml" type="number" value={formState.volume_ml} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="volume_ml">Slug</Label>
                                        <Input id="volume_ml" name="slug" value={formState.slug} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} />
                                    </div>

                                    {/* Fragrance Notes */}
                                    <div className="space-y-2">
                                        <Label>Top Notes</Label>
                                        <Input name="fragrance_notes_top" value={formState.fragrance_notes_top} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Middle Notes</Label>
                                        <Input name="fragrance_notes_middle" value={formState.fragrance_notes_middle} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Base Notes</Label>
                                        <Input name="fragrance_notes_base" value={formState.fragrance_notes_base} onChange={handleInputChange} />
                                    </div>

                                    {/* Links */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tokopedia_link">Link Tokopedia</Label>
                                        <Input id="tokopedia_link" name="tokopedia_link" value={formState.tokopedia_link} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shopee_link">Link Shopee</Label>
                                        <Input id="shopee_link" name="shopee_link" value={formState.shopee_link} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tiktok_link">Link TikTok</Label>
                                        <Input id="tiktok_link" name="tiktok_link" value={formState.tiktok_link} onChange={handleInputChange} />
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="images">Gambar Produk (maks 4)</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <UploadCloud className="h-10 w-10 text-gray-400" />
                                        <p className="text-sm text-gray-600">Seret & lepas gambar di sini, atau</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById("image-upload-input")?.click()}
                                            disabled={formState.images.length + existingImages.length >= 4}
                                        >
                                            Pilih Gambar
                                        </Button>
                                        <Input
                                            id="image-upload-input"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={formState.images.length + existingImages.length >= 4}
                                        />
                                    </div>

                                    {/* Existing + New images */}
                                    {existingImages.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                                            {existingImages.map((img) => (
                                                <div key={`db-${img.id}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img src={img.image} alt="Existing" className="w-full h-full object-cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        onClick={() => markImageForDeletion(img.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {formState.images.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                                            {formState.images.map((image, index) => (
                                                <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                                    <img src={URL.createObjectURL(image)} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errorMsg && <p className="text-sm text-red-500 mt-2 font-medium">{errorMsg}</p>}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button onClick={handleSaveProduct} className="bg-black hover:bg-gray-800">
                                    Simpan Produk
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Cards */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Produk</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{count}</h3>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ditampilkan</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{products.length}</h3>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white sm:col-span-2 lg:col-span-1">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Halaman</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{page} / {Math.ceil(count / pageSize)}</h3>
                                </div>
                                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Search className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div> */}

                {/* Product List Card */}
                <Card className="border border-gray-200 dark:border-gray-700 pb-5 py-0 overflow-hidden shadow-lg bg-white dark:bg-gray-900 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800 py-5 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Daftar Produk</CardTitle>
                    </CardHeader>

                    <CardContent className="pb-8">
                        {/* Search and Filter Bar */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:flex-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        placeholder="Cari produk..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 w-full md:w-[300px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                fetchProducts(search)
                                            }
                                        }}
                                    />
                                </div>
                                <Select
                                    value={genderFilter}
                                    onValueChange={(value) => {
                                        setGenderFilter(value);
                                    }}
                                >
                                    <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <SelectValue placeholder="Filter Gender" />
                                    </SelectTrigger>

                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                        <SelectItem value="all" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Semua Gender</SelectItem>
                                        <SelectItem value="male" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Pria</SelectItem>
                                        <SelectItem value="female" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Wanita</SelectItem>
                                        <SelectItem value="unisex" className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">Unisex</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button onClick={resetForm} className="gap-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all">
                                <PlusCircle className="h-4 w-4" /> Tambah Produk
                            </Button>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden lg:block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                        <TableHead className="text-center w-[80px] font-bold text-gray-700 dark:text-gray-200">No</TableHead>
                                        <TableHead className="font-bold text-gray-700 dark:text-gray-200">Gambar</TableHead>
                                        <TableHead className="font-bold text-gray-700 dark:text-gray-200 min-w-[200px]">Nama Produk</TableHead>
                                        <TableHead className="font-bold text-gray-700 dark:text-gray-200 min-w-[150px]">Detail</TableHead>
                                        <TableHead className="font-bold text-gray-700 dark:text-gray-200 min-w-[120px]">Harga</TableHead>
                                        <TableHead className="font-bold text-gray-700 dark:text-gray-200 text-center min-w-[140px]">Marketplace</TableHead>
                                        <TableHead className="font-bold text-gray-700 dark:text-gray-200 text-center min-w-[120px]">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!loading && products.map((product, index) => (
                                        <TableRow key={product.id} className={index % 2 === 0
                                            ? "bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
                                            : "bg-gray-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800"
                                        }>
                                            <TableCell className="text-center text-gray-700 dark:text-gray-300">
                                                {(currentPage - 1) * pageSize + (index + 1)}
                                            </TableCell>
                                            <TableCell>
                                                {product.images.length > 0 ? (
                                                    <div className="relative">
                                                        <img
                                                            src={product.images[0].image}
                                                            alt={product.name}
                                                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-md group-hover:scale-105 group-hover:shadow-xl transition-all duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-md">
                                                        <Image className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-base leading-tight">{product.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{product.brand}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold dark:border dark:border-blue-700">
                                                            {product.volume_ml}ml
                                                        </span>
                                                        <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-md text-xs font-semibold dark:border dark:border-purple-700">
                                                            {product.gender}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-700 font-medium">
                                                            {product.fragrance_notes_top}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full border border-pink-200 dark:border-pink-700 font-medium">
                                                            {product.fragrance_notes_middle}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-700 font-medium">
                                                            {product.fragrance_notes_base}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                    Rp {Number(product.price).toLocaleString("id-ID")}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <a
                                                        href={product.tokopedia_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg font-semibold text-sm transition-all hover:shadow-md group/link dark:border dark:border-green-700"
                                                    >
                                                        <span>Tokopedia</span>
                                                        <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                    </a>
                                                    <a
                                                        href={product.shopee_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg font-semibold text-sm transition-all hover:shadow-md group/link dark:border dark:border-orange-700"
                                                    >
                                                        <span>Shopee</span>
                                                        <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleEditProduct(product)}
                                                        className="hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-all border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(product)}
                                                        className="hover:bg-red-700 transition-all bg-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {loading && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Memuat data...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!loading && products.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-16">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                        <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tidak ada data ditemukan</p>
                                                        <p className="text-gray-500 dark:text-gray-400">Coba ubah kata kunci pencarian</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile & Tablet Card View */}
                        <div className="lg:hidden space-y-3 sm:space-y-4">
                            {!loading && products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                                >
                                    <div className="p-4">
                                        {/* Top Section: Image and Badge */}
                                        <div className="flex gap-3 mb-3">
                                            <div className="relative flex-shrink-0">
                                                {product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0].image}
                                                        alt={product.name}
                                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                        <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                                <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                                    #{(currentPage - 1) * pageSize + (index + 1)}
                                                </div>
                                            </div>

                                            {/* Title and Meta */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1 line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    {product.brand} • {product.volume_ml}ml • {product.gender}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 dark:border dark:border-purple-700">
                                                {product.fragrance_notes_top}
                                            </span>
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 dark:border dark:border-pink-700">
                                                {product.fragrance_notes_middle}
                                            </span>
                                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 dark:border dark:border-amber-700">
                                                {product.fragrance_notes_base}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                            Rp {Number(product.price).toLocaleString("id-ID")}
                                        </div>

                                        {/* Links */}
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                            <a
                                                href={product.tokopedia_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold"
                                            >
                                                Tokopedia
                                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            </a>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <a
                                                href={product.shopee_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold"
                                            >
                                                Shopee
                                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            </a>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1.5 dark:border dark:border-blue-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                                <span className="text-xs sm:text-sm">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                className="flex-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1.5 dark:border dark:border-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="text-xs sm:text-sm">Hapus</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading State */}
                            {loading && (
                                <div className="flex items-center justify-center py-12 sm:py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="animate-spin rounded-full h-10 w-10  sm:h-12 border-b-2 border-blue-600 dark:border-blue-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Memuat data...</span>
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && products.length === 0 && (
                                <div className="text-center py-12 sm:py-16">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
                                        <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
                                        <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tidak ada data ditemukan</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Coba ubah kata kunci pencarian</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Pilihan jumlah data per halaman */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Data per halaman:</span>
                                    <Select
                                        value={String(pageSize)}
                                        onValueChange={(value) => setPageSize(Number(value))}
                                    >
                                        <SelectTrigger className="w-[80px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                                            <SelectValue placeholder={pageSize} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                            {[5, 10, 25, 50, 100].map((size) => (
                                                <SelectItem key={size} value={String(size)} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Halaman {currentPage}
                                </span>
                                {/* Navigasi halaman */}
                                <div className="flex items-center gap-3">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={handlePrev}
                                                    aria-disabled={!prevCursor || loading}
                                                    className={`${!prevCursor || loading
                                                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700"
                                                        : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                                                        }`}
                                                />
                                            </PaginationItem>

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={handleNext}
                                                    aria-disabled={!nextCursor || loading}
                                                    className={`${!nextCursor || loading
                                                        ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700"
                                                        : "cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 bg-gray-900 dark:bg-gray-700 text-white border-gray-900 dark:border-gray-600"
                                                        }`}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Backdrop for dropdown */}
            {
                isPageSizeOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsPageSizeOpen(false)}
                    ></div>
                )
            }
            <DeleteConfirmationDialog
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false)
                    setSelectedItem(null)
                }}
                onConfirm={() => handleDeleteProduct(selectedItem?.id)}
                itemName={selectedItem?.name}
            />
        </div >
    )
}