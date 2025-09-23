export type Order = {
  order_sn: string;
  booking_sn: string;
};

export type OrderListResponse = {
  response: {
    order_list: Order[];
    more: boolean;
    next_cursor: string;
  };
  request_id: string;
};
export type OrderDetailResponse = {
  response: any; // bisa kamu typing lebih detail sesuai API Shopee
  request_id: string;
};
export async function fetchOrderList(
  pageSize: number = 20,
  cursor: string = ""
): Promise<OrderListResponse> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/orders?page_size=${pageSize}&cursor=${cursor}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch order list");
  }

  return res.json();
}
export async function fetchOrderDetail(
  orderSnList: string[]
): Promise<OrderDetailResponse> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/orders/detail?order_sn_list=${orderSnList.join(",")}`
  );
  if (!res.ok) throw new Error("Failed to fetch order detail");
  return res.json();
}
