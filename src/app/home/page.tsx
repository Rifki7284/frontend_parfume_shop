'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import './style.css'
import ClientNavbar from '@/components/client-navbar';
import Image from 'next/image';
import ClientPreloader from '@/components/client-preloader';
import ClientFooter from '@/components/client-footer';
import { useRouter } from "next/navigation"
// Product interface
interface ProductImage {
  id: number
  image: string
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

// Products data

export default function WangyPerfumeWebsite() {
  const [products, setProducts] = useState<Product[]>([])
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState<number>(6) // default: 6 item per page
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const api = process.env.NEXT_PUBLIC_API_URL
  const fetchProducts = async (cursor: string | null = null, append = false) => {
    try {
      if (!append) setLoading(true)
      else setIsLoadingMore(true)

      let url = `${api}/api/products/?page_size=${pageSize}`
      if (cursor) {
        // ambil hanya nilai cursor-nya, bukan URL penuh
        const cursorValue = cursor.split('cursor=')[1]
        url += `&cursor=${cursorValue}`
      }

      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal mengambil data produk')

      const data = await res.json()
      setNextCursor(data.next)
      if (append) {
        setProducts((prev) => [...prev, ...(data.results || [])])
      } else {
        setProducts(data.results || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }


  useEffect(() => {
    fetchProducts()
  }, [])
  return (
    <>

      <Head>
        <title>Wangy - Luxury Perfume Collection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      {loading == true && <ClientPreloader />}
      {loading == false && <div className="font-sans bg-yellow-50 text-red-900 overflow-x-hidden">

        <ClientNavbar />
        {/* Hero Section */}
        <section className="min-h-screen flex items-center py-32 bg-gradient-to-br from-cream-beige via-warm-beige to-white relative overflow-hidden" id="home">
          <div className="absolute top-1/5 left-1/10 w-24 h-24 bg-gradient-to-br from-primary-gold/20 to-deep-maroon/10 rounded-full animate-float"></div>
          <div className="absolute top-3/5 right-1/6 w-16 h-16 bg-gradient-to-br from-primary-gold/20 to-deep-maroon/10 rounded-full animate-float" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-1/5 left-1/6 w-20 h-20 bg-gradient-to-br from-primary-gold/20 to-deep-maroon/10 rounded-full animate-float" style={{ animationDelay: "4s" }}></div>

          <div className="absolute -top-1/2 -right-1/5 w-4/5 h-full bg-gradient-to-br from-primary-gold/10 to-transparent transform rotate-12 opacity-30"></div>


          <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="hero-content">
              <p className="text-sm text-primary-gold tracking-[3px] uppercase mb-5 font-medium">Artisan Crafted Excellence</p>
              <h1 className="font-playfair text-6xl lg:text-7xl font-light leading-tight mb-8 text-deep-maroon">
                Scents That<br />
                <span className="italic text-primary-gold">Tell Stories</span>
              </h1>
              <p className="text-lg text-burgundy mb-12 leading-relaxed max-w-lg">
                Discover our exclusive collection of handcrafted fragrances, each bottle a masterpiece of olfactory artistry designed to capture your most precious memories.
              </p>
              <a href="#collections" className="inline-flex items-center py-5 px-12 bg-deep-maroon text-white text-sm font-medium tracking-widest uppercase transition-all duration-500 border-2 border-deep-maroon relative overflow-hidden rounded-lg hover:border-primary-gold hover:-translate-y-1 hover:shadow-xl hover:shadow-deep-maroon/30 group">
                <span className="absolute inset-0 bg-primary-gold transform -translate-x-full transition-transform duration-500 group-hover:translate-x-0"></span>
                <span className="relative z-10 group-hover:text-deep-maroon">Explore Collection</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3 relative z-10">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="flex justify-center items-center">
              <div className="relative group">
                <div className="w-80 lg:w-96 h-[500px] lg:h-[600px] bg-gradient-to-br from-white via-warm-beige to-soft-beige rounded-2xl rounded-b-[40px] relative shadow-2xl shadow-deep-maroon/15  transform -rotate-3 transition-all duration-700 group-hover:rotate-0 group-hover:scale-105">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gradient-to-br from-deep-maroon to-burgundy rounded-t-lg rounded-b border-2 border-primary-gold"></div>
                  <div className="absolute top-5 left-5 right-5 bottom-32 bg-gradient-to-b from-primary-gold/40 to-deep-maroon/10 rounded-2xl rounded-b-[35px]"></div>
                  <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg text-center border border-primary-gold">
                    <h3 className="font-playfair text-lg text-deep-maroon mb-1">Noir Mystique</h3>
                    <p className="text-xs text-primary-gold tracking-widest uppercase">Signature Edition</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Collections Section */}
        <section className="py-32 bg-white" id="collections">
          <div className="max-w-7xl mx-auto px-10">
            <div className="text-center mb-20">
              <p className="text-sm text-yellow-600 tracking-widest uppercase mb-4">Our Collections</p>
              <h2 className="font-serif text-5xl lg:text-6xl font-normal text-red-900 mb-6">Crafted for Every Soul</h2>
              <p className="text-red-700 text-base leading-relaxed max-w-2xl mx-auto">
                From bold and mysterious to delicate and refined, discover fragrances that speak to your unique personality and style.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[
                { icon: '♀', title: 'Femme Collection', desc: 'Elegant and sophisticated scents that embody grace, femininity, and timeless beauty.' },
                { icon: '♂', title: 'Homme Collection', desc: 'Bold and charismatic fragrances designed for the modern gentleman who commands attention.' },
                { icon: '⚪', title: 'Unisex Collection', desc: 'Versatile and captivating scents that transcend boundaries and speak to all souls.' }
              ].map((collection, index) => (
                <div key={index} className="group text-center p-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-yellow-400 hover:-translate-y-3 hover:shadow-xl hover:shadow-red-900 hover:shadow-opacity-20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-red-700 opacity-0 transition-opacity duration-500 group-hover:opacity-10"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full mx-auto mb-8 flex items-center justify-center text-3xl text-red-900 transition-all duration-500 border-4 border-red-900 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-red-900 group-hover:to-red-800 group-hover:text-yellow-400">
                      {collection.icon}
                    </div>
                    <h3 className="font-serif text-2xl mb-4 text-red-900">{collection.title}</h3>
                    <p className="text-red-700 text-sm leading-relaxed mb-6">{collection.desc}</p>
                    <a href="#" className="inline-flex items-center gap-2 text-yellow-600 font-medium text-sm tracking-widest uppercase transition-all duration-300 group-hover:text-red-900 group-hover:translate-x-1">
                      Discover More
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Fragrance Notes Section */}
        <section className="py-32 bg-gradient-to-br from-soft-beige to-warm-beige">
          <div className="max-w-7xl mx-auto px-10">
            <div className="text-center mb-20">
              <p className="text-sm text-yellow-600 tracking-widest uppercase mb-4">The Art of Perfumery</p>
              <h2 className="font-serif text-5xl lg:text-6xl font-normal text-red-900 mb-6">Fragrance Architecture</h2>
              <p className="text-red-700 text-base leading-relaxed max-w-2xl mx-auto">
                Understanding the intricate layers that create a perfect fragrance - from the first impression to the lasting memory.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {[
                { label: 'First Impact', title: 'Top Notes', desc: 'The initial burst of freshness that greets your senses, lasting 5-15 minutes and setting the stage for your olfactory journey.' },
                { label: 'Heart & Soul', title: 'Heart Notes', desc: 'The true personality emerges as these notes develop, creating the main character of your fragrance for 2-4 hours.' },
                { label: 'Foundation', title: 'Base Notes', desc: 'The lasting impression that lingers on your skin, providing depth and longevity that can last for hours or even days.' },
                { label: 'Complexity', title: 'Middle Notes', desc: 'The bridge between heart and base, adding complexity and ensuring a smooth transition throughout your fragrance evolution.' }
              ].map((note, index) => (
                <div key={index} className="group bg-white p-12 rounded-2xl text-center transition-all duration-500 border-2 border-transparent hover:-translate-y-3  hover:shadow-opacity-20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-red-700 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>
                  <p className="font-serif text-sm text-yellow-600 tracking-wider mb-5 uppercase">{note.label}</p>
                  <h3 className="font-serif text-xl mb-4 text-red-900">{note.title}</h3>
                  <p className="text-red-700 text-sm leading-relaxed">{note.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-10">
            <div className="text-center mb-20">
              <p className="text-sm text-yellow-600 tracking-widest uppercase mb-4">Signature Collection</p>
              <h2 className="font-serif text-5xl lg:text-6xl font-normal text-red-900 mb-6">Masterpieces of Scent</h2>
              <p className="text-red-700 text-base leading-relaxed max-w-2xl mx-auto">
                Each fragrance tells a unique story, crafted with the finest ingredients and years of perfumery expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {products.length > 0 && products.map((product, id) => (
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
                    <button onClick={() => router.push(`/product/${product.slug}`)} className="w-full py-4 bg-transparent border-2 border-primary-gold text-primary-gold font-medium text-xs tracking-widest uppercase transition-all duration-500 rounded-lg relative overflow-hidden hover:text-deep-maroon hover:-translate-y-1 group/btn">
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
                  onClick={() => fetchProducts(nextCursor, true)}
                  disabled={isLoadingMore}
                  className="px-8 py-4 bg-primary-gold text-deep-maroon font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        </section>

        <ClientFooter />

      </div>}
    </>
  );
}