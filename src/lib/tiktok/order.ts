export async function fetchOrders(
  cipher: string,
  accessToken: string,
  pageSize = 10,
  pageToken = "",
  status = ""
) {
  const api = process.env.NEXT_PUBLIC_API_URL;

  const params = new URLSearchParams({
    page_size: pageSize.toString(),
    page_token: pageToken,
  });
  if (status.trim() && status !== "all") params.append("status", status);

  const url = `${api}/tiktok/order/${cipher}/list?${params.toString()}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) throw new Error("Gagal mengambil data orders");
  return res.json();
}
