"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Edit, Trash2, ImageIcon, UploadCloud } from "lucide-react"

interface ProductImage {
    id: number
    image: string
}

interface Product {
    id: number
    name: string
    description: string
    tokopedia_link: string
    shopee_link: string
    price: number
    images: ProductImage[]
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [errorMsg, setErrorMsg] = useState<string>("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
    const [formState, setFormState] = useState({
        name: "",
        description: "",
        tokopedia_link: "",
        shopee_link: "",
        price: "",
        images: [] as File[], // gambar baru
    })
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]) // gambar lama
    const [deletedImages, setDeletedImages] = useState<number[]>([]) // id gambar yg ditandai hapus

    // 🚀 Fetch produk dari Django
    const fetchProducts = () => {
        fetch("http://localhost:8000/api/products/")
            .then((res) => res.json())
            .then((data) => setProducts(data))
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState((prev) => ({ ...prev, [name]: value }))
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
    }

    // 👉 hanya tandai untuk dihapus, belum kirim ke server
    const markImageForDeletion = (id: number) => {
        setDeletedImages((prev) => [...prev, id])
        setExistingImages((prev) => prev.filter((img) => img.id !== id))
    }

    const handleSaveProduct = async () => {
        const totalImages =
            existingImages.length + formState.images.length - deletedImages.length

        if (totalImages < 1) {
            setErrorMsg("Minimal 1 foto produk wajib diunggah.")
            return
        }
        try {
            setErrorMsg("") // reset error
            const formData = new FormData()
            formData.append("name", formState.name)
            formData.append("description", formState.description)
            formData.append("tokopedia_link", formState.tokopedia_link)
            formData.append("shopee_link", formState.shopee_link)
            formData.append("price", formState.price)

            let product
            if (currentProduct) {
                const res = await fetch(`http://localhost:8000/api/products/${currentProduct.id}/`, {
                    method: "PATCH",
                    body: formData,
                })
                product = await res.json()
            } else {
                const res = await fetch("http://localhost:8000/api/products/", {
                    method: "POST",
                    body: formData,
                })
                product = await res.json()
            }

            // --- 2. Hapus gambar lama yang ditandai ---
            for (const id of deletedImages) {
                try {
                    const delRes = await fetch(
                        `http://localhost:8000/api/products/${product.id}/images/${id}/`,
                        { method: "DELETE" }
                    )
                    if (!delRes.ok) {
                        const txt = await delRes.text()
                        console.error("❌ Gagal hapus image", id, delRes.status, txt)
                    } else {
                        console.log("✅ Berhasil hapus image", id)
                    }
                } catch (err) {
                    console.error("❌ Network error saat hapus image", id, err)
                }
            }

            // --- 3. Upload gambar baru ---
            for (const file of formState.images) {
                const imgData = new FormData()
                imgData.append("image", file)
                await fetch(`http://localhost:8000/api/products/${product.id}/upload-image/`, {
                    method: "POST",
                    body: imgData,
                })
            }

            // --- 4. Refresh & reset ---
            fetchProducts()
            setIsModalOpen(false)
            resetForm()
            setDeletedImages([]) // reset
        } catch (error) {
            console.error("Error saving product:", error)
        }
    }

    const handleEditProduct = (product: Product) => {
        setCurrentProduct(product)
        setFormState({
            name: product.name,
            description: product.description,
            tokopedia_link: product.tokopedia_link,
            shopee_link: product.shopee_link,
            price: String(product.price),
            images: [],
        })
        setExistingImages(product.images) // simpan gambar lama
        setDeletedImages([]) // reset hapus
        setIsModalOpen(true)
    }

    const handleDeleteProduct = async (id: number) => {
        await fetch(`http://localhost:8000/api/products/${id}/`, { method: "DELETE" })
        setProducts((prev) => prev.filter((p) => p.id !== id))
    }

    const resetForm = () => {
        setCurrentProduct(null)
        setFormState({
            name: "",
            description: "",
            tokopedia_link: "",
            shopee_link: "",
            price: "",
            images: [],
        })
        setExistingImages([])
        setDeletedImages([])
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Data Produk</h1>
                <p className="text-muted-foreground">Kelola daftar produk Anda.</p>
            </div>

            {/* Product List */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-card-foreground">Daftar Produk</CardTitle>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm} className="gap-2">
                                <PlusCircle className="h-4 w-4" /> Tambah Produk
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[80dvh] bg-card text-card-foreground border-border p-6">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-2xl font-bold text-card-foreground">
                                    {currentProduct ? "Edit Produk" : "Tambah Produk Baru"}
                                </DialogTitle>
                                <CardDescription className="text-muted-foreground">
                                    {currentProduct ? "Ubah detail produk." : "Tambahkan produk baru ke daftar Anda."}
                                </CardDescription>
                            </DialogHeader>

                            {/* Form */}
                            <div className="grid px-2 gap-6 py-4 max-h-[80dvh] overflow-y-scroll">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Produk</Label>
                                        <Input id="name" name="name" value={formState.name} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Harga</Label>
                                        <Input id="price" name="price" type="number" min={1} value={formState.price} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea id="description" name="description" value={formState.description} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tokopedia_link">Link Tokopedia</Label>
                                        <Input id="tokopedia_link" name="tokopedia_link" value={formState.tokopedia_link} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="shopee_link">Link Shopee</Label>
                                        <Input id="shopee_link" name="shopee_link" value={formState.shopee_link} onChange={handleInputChange} />
                                    </div>
                                </div>

                                {/* Upload Images */}
                                <div className="space-y-2">
                                    <Label htmlFor="images">Gambar Produk (maks 4)</Label>
                                    <div className="border border-dashed border-border rounded-md p-4 flex flex-col items-center justify-center gap-3 bg-background/50">
                                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Seret & lepas gambar di sini, atau</p>
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

                                    {/* Preview Existing Images */}
                                    {existingImages.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                                            {existingImages.map((img, index) => (
                                                <div key={`db-${img.id}`} className="relative group aspect-square rounded-md overflow-hidden border border-border">
                                                    <img src={img.image} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => markImageForDeletion(img.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Preview New Images */}
                                    {formState.images.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                                            {formState.images.map((image, index) => (
                                                <div key={`new-${index}`} className="relative group aspect-square rounded-md overflow-hidden border border-border">
                                                    <img src={URL.createObjectURL(image)} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {formState.images.length + existingImages.length < 4 && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Anda dapat mengunggah {4 - (formState.images.length + existingImages.length)} gambar lagi.
                                        </p>
                                    )}
                                    {errorMsg && (
                                        <p className="text-sm text-red-500 mt-2">{errorMsg}</p>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                <Button type="button" onClick={handleSaveProduct}>Simpan Produk</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                {/* Table */}
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>Gambar</TableHead>
                                    <TableHead>Nama Produk</TableHead>
                                    <TableHead>Harga</TableHead>
                                    <TableHead>Link Tokopedia</TableHead>
                                    <TableHead>Link Shopee</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product, idx) => (
                                    <TableRow key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/70"}>
                                        <TableCell>
                                            {product.images.length > 0 ? (
                                                <img src={product.images[0].image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                                            ) : (
                                                <ImageIcon className="w-16 h-16 text-muted-foreground" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>Rp {product.price.toLocaleString("id-ID")}</TableCell>
                                        <TableCell>
                                            <a href={product.tokopedia_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a>
                                        </TableCell>
                                        <TableCell>
                                            <a href={product.shopee_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Link</a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
