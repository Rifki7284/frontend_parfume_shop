// lib/orders.ts
export async function fetchPerformance(
  cipher: string,
  accessToken: string,
  start = "",
  end = ""
) {
  const api=process.env.NEXT_PUBLIC_API_URL
  const url = `${api}/tiktok/shop/${cipher}/performance?start_date_ge=${start}&end_date_lt=${end}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data orders");
  }

  return res.json(); // JSON dari backend → { data: { orders, next_page_token }, ... }
}
