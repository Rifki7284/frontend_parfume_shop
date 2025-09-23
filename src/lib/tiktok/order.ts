// lib/orders.ts
export async function fetchOrders(
  cipher: string,
  accessToken: string,
  pageSize = 10,
  pageToken = ""
) {
  const api=process.env.NEXT_PUBLIC_API_URL
  const url = `${api}/tiktok/order/${cipher}/list?page_size=${pageSize}&page_token=${pageToken}`;

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
