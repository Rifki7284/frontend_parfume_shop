'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// Product interface
interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  description: string;
  notes: string[];
  category: string;
  keywords: string[];
}

// Products data
const productsearch: Product[] = [
  {
    id: 'zahwa-keok',
    name: 'Zahwa Keok',
    brand: 'Wangy',
    price: '$285',
    description: 'A captivating blend of bergamot, jasmine, and sandalwood that evokes the mystery of a moonlit garden.',
    notes: ['bergamot', 'jasmine', 'sandalwood', 'black currant', 'pink pepper', 'white rose', 'lily', 'amber', 'vanilla', 'musk'],
    category: 'unisex',
    keywords: ['mystery', 'moonlit', 'garden', 'captivating', 'evening', 'romantic']
  },
  {
    id: 'lorem-ipsum-1',
    name: 'Dolor Sit',
    brand: 'Lorem',
    price: '$123',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit lorem et nisl gravida vehicula.',
    notes: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur'],
    category: 'unisex',
    keywords: ['lorem', 'ipsum', 'random', 'amet', 'elit']
  },
  {
    id: 'lorem-ipsum-2',
    name: 'Amet Consectetur',
    brand: 'Ipsum',
    price: '$456',
    description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.',
    notes: ['sed', 'do', 'tempor', 'incididunt', 'labore', 'dolore'],
    category: 'femme',
    keywords: ['tempor', 'aliqua', 'lorem', 'ipsum']
  },
  {
    id: 'lorem-ipsum-3',
    name: 'Adipiscing Elit',
    brand: 'Dolor',
    price: '$789',
    description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    notes: ['ut', 'enim', 'veniam', 'nostrud', 'ullamco'],
    category: 'homme',
    keywords: ['ullamco', 'veniam', 'dolor', 'elit']
  },
  {
    id: 'lorem-ipsum-4',
    name: 'Minim Veniam',
    brand: 'Sit',
    price: '$999',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    notes: ['duis', 'aute', 'irure', 'dolor', 'voluptate'],
    category: 'unisex',
    keywords: ['fugiat', 'nulla', 'pariatur', 'dolor']
  },
  {
    id: 'lorem-ipsum-5',
    name: 'Excepteur Sint',
    brand: 'Amet',
    price: '$321',
    description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    notes: ['excepteur', 'sint', 'occaecat', 'cupidatat', 'proident'],
    category: 'unisex',
    keywords: ['occaecat', 'laborum', 'random', 'ipsum']
  }
];

export default function WangyPerfumeWebsite() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [navbarScrolled, setNavbarScrolled] = useState(false);

  // Search functionality
  const searchProducts = useCallback((query: string): Product[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().trim();
    
    return productsearch.filter(product => {
      const searchableText = [
        product.name,
        product.description,
        product.category,
        ...product.notes,
        ...product.keywords
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    });
  }, []);

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts]);

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Search modal handlers
  const openSearch = () => {
    setIsSearchOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    document.body.style.overflow = 'auto';
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  const renderSearchResults = () => {
    if (!searchQuery.trim()) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-400 bg-opacity-10 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <p className="text-gray-500">Start typing to search for fragrances...</p>
          <div className="mt-6 text-sm">
            <p className="text-gray-400 mb-3">Popular searches:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Rose', 'Vanilla', 'Citrus', 'Woody'].map(term => (
                <span 
                  key={term}
                  className="px-3 py-1 bg-yellow-400 bg-opacity-10 text-yellow-600 rounded-full cursor-pointer hover:bg-yellow-400 hover:bg-opacity-20 transition-colors duration-200"
                  onClick={() => setSearchQuery(term.toLowerCase())}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <h3 className="font-serif text-xl text-red-900 mb-3">No fragrances found</h3>
          <p className="text-red-700 text-sm mb-6">We couldn&apos;t find any fragrances matching &quot;{searchQuery}&quot;</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Found {searchResults.length} fragrance{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;</p>
        </div>
        {searchResults.map(product => (
          <div 
            key={product.id}
            className="group p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 bg-gradient-to-br from-yellow-400 from-opacity-30 to-red-900 to-opacity-10 rounded-lg border border-yellow-400 border-opacity-50 flex-shrink-0 relative">
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-gradient-to-br from-red-900 to-red-800 rounded-t border border-yellow-400 border-opacity-50"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif text-lg text-red-900 mb-1 group-hover:text-yellow-600 transition-colors duration-200">{product.name}</h4>
                    <p className="text-sm text-red-700 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-yellow-600">{product.price}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1 bg-gray-100 rounded-full">{product.category}</span>
                    </div>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-yellow-600 transition-colors duration-200 flex-shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Wangy - Luxury Perfume Collection</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="font-sans bg-yellow-50 text-red-900 overflow-x-hidden">
        {/* Navigation */}
        <nav className={`fixed top-0 w-full backdrop-blur-xl z-50 py-5 border-b border-yellow-400 border-opacity-30 transition-all duration-300 ${
          navbarScrolled ? 'bg-yellow-50 bg-opacity-98 shadow-lg shadow-black shadow-opacity-10' : 'bg-yellow-50 bg-opacity-95'
        }`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center px-10">
            <a href="#" className="font-serif text-3xl font-semibold text-red-900 tracking-wider">WANGY</a>
            <ul className="hidden md:flex list-none gap-12">
              {[
                { href: 'home', label: 'Home' },
                { href: 'collections', label: 'Collections' },
                { href: 'about', label: 'Our Story' },
                { href: 'contact', label: 'Contact' }
              ].map(item => (
                <li key={item.href}>
                  <button 
                    onClick={() => scrollToSection(item.href)}
                    className="text-red-900 font-normal text-sm tracking-wide relative transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:w-0 after:h-0.5 after:-bottom-2 after:left-0 after:bg-yellow-400 after:transition-all after:duration-300"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-7 items-center">
              <div className="relative">
                <button 
                  onClick={openSearch}
                  className="cursor-pointer transition-transform duration-300 hover:scale-110 hover:text-yellow-600"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-60 opacity-100 transition-all duration-300">
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
                    placeholder="Search for fragrances..." 
                    className="w-full py-4 px-5 pr-12 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:outline-none transition-colors duration-200 text-red-900"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
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

        {/* Hero Section */}
        <section className="min-h-screen flex items-center py-32 bg-gradient-to-br from-yellow-50 via-yellow-100 to-white relative overflow-hidden" id="home">
          {/* Floating elements */}
          <div className="absolute top-1/5 left-1/10 w-24 h-24 bg-gradient-to-br from-yellow-400 from-opacity-20 to-red-900 to-opacity-10 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '6s'}}></div>
          <div className="absolute top-3/5 right-1/6 w-16 h-16 bg-gradient-to-br from-yellow-400 from-opacity-20 to-red-900 to-opacity-10 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
          <div className="absolute bottom-1/5 left-1/6 w-20 h-20 bg-gradient-to-br from-yellow-400 from-opacity-20 to-red-900 to-opacity-10 rounded-full animate-bounce" style={{animationDelay: '4s', animationDuration: '6s'}}></div>

          <div className="absolute -top-1/2 -right-1/5 w-4/5 h-full bg-gradient-to-br from-yellow-400 from-opacity-10 to-transparent transform rotate-12 opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-10 grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <div>
              <p className="text-sm text-yellow-600 tracking-widest uppercase mb-5 font-medium">Artisan Crafted Excellence</p>
              <h1 className="font-serif text-6xl lg:text-7xl font-light leading-tight mb-8 text-red-900">
                Scents That<br/>
                <span className="italic text-yellow-600">Tell Stories</span>
              </h1>
              <p className="text-lg text-red-700 mb-12 leading-relaxed max-w-lg">
                Discover our exclusive collection of handcrafted fragrances, each bottle a masterpiece of olfactory artistry designed to capture your most precious memories.
              </p>
              <button 
                onClick={() => scrollToSection('collections')}
                className="inline-flex items-center py-5 px-12 bg-red-900 text-white text-sm font-medium tracking-widest uppercase transition-all duration-500 border-2 border-red-900 relative overflow-hidden rounded-lg hover:border-yellow-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900 hover:shadow-opacity-30 group"
              >
                <span className="absolute inset-0 bg-yellow-400 transform -translate-x-full transition-transform duration-500 group-hover:translate-x-0"></span>
                <span className="relative z-10 group-hover:text-red-900">Explore Collection</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-3 relative z-10">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
            
            {/* Perfume bottle illustration */}
            <div className="flex justify-center items-center">
              <div className="relative group">
                <div className="w-80 lg:w-96 h-500 lg:h-600 bg-gradient-to-br from-white via-yellow-100 to-yellow-200 rounded-2xl relative shadow-2xl shadow-red-900 shadow-opacity-15 border-4 border-yellow-400 transform -rotate-3 transition-all duration-700 group-hover:rotate-0 group-hover:scale-105" style={{height: '500px'}}>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gradient-to-br from-red-900 to-red-800 rounded-t-lg border-2 border-yellow-400"></div>
                  <div className="absolute top-5 left-5 right-5 bottom-32 bg-gradient-to-b from-yellow-400 from-opacity-40 to-red-900 to-opacity-10 rounded-2xl"></div>
                  <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 backdrop-blur-sm px-6 py-4 rounded-lg text-center border border-yellow-400">
                    <h3 className="font-serif text-lg text-red-900 mb-1">Noir Mystique</h3>
                    <p className="text-xs text-yellow-600 tracking-widest uppercase">Signature Edition</p>
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
            
            <div className="grid md:grid-cols-3 gap-12">
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
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fragrance Notes Section */}
        <section className="py-32 bg-gradient-to-br from-yellow-200 to-yellow-100">
          <div className="max-w-7xl mx-auto px-10">
            <div className="text-center mb-20">
              <p className="text-sm text-yellow-600 tracking-widest uppercase mb-4">The Art of Perfumery</p>
              <h2 className="font-serif text-5xl lg:text-6xl font-normal text-red-900 mb-6">Fragrance Architecture</h2>
              <p className="text-red-700 text-base leading-relaxed max-w-2xl mx-auto">
                Understanding the intricate layers that create a perfect fragrance - from the first impression to the lasting memory.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-10">
              {[
                { label: 'First Impact', title: 'Top Notes', desc: 'The initial burst of freshness that greets your senses, lasting 5-15 minutes and setting the stage for your olfactory journey.' },
                { label: 'Heart & Soul', title: 'Heart Notes', desc: 'The true personality emerges as these notes develop, creating the main character of your fragrance for 2-4 hours.' },
                { label: 'Foundation', title: 'Base Notes', desc: 'The lasting impression that lingers on your skin, providing depth and longevity that can last for hours or even days.' },
                { label: 'Complexity', title: 'Middle Notes', desc: 'The bridge between heart and base, adding complexity and ensuring a smooth transition throughout your fragrance evolution.' }
              ].map((note, index) => (
                <div key={index} className="group bg-white p-12 rounded-2xl text-center shadow-lg shadow-yellow-400 shadow-opacity-10 transition-all duration-500 border-2 border-transparent hover:border-yellow-400 hover:-translate-y-3 hover:shadow-xl hover:shadow-red-900 hover:shadow-opacity-20 relative overflow-hidden">
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
              {productsearch.map((product) => (
                <div key={product.id} className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl overflow-hidden transition-all duration-700 cursor-pointer border-2 border-transparent hover:border-yellow-400 hover:-translate-y-4 hover:shadow-2xl hover:shadow-red-900 hover:shadow-opacity-20">
                  <div className="h-72 bg-gradient-to-br from-white to-yellow-200 flex items-center justify-center relative overflow-hidden border-b-4 border-yellow-400">
                    <div className="w-32 h-48 bg-gradient-to-br from-yellow-400 from-opacity-30 to-red-900 to-opacity-10 rounded-t-2xl relative transition-all duration-500 border-2 border-yellow-400 group-hover:scale-110" style={{borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem'}}>
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-gradient-to-br from-red-900 to-red-800 rounded-t border border-yellow-400"></div>
                    </div>
                  </div>
                  <div className="p-10">
                    <p className="text-xs text-yellow-600 tracking-wider uppercase mb-2">{product.brand}</p>
                    <h3 className="font-serif text-2xl mb-4 text-red-900">{product.name}</h3>
                    <p className="text-red-700 text-sm leading-relaxed mb-6">{product.description}</p>
                    <p className="text-xl font-semibold text-red-900 mb-5">{product.price}</p>
                    <button className="w-full py-4 bg-transparent border-2 border-yellow-400 text-yellow-600 font-medium text-xs tracking-widest uppercase transition-all duration-500 rounded-lg relative overflow-hidden hover:text-red-900 hover:-translate-y-1 group">
                      <span className="absolute inset-0 bg-yellow-400 transform -translate-x-full transition-transform duration-500 group-hover:translate-x-0"></span>
                      <span className="relative z-10">Add to Collection</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-red-900 text-yellow-50 py-20">
          <div className="max-w-7xl mx-auto px-10">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="md:col-span-2">
                <h3 className="font-serif text-3xl mb-6 text-yellow-400">WANGY</h3>
                <p className="text-yellow-100 leading-relaxed mb-8 max-w-md">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="flex gap-5">
                  {[
                    // Twitter
                    "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
                    // Pinterest  
                    "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.404-5.965 1.404-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z",
                    // Instagram
                    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  ].map((path, index) => (
                    <a key={index} href="#" className="text-yellow-400 transition-transform duration-300 hover:scale-110">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d={path}/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-base mb-6 text-yellow-400 font-medium">Collections</h4>
                <ul className="space-y-3">
                  {['Femme', 'Homme', 'Unisex', 'Limited Edition'].map(item => (
                    <li key={item}>
                      <a href="#" className="text-yellow-100 transition-colors duration-300 hover:text-yellow-400">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-base mb-6 text-yellow-400 font-medium">Customer Care</h4>
                <ul className="space-y-3">
                  {['Contact Us', 'Size Guide', 'Shipping Info', 'Returns'].map(item => (
                    <li key={item}>
                      <a href="#" className="text-yellow-100 transition-colors duration-300 hover:text-yellow-400">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="border-t border-red-800 pt-10 flex flex-col md:flex-row justify-between items-center">
              <p className="text-yellow-100 text-sm mb-4 md:mb-0">© 2025 Wangy. All rights reserved.</p>
              <div className="flex gap-8">
                <a href="#" className="text-yellow-100 text-sm transition-colors duration-300 hover:text-yellow-400">Privacy Policy</a>
                <a href="#" className="text-yellow-100 text-sm transition-colors duration-300 hover:text-yellow-400">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}