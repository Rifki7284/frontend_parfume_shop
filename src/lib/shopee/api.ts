import { useSession } from "next-auth/react";

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
  cursor: string = "",
  token:string
): Promise<OrderListResponse> {
  
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/orders?page_size=${pageSize}&cursor=${cursor}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch order list");
  }

  return res.json();
}
export async function fetchOrderDetail(
  orderSnList: string[],
  token: string
): Promise<OrderDetailResponse> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/orders/detail?order_sn_list=${orderSnList.join(",")}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch order detail");
  return res.json();
}
export async function fetchOrderTrackingNumber(
  orderSnList: string,
  token: string
): Promise<OrderDetailResponse> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/orders/tracking_number?order_sn_list=${orderSnList}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch order detail");
  return res.json();
}
export async function fetchOrderTrackingInfo(
  orderSnList: string,
  token: string
): Promise<OrderDetailResponse> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/orders/get_tracking_info?order_sn_list=${orderSnList}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch order detail");
  return res.json();
}
export async function fetchShopPerformance(
  start:string,
  end:string,
  token:string
): Promise<OrderListResponse> {
  
  const api = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(
    `${api}/shopee/products/sold?start_date_ge=${start}&end_date_lt=${end}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch order list");
  }

  return res.json();
}