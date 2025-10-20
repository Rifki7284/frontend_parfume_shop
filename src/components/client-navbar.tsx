
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
    shopee_link: string
    gender: string
    slug: string
    volume_ml: string
    price: number
    brand: string
    images: ProductImage[]
}
const ClientNavbar = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [navbarScrolled, setNavbarScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter()
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const api = process.env.NEXT_PUBLIC_API_URL
    const pathname = usePathname();
    const handleSearch = async () => {
        try {

            // Base URL API
            let url = `${api}/api/products/search/?q=${searchQuery}`;

            // Tambahkan filter gender (kecuali "all")

            const res = await fetch(url);
            const data = await res.json();
            setSearchResults(data)
        } catch (e) {
            console.error(e);
        }
    }

    const renderSearchResults = () => {
        if (!searchQuery.trim() && searchResults.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary-gold/10 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-primary-gold">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </div>
                    <p className="text-gray-500">Start typing to search for fragrances...</p>
                    {/* <div className="mt-6 text-sm">
                        <p className="text-gray-400 mb-3">Popular searches:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {['Rose', 'Vanilla', 'Citrus', 'Woody'].map(term => (


                                <span key={term} onClick={() => setSearchQuery(term.toLowerCase())} className="px-3 py-1 bg-primary-gold/10 text-primary-gold rounded-full cursor-pointer hover:bg-primary-gold/20 transition-colors duration-200" >{term}</span>

                            ))}
                        </div>
                    </div> */}
                </div>
            );
        }

        if (searchResults.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                    </div>
                    <h3 className="font-serif text-xl text-red-900 mb-3">No fragrances found</h3>
                    <p className="text-red-700 text-sm mb-6">We couldn&apos;t find any fragrances matching &quot;{searchQuery}&quot;</p>
                </div>
            );
        }

        return (
            <div className=" max-h-[40vh]">
                <div className="mb-4">
                    <p className="text-sm text-gray-600">Found {searchResults.length} fragrance{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;</p>
                </div>
                {searchResults.map(product => (
                    <div
                        key={product.id}
                        onClick={() => {
                            router.push(`/product/${product.slug}`)
                            closeSearch()
                            setSearchResults([])
                        }}
                        className="group p-4  border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative h-16 w-10  flex items-center justify-center overflow-hidden ">
                                <Image
                                    src={product.images[0].image}
                                    alt={product.name}
                                    fill
                                    className="object-contain  transition-transform duration-700 group-hover:scale-105 mix-blend-multiply opacity-95 backdrop-brightness-105 contrast-110"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-serif text-lg text-red-900 mb-1 group-hover:text-yellow-600 transition-colors duration-200">{product.name}</h4>
                                        <p className="text-sm text-red-700 mb-2 line-clamp-2">{product.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-semibold text-yellow-600">{product.price}</span>
                                            {/* <span className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-100 rounded-full">{product.category}</span> */}
                                        </div>
                                    </div>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-yellow-600 transition-colors duration-200 flex-shrink-0">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchQuery('');
        document.body.style.overflow = 'auto';
    };
    // Search modal handlers
    const openSearch = () => {
        setIsSearchOpen(true);
        document.body.style.overflow = 'hidden';
    };
    useEffect(() => {
        const handleScroll = () => {
            setNavbarScrolled(window.scrollY > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSearchOpen) {
                closeSearch();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isSearchOpen]);
    return (
        <>
            {isSearchOpen && (
                <div className="fixed inset-0 bg-black/10 bg-opacity-50 backdrop-blur-sm z-60 opacity-100 transition-all duration-300">
                    <div className="flex items-start justify-center pt-32">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl transform scale-100 transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif text-2xl text-red-900">Search Fragrances</h3>
                                <button
                                    onClick={closeSearch}
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch()
                                        }
                                    }}
                                    placeholder="Search for fragrances..."
                                    className="w-full py-4 px-5 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors duration-200 text-red-900"
                                    autoFocus
                                />
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                </div>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {renderSearchResults()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <nav className={`fixed top-0 w-full  backdrop-blur-xl z-50 py-5 border-b border-primary-gold/30 transition-all duration-300 ${navbarScrolled ? 'bg-cream-beige/10  shadow-lg shadow-black/10' : 'bg-cream-beige/95'
                }`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center px-10">
                    <a href="#" className="font-serif text-3xl font-semibold text-red-900 tracking-wider">WANGY</a>
                    <ul className="hidden md:flex list-none gap-12">

                        <li>
                            <button
                                onClick={() => pathname === "/home" ? scrollToSection("home") : router.push("home")}
                                className="text-red-900 font-normal text-sm tracking-wide relative transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:w-0 after:h-0.5 after:-bottom-2 after:left-0 after:bg-yellow-400 after:transition-all after:duration-300"
                            >
                                Home
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => scrollToSection("collections")}
                                className="text-red-900 font-normal text-sm tracking-wide relative transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:w-0 after:h-0.5 after:-bottom-2 after:left-0 after:bg-yellow-400 after:transition-all after:duration-300"
                            >
                                Collections
                            </button>
                        </li>
                        <li >
                            <button
                                onClick={() => router.push("product")}
                                className={`text-red-900 font-normal ${pathname === "/product" ? "after:w-full" : ""} text-sm tracking-wide relative transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:w-0 after:h-0.5 after:-bottom-2 after:left-0 after:bg-yellow-400 after:transition-all after:duration-300`}
                            >
                                Product
                            </button>
                        </li>
                    </ul>
                    <div className="flex gap-7 items-center">
                        <div className="relative">
                            <button
                                onClick={openSearch}
                                className="cursor-pointer transition-transform duration-300 hover:scale-110 hover:text-yellow-600"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>

    )
}
export default ClientNavbar