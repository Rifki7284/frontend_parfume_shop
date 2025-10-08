'use client'
import ClientNavbar from "@/components/client-navbar"
import "./style.css"
import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { PackageX, Search } from "lucide-react"
import ClientFooter from "@/components/client-footer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
interface ProductImage {
    id: number
    image: string
}
interface EmptyStateProps {
    min: number;
    max: number;
    onClearFilters: () => void;
}
interface Product {
    id: number
    name: string
    slug: string
    description: string
    tokopedia_link: string
    shopee_link: string
    price: number
    brand: string
    images: ProductImage[]
}

const EmptyState: React.FC<EmptyStateProps> = ({ min, max, onClearFilters }) => {
    // Cek apakah ada filter aktif
    const hasActiveFilters: boolean = min > 0 || max > 0;

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            {/* Icon */}
            <div className="relative mb-6">
                <div className="w-32 h-32 rounded-full bg-primary-gold/10 flex items-center justify-center">
                    {hasActiveFilters ? (
                        <Search className="w-16 h-16 text-primary-gold/50" strokeWidth={1.5} />
                    ) : (
                        <PackageX className="w-16 h-16 text-primary-gold/50" strokeWidth={1.5} />
                    )}
                </div>
                {/* Decorative circle */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-burgundy/20 animate-pulse"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-primary-gold/30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-bold text-deep-maroon mb-3">
                {hasActiveFilters ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
            </h3>

            <p className="text-burgundy/70 text-center max-w-md mb-8">
                {hasActiveFilters
                    ? 'Maaf, tidak ada produk yang sesuai dengan filter harga Anda. Coba ubah rentang harga atau hapus filter untuk melihat semua produk.'
                    : 'Saat ini belum ada produk yang tersedia. Silakan kembali lagi nanti atau hubungi kami untuk informasi lebih lanjut.'}
            </p>

            {/* Show active filter info */}
            {hasActiveFilters && (
                <div className="mb-6 px-6 py-3 bg-cream rounded-lg border border-primary-gold/30">
                    <p className="text-sm text-burgundy">
                        Filter aktif:
                        {min > 0 && max > 0 && (
                            <span className="font-semibold"> Rp {min.toLocaleString('id-ID')} - Rp {max.toLocaleString('id-ID')}</span>
                        )}
                        {min > 0 && max === 0 && (
                            <span className="font-semibold"> Min Rp {min.toLocaleString('id-ID')}</span>
                        )}
                        {min === 0 && max > 0 && (
                            <span className="font-semibold"> Max Rp {max.toLocaleString('id-ID')}</span>
                        )}
                    </p>
                </div>
            )}

            {/* Action Button */}
            {hasActiveFilters && (
                <button
                    onClick={onClearFilters}
                    className="px-8 py-3 bg-primary-gold text-deep-maroon font-medium rounded-lg hover:bg-deep-maroon hover:text-primary-gold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Hapus Semua Filter
                </button>
            )}

            {/* Decorative elements */}
            <div className="mt-12 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-gold/40"></div>
                <div className="w-2 h-2 rounded-full bg-burgundy/40"></div>
                <div className="w-2 h-2 rounded-full bg-primary-gold/40"></div>
            </div>
        </div>
    );
};
const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            {/* Spinner */}
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-primary-gold/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold text-deep-maroon mb-2">
                Memuat Produk...
            </h3>
            <p className="text-burgundy/70 text-sm">
                Mohon tunggu sebentar
            </p>

            {/* Decorative dots */}
            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-gold animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary-gold animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary-gold animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        </div>
    );
};

const Page = () => {
    const [pageSize, setPageSize] = useState(5)
    const [draftMin, setDraftMin] = useState<number>(0);
    const [draftMax, setDraftMax] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true)
    const [products, setProducts] = useState<Product[]>([])
    const [nextCursor, setNextCursor] = useState(null);
    const [min, setMin] = useState(0)
    const [max, setMax] = useState(0)
    const [genderFilter, setGenderFilter] = useState("all")
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
    const handleClearFilters = () => {
        setMin(0);
        setMax(0);

        // panggil fetchProducts pakai nilai manual (bukan state lama)
        fetchProducts("", pageSize, true, 0, 0);
    };
    const router = useRouter()
    const [prevCursor, setPrevCursor] = useState(null);
    const api = process.env.NEXT_PUBLIC_API_URL
    const fetchProducts = async (
        cursorUrl: string = "",
        size: number = pageSize,
        resetPage: boolean = false,
        minValue?: number,
        maxValue?: number,
        genderFilter?: string
    ) => {
        try {
            setLoading(true);

            let url = `${api}/api/products/?page_size=${size}`;

            // Filter harga
            if (typeof minValue === "number" && minValue > 0) url += `&min_price=${minValue}`;
            if (typeof maxValue === "number" && maxValue > 0) url += `&max_price=${maxValue}`;

            // Filter gender
            if (genderFilter && genderFilter !== "all") {
                url += `&gender=${genderFilter}`;
            }

            // Cursor pagination (jika navigasi next/prev)
            if (cursorUrl) url = cursorUrl;

            const res = await fetch(url);
            const data = await res.json();

            setProducts(data.results || []);
            console.log(data.results);

            // Reset nilai draft jika data kosong
            if (data.results === undefined) {
                setDraftMin(Number(min));
                setDraftMax(Number(max));
            }

            setNextCursor(data.next);
            setPrevCursor(data.previous);

            if (resetPage) setCurrentPage(1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts("", pageSize);
    }, [pageSize]);
    return (
        <>
            <ClientNavbar />
            <section className="pt-32 pb-16 bg-gradient-to-br from-cream-beige via-warm-beige to-white">
                <div className="max-w-7xl mx-auto px-10 text-center">
                    <p className="text-sm text-primary-gold tracking-[3px] uppercase mb-4">All Products</p>
                    <h1 className="font-playfair text-5xl lg:text-6xl font-light text-deep-maroon mb-6">Wangy Fragrances</h1>
                    <p className="text-burgundy text-base leading-relaxed max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
                    </p>
                </div>
            </section>
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <aside className="lg:w-64 flex-shrink-0">
                            <div className="sticky top-32">
                                <h3 className="font-playfair text-2xl text-deep-maroon mb-8">Filter Options</h3>
                                <div className="mb-10">
                                    <h4 className="font-semibold text-deep-maroon mb-4 text-sm tracking-wider uppercase">Collection Type</h4>
                                    <RadioGroup
                                        value={genderFilter}
                                        onValueChange={setGenderFilter}
                                        className="space-y-3"
                                    >
                                        {[
                                            { value: "male", label: "Pria" },
                                            { value: "female", label: "Wanita" },
                                            { value: "unisex", label: "Unisex" },
                                        ].map((item) => (
                                            <Label
                                                key={item.value}
                                                htmlFor={item.value}
                                                className={`flex items-center gap-3 cursor-pointer group transition-colors duration-200 ${genderFilter === item.value
                                                    ? "text-primary-gold"
                                                    : "text-burgundy hover:text-primary-gold"
                                                    }`}
                                            >
                                                <RadioGroupItem
                                                    id={item.value}
                                                    value={item.value}
                                                    className="border-2 border-primary-gold text-primary-gold focus:ring-primary-gold focus:ring-offset-0"
                                                />
                                                {item.label}
                                            </Label>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="mb-10">
                                    <h4 className="font-semibold text-deep-maroon mb-4 text-sm tracking-wider uppercase">Price Range</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-full">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-deep-maroon/70">Rp</span>
                                                <input
                                                    type="text"
                                                    placeholder="Min"
                                                    value={min !== null && min !== undefined ? min.toLocaleString('id-ID') : ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setMin(Number(value));
                                                    }}
                                                    className="w-full pl-9 pr-3 py-2 border border-primary-gold/30 rounded-lg focus:border-primary-gold focus:outline-none text-sm text-deep-maroon"
                                                />
                                            </div>
                                            <span className="text-burgundy">-</span>
                                            <div className="relative w-full">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-deep-maroon/70">Rp</span>
                                                <input
                                                    type="text"
                                                    placeholder="Max"
                                                    value={max ? max.toLocaleString('id-ID') : ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setMax(value ? Number(value) : 0);
                                                    }}
                                                    className="w-full pl-9 pr-3 py-2 border border-primary-gold/30 rounded-lg focus:border-primary-gold focus:outline-none text-sm text-deep-maroon"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                fetchProducts("", pageSize, true, min, max, genderFilter);
                                            }}
                                            className="w-full py-2 bg-primary-gold text-deep-maroon text-sm font-medium rounded-lg hover:bg-deep-maroon hover:text-primary-gold transition-all duration-300"
                                        >
                                            Apply
                                        </button>
                                        <button className="w-full py-3 border-2 border-primary-gold text-primary-gold text-sm font-medium rounded-lg hover:bg-primary-gold hover:text-deep-maroon transition-all duration-300">
                                            Clear All Filters
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </aside>
                        <div className="flex-1">

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-primary-gold/30">
                                <div className="flex items-center gap-3">
                                    <label className="text-burgundy text-sm">Sort by:</label>
                                    <select className="px-4 py-2 border border-primary-gold/30 rounded-lg focus:border-primary-gold focus:outline-none text-sm text-deep-maroon bg-white cursor-pointer">
                                        <option>Default Sorting</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? <LoadingSpinner /> : products.length > 0 ? products.map((product, id) => (
                                <div key={id} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="group bg-gradient-to-br from-cream-beige to-warm-beige rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer border-2 border-transparent hover:border-primary-gold hover:-translate-y-4 hover:shadow-2xl hover:shadow-deep-maroon/20">
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
                                            <button onClick={() => router.push(`/product/${product.slug}`)} className="w-full py-4 bg-transparent border-2 border-primary-gold text-primary-gold font-medium text-xs tracking-widest uppercase transition-all duration-500 rounded-lg relative overflow-hidden hover:text-deep-maroon hover:-translate-y-1 group/btn">
                                                <span className="absolute inset-0 bg-primary-gold transform -translate-x-full transition-transform duration-500 group-hover/btn:translate-x-0"></span>
                                                <span className="relative z-10">Add to Collection</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : <EmptyState
                                min={draftMin}
                                max={draftMax}
                                onClearFilters={handleClearFilters}
                            />}


                            <div className="flex items-center gap-3 mt-16">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={handlePrev}
                                                aria-disabled={!prevCursor || loading}
                                                className={`${!prevCursor || loading
                                                    ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                                                    : "cursor-pointer hover:bg-gray-50 border-gray-300 text-gray-700 bg-white"
                                                    }`}
                                            />
                                        </PaginationItem>



                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={handleNext}
                                                aria-disabled={!nextCursor || loading}
                                                className={`${!nextCursor || loading
                                                    ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                                                    : "cursor-pointer text-burgundy hover:bg-primary-gold hover:text-deep-maroon hover:border-primary-gold transition-all duration-300 text-white border-2 border-primary-gold/30"
                                                    }`}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>

                            {/* <div className="flex justify-center items-center gap-2 mt-16">
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-primary-gold/30 text-burgundy hover:bg-primary-gold hover:text-deep-maroon hover:border-primary-gold transition-all duration-300">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-gold text-deep-maroon font-semibold border-2 border-primary-gold transition-all duration-300">1</button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-primary-gold/30 text-burgundy hover:bg-primary-gold hover:text-deep-maroon hover:border-primary-gold transition-all duration-300">2</button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-primary-gold/30 text-burgundy hover:bg-primary-gold hover:text-deep-maroon hover:border-primary-gold transition-all duration-300">3</button>
                                <span className="text-burgundy">...</span>
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-primary-gold/30 text-burgundy hover:bg-primary-gold hover:text-deep-maroon hover:border-primary-gold transition-all duration-300">10</button>
                                <button className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-primary-gold/30 text-burgundy hover:bg-primary-gold hover:text-deep-maroon hover:border-primary-gold transition-all duration-300">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </div> */}
                        </div>
                    </div>
                </div>
            </section >
            <ClientFooter />
        </>
    )
}
export default Page