'use client'
import ClientNavbar from "@/components/client-navbar"
import "../style.css"
import Image from 'next/image';
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { FaTiktok } from "react-icons/fa";
import { SiShopee } from "react-icons/si";
import ClientPreloader from "@/components/client-preloader";
import ClientFooter from "@/components/client-footer";
interface ProductImage {
    id: number
    image: string
}
interface Product {
    id: number
    name: string
    description: string
    fragrance_notes_top: string
    fragrance_notes_middle: string
    fragrance_notes_base: string
    tokopedia_link: string
    tiktok_link: string
    shopee_link: string
    gender: string
    slug: string
    volume_ml: string
    price: number
    brand: string
    images: ProductImage[]
}
const Page = () => {
    const router = useRouter()
    const { slug } = useParams<{ slug: string }>()  // ambil slug dari URL
    const api = process.env.NEXT_PUBLIC_API_URL
    const [products, setProducts] = useState<Product>()
    const [productsMore, setProductsMore] = useState<Product[]>([])
    const [mainImage, setMainImage] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(true)
    const [loadingMore, setLoadingMore] = useState<boolean>(true)
    const [nextCursor, setNextCursor] = useState(null);
    const [prevCursor, setPrevCursor] = useState(null);
    const fetchProducts = () => {
        fetch(`${api}/api/products/by-slug/${slug}/`)
            .then((res) => res.json())
            .then((data) => {
                setProducts(data)
                setMainImage(data?.images[0]?.image || "")
                setLoading(false)
            })
            .catch((err) => {
                console.error("Fetch error:", err)
                setLoading(false)
            })
    }
    const fetchProductsMore = async (cursor: string | null = null, append = false) => {
        try {
            if (!append) setLoading(true)
            else setLoadingMore(true)

            let url = `${api}/api/products/exclude-slug/${slug}/?page_size=6`
            if (cursor) {
                // ambil hanya nilai cursor-nya, bukan URL penuh
                const cursorValue = cursor.split('cursor=')[1]
                url += `?cursor=${cursorValue}`
            }

            const res = await fetch(url)
            if (!res.ok) throw new Error('Gagal mengambil data produk')

            const data = await res.json()
            setNextCursor(data.next)
            if (append) {
                setProductsMore((prev) => [...prev, ...(data.results || [])])
            } else {
                setProductsMore(data.results || [])
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }
    useEffect(() => {
        fetchProducts()
        fetchProductsMore()
    }, [])

    return (
        <>
            {loading == true && <ClientPreloader />}
            {loading == false && <div className="font-sans bg-yellow-50 text-red-900 overflow-x-hidden">
                <ClientNavbar />
                <div className="fixed top-1/5 left-1/12 w-16 h-16 bg-gradient-to-br from-primary-gold/20 to-deep-maroon/10 rounded-full animate-float z-0"></div>
                <div className="fixed top-3/5 right-1/6 w-12 h-12 bg-gradient-to-br from-primary-gold/20 to-deep-maroon/10 rounded-full animate-float z-0" style={{ animationDelay: "3s" }}></div>
                <div className="fixed bottom-1/4 left-1/6 w-14 h-14 bg-gradient-to-br from-primary-gold/20 to-deep-maroon/10 rounded-full animate-float z-0" style={{ animationDelay: "6s" }}></div>
                <section className="pt-32 pb-8 bg-gradient-to-br from-cream-beige to-warm-beige relative z-10">
                    <div className="max-w-7xl mx-auto px-4 md:px-10">
                        <nav className="flex items-center space-x-2 text-sm animate-fade-in">
                            <a href="home.html" className="text-burgundy hover:text-primary-gold transition-colors duration-300 font-medium">Home</a>
                            <span className="text-primary-gold font-semibold">⟩</span>
                            <a href="#" className="text-burgundy hover:text-primary-gold transition-colors duration-300 font-medium">Products</a>
                            <span className="text-primary-gold font-semibold">⟩</span>
                            <span className="text-primary-gold font-semibold">{products?.name}</span>
                        </nav>
                    </div>
                </section>
                <section className="py-16 md:py-24 bg-gradient-to-br from-cream-beige to-warm-beige relative z-10">
                    <div className="max-w-7xl mx-auto px-4 md:px-10">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                            <div className="space-y-8 animate-fade-in">
                                <div className="flex justify-center ">
                                    <div className="relative group max-w-lg w-full">
                                        <div className="absolute -inset-4 bg-gradient-to-r from-primary-gold to-burgundy rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                        <div className=" w-full h-[500px] md:h-[700px] bg-gradient-to-br from-white via-warm-beige to-soft-beige rounded-3xl relative shadow-2xl shadow-deep-maroon/30 border-3 border-primary-gold transform transition-all duration-700 group-hover:scale-105 group-hover:-rotate-1">
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gradient-to-br from-deep-maroon to-burgundy rounded-t-lg border-2 border-primary-gold shadow-lg"></div>
                                            <div className="absolute overflow-hidden top-12 left-8 right-8 bottom-32 bg-white rounded-3xl shadow-inner">
                                                <Image
                                                    src={mainImage}
                                                    alt={""}
                                                    fill
                                                    className="object-contain  transition-transform duration-700 group-hover:scale-105 mix-blend-multiply opacity-95 backdrop-brightness-105 contrast-110"
                                                />
                                            </div>
                                            {/* <div className="absolute top-20 left-12 right-12 h-32 bg-gradient-to-r from-transparent via-primary-gold/20 to-transparent rounded-full opacity-60"></div> */}
                                            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-8 py-6 rounded-xl text-center border-2 border-primary-gold shadow-xl">
                                                <h3 className="font-playfair text-xl text-deep-maroon mb-2">{products?.name}</h3>
                                                <p className="text-xs text-primary-gold tracking-widest uppercase font-medium">WANGY COLLECTION</p>
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent rounded-b-3xl"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-4 ">
                                    {products?.images.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setMainImage(item.image)} // 👉 klik ubah state
                                            className={`relative w-20 h-20 bg-gradient-to-br from-soft-beige to-warm-beige rounded-lg 
                                            border-2 ${mainImage == item.image ? "border-primary-gold" : "border-transparent"} hover:border-primary-gold shadow-md cursor-pointer 
                                            transition-all duration-300 hover:scale-110 hover:shadow-lg opacity-70 hover:opacity-100`}
                                        >
                                            <Image
                                                src={item.image}
                                                alt={`${products.name} thumbnail`}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}

                                    {/* <div className="w-20 h-20 bg-gradient-to-br from-white to-soft-beige rounded-lg border-2 border-primary-gold shadow-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg"></div>
                                    <div className="w-20 h-20 bg-gradient-to-br from-soft-beige to-warm-beige rounded-lg border-2 border-transparent hover:border-primary-gold shadow-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg opacity-70 hover:opacity-100"></div>
                                    <div className="w-20 h-20 bg-gradient-to-br from-warm-beige to-white rounded-lg border-2 border-transparent hover:border-primary-gold shadow-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg opacity-70 hover:opacity-100"></div> */}
                                </div>
                            </div>

                            <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-sm text-primary-gold tracking-[3px] uppercase mb-3 font-medium">Signature Collection</p>
                                        <h1 className="font-playfair text-4xl md:text-6xl font-light text-deep-maroon mb-4 leading-tight">{products?.name}</h1>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-4xl md:text-5xl font-light text-primary-gold">Rp.{Number(products?.price).toLocaleString("id-ID")}</p>
                                        {/* <span className="text-lg text-burgundy/60 line-through">Rp. 320</span>
                                        <span className="bg-deep-maroon text-cream-beige px-3 py-1 rounded-full text-sm font-medium">11% OFF</span> */}
                                    </div>
                                    <p className="text-burgundy text-lg leading-relaxed max-w-xl">
                                        {products?.description}
                                    </p>
                                </div>
                                {/* <div className="space-y-6 p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-primary-gold/30">
                                    <div>
                                        <h3 className="font-playfair text-lg text-deep-maroon mb-4">Size</h3>
                                        <div className="flex gap-3">
                                            <button className="px-6 py-3 border-2 border-primary-gold bg-primary-gold text-deep-maroon rounded-lg font-medium text-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">50ml</button>
                                            <button className="px-6 py-3 border-2 border-primary-gold/50 text-primary-gold rounded-lg font-medium text-sm transition-all duration-300 hover:border-primary-gold hover:bg-primary-gold hover:text-deep-maroon hover:-translate-y-1 hover:shadow-lg">100ml</button>
                                            <button className="px-6 py-3 border-2 border-primary-gold/50 text-primary-gold rounded-lg font-medium text-sm transition-all duration-300 hover:border-primary-gold hover:bg-primary-gold hover:text-deep-maroon hover:-translate-y-1 hover:shadow-lg">150ml</button>
                                        </div>
                                    </div>
                                </div> */}


                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <button onClick={() => router.push(products?.tiktok_link??"")} className="inline-flex gap-3 items-center justify-center px-6 py-4 bg-black text-white font-medium text-sm tracking-wide uppercase rounded-xl transition-all duration-300 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-lg">
                                            <FaTiktok width={24} height={24} />
                                            TikTok
                                        </button>

                                        <button onClick={() => router.push(products?.shopee_link??"")} className="inline-flex gap-3 items-center justify-center px-6 py-4 bg-orange-500 text-white font-medium text-sm tracking-wide uppercase rounded-xl transition-all duration-300 hover:bg-orange-600 hover:-translate-y-1 hover:shadow-lg">
                                            <SiShopee width={24} height={24} />
                                            Shopee
                                        </button>

                                        <button onClick={() => router.push(products?.tokopedia_link??"")} className="inline-flex gap-3 items-center justify-center px-6 py-4 bg-green-500 text-white font-medium text-sm tracking-wide uppercase rounded-xl transition-all duration-300 hover:bg-green-600 hover:-translate-y-1 hover:shadow-lg">
                                            <Image src="/tokopedia.svg" alt="Tokopedia" width={24} height={24} />
                                            Tokopedia
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-white relative z-10">
                    <div className="max-w-7xl mx-auto px-4 md:px-10">
                        <div className="text-center mb-16 animate-fade-in">
                            <p className="text-sm text-primary-gold tracking-[3px] uppercase mb-4">The Art of Perfumery</p>
                            <h2 className="font-playfair text-4xl md:text-5xl font-normal text-deep-maroon mb-6">Fragrance Architecture</h2>
                            <p className="text-burgundy text-base leading-relaxed max-w-2xl mx-auto">
                                Discover the intricate layers that make Zahwa keok a truly exceptional fragrance experience.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="group bg-gradient-to-br from-cream-beige to-warm-beige p-12 rounded-2xl text-center shadow-lg shadow-primary-gold/10 border-2 border-transparent hover:border-primary-gold transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:shadow-deep-maroon/20 relative overflow-hidden animate-fade-in">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-gold to-burgundy transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-gold to-rich-gold rounded-full mx-auto mb-8 flex items-center justify-center text-3xl text-deep-maroon border-3 border-deep-maroon group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-deep-maroon group-hover:to-burgundy group-hover:text-primary-gold transition-all duration-500">🌸</div>
                                <h3 className="font-playfair text-2xl mb-4 text-deep-maroon">Top Notes</h3>
                                <p className="text-burgundy text-sm leading-relaxed">
                                    {products?.fragrance_notes_top}
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-cream-beige to-warm-beige p-12 rounded-2xl text-center shadow-lg shadow-primary-gold/10 border-2 border-transparent hover:border-primary-gold transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:shadow-deep-maroon/20 relative overflow-hidden animate-fade-in" style={{ animationDelay: "0.2s" }}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-gold to-burgundy transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-gold to-rich-gold rounded-full mx-auto mb-8 flex items-center justify-center text-3xl text-deep-maroon border-3 border-deep-maroon group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-deep-maroon group-hover:to-burgundy group-hover:text-primary-gold transition-all duration-500">🌿</div>
                                <h3 className="font-playfair text-2xl mb-4 text-deep-maroon">Middle Notes</h3>
                                <p className="text-burgundy text-sm leading-relaxed">
                                    {products?.fragrance_notes_middle}
                                </p>
                            </div>

                            <div className="group bg-gradient-to-br from-cream-beige to-warm-beige p-12 rounded-2xl text-center shadow-lg shadow-primary-gold/10 border-2 border-transparent hover:border-primary-gold transition-all duration-500 hover:-translate-y-3 hover:shadow-xl hover:shadow-deep-maroon/20 relative overflow-hidden animate-fade-in" style={{ animationDelay: "0.4s" }}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-gold to-burgundy transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-gold to-rich-gold rounded-full mx-auto mb-8 flex items-center justify-center text-3xl text-deep-maroon border-3 border-deep-maroon group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-deep-maroon group-hover:to-burgundy group-hover:text-primary-gold transition-all duration-500">🌰</div>
                                <h3 className="font-playfair text-2xl mb-4 text-deep-maroon">Base Notes</h3>
                                <p className="text-burgundy text-sm leading-relaxed">
                                    {products?.fragrance_notes_base}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* <section className="py-20 bg-gradient-to-br from-soft-beige to-warm-beige relative z-10">
                    <div className="max-w-7xl mx-auto px-4 md:px-10">
                        <div className="max-w-4xl animate-fade-in">
                            <h2 className="font-playfair text-4xl md:text-5xl font-normal text-deep-maroon mb-12">About This Fragrance</h2>
                            <div className="prose prose-lg max-w-none space-y-8">
                                <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-primary-gold/30">
                                    <p className="text-burgundy leading-relaxed text-lg mb-6">
                                        Zahwa keok represents the pinnacle of perfumery artistry, where traditional craftsmanship meets modern sophistication. This exquisite fragrance was born from the vision of capturing the essence of a midnight garden, where moonlight dances on jasmine petals and whispers of romance fill the air.
                                    </p>
                                    <p className="text-burgundy leading-relaxed text-lg">
                                        Each bottle contains months of careful formulation, using only the finest ingredients sourced from around the world. The result is a fragrance that evolves beautifully throughout the day, revealing new facets of its personality with every passing hour.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section> */}
                <section className="py-32 bg-gradient-to-br from-cream-beige via-warm-beige to-white">
                    <div className="max-w-7xl mx-auto px-10">
                        <div className="text-center mb-20">
                            <p className="text-sm text-yellow-600 tracking-widest uppercase mb-4">Signature Collection</p>
                            <h2 className="font-serif text-5xl lg:text-6xl font-normal text-red-900 mb-6">Discover More</h2>
                            {/* <p className="text-red-700 text-base leading-relaxed max-w-2xl mx-auto">
                                Each fragrance tells a unique story, crafted with the finest ingredients and years of perfumery expertise.
                            </p> */}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {productsMore && productsMore?.length > 0 && productsMore.map((product, id) => (
                                <div key={id} className="group bg-gradient-to-br from-cream-beige to-warm-beige rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer border-2 border-transparent hover:border-primary-gold hover:-translate-y-4 hover:shadow-2xl hover:shadow-deep-maroon/20">
                                    <div className="relative aspect-[4/5] bg-gradient-to-br from-white to-soft-beige flex items-center justify-center overflow-hidden border-b-2 border-primary-gold">
                                        <Image
                                            src={product.images[0].image}
                                            alt={product.name}
                                            fill
                                            className="object-contain  transition-transform duration-700 group-hover:scale-105 mix-blend-multiply opacity-95 backdrop-brightness-105 contrast-110"
                                        />
                                    </div>


                                    <div className="p-10">
                                        <div >
                                            <p className="text-xs text-primary-gold tracking-[2px] uppercase mb-2">{product.brand}</p>
                                        </div>
                                        <div className="flex flex-col justify-start h-[4.5rem] mb-4">
                                            <h3 className="font-playfair text-2xl leading-snug text-deep-maroon line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <p className="text-red-800 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">
                                            {product.description}
                                        </p>
                                        <div className="flex-grow"></div>
                                        <p className="text-xl  font-semibold text-deep-maroon mb-5">Rp.{Number(product.price).toLocaleString("id-ID")}</p>
                                        <button onClick={() => router.push(`/product/${product?.slug}`)} className="w-full py-4 bg-transparent border-2 border-primary-gold text-primary-gold font-medium text-xs tracking-widest uppercase transition-all duration-500 rounded-lg relative overflow-hidden hover:text-deep-maroon hover:-translate-y-1 group/btn">
                                            <span className="absolute inset-0 bg-primary-gold transform -translate-x-full transition-transform duration-500 group-hover/btn:translate-x-0"></span>
                                            <span className="relative z-10">Add to Collection</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {nextCursor && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={() => fetchProductsMore(nextCursor, true)}
                                    disabled={loadingMore}
                                    className="px-8 py-4 bg-primary-gold text-deep-maroon font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>}
            <ClientFooter />

        </>
    )
}
export default Page