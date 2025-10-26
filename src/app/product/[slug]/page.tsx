import { Metadata } from "next";
import ProductDetail from "./productDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params; // ✅ tunggu params dulu
  const api = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const res = await fetch(`${api}/api/products/by-slug/${resolvedParams.slug}/`, { cache: "no-store" });
  const data = await res.json();

  const title = data?.name;
  const description = data?.description;
  const image = data?.images?.[0]?.image;
  const url = `${baseUrl}/product/${resolvedParams.slug}`;

  return {
    title,
    description,
    keywords: [data?.name, "parfum", "wangy perfume", "parfum wanita", "parfum pria"],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Wangy Perfume",
      images: [{ url: image, width: 800, height: 600, alt: data?.name || "Perfume Image" }],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${api}/api/products/by-slug/${resolvedParams.slug}/`, { cache: "no-store" });
  const data = await res.json();
  return <ProductDetail slug={resolvedParams.slug} product={data} />;
}
