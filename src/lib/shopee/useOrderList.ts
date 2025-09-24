"use client";

import { useState, useEffect } from "react";
import { fetchOrderDetail, fetchOrderList, Order } from "./api";
import { useSession } from "next-auth/react";

export function useOrderList(pageSize: number = 20, token: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cursors, setCursors] = useState<string[]>([""]); // simpan semua cursor
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sn, setSn] = useState<string[]>([]);
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const loadOrders = async (targetPage: number) => {
    if (!token) return; // 🔑 jangan fetch kalau belum ada token
    if (targetPage < 1 || targetPage > cursors.length) return;

    setLoading(true);
    setError(null);

    try {
      const cursor = cursors[targetPage - 1]; // ambil cursor sesuai halaman
      const data = await fetchOrderList(pageSize, cursor, token);

      const order_sns = data.response.order_list.map((o) => o.order_sn);
      setSn(order_sns);
      setOrders(data.response.order_list || []);
      setHasMore(data.response.more || false);

      // simpan next_cursor kalau ada & belum tersimpan
      if (
        data.response.next_cursor &&
        !cursors.includes(data.response.next_cursor)
      ) {
        setCursors((prev) => [...prev, data.response.next_cursor]);
      }

      // langsung pakai order_sns (bukan sn state yang belum update)
      if (order_sns.length > 0) {
        const detailRes = await fetchOrderDetail(order_sns, token);
        setDataDetail(detailRes.response.order_list);
      }

      setPage(targetPage);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrders(1); // 🔑 hanya fetch kalau token sudah ada
  }, [pageSize, token]);

  return { orders, page, hasMore, loadOrders, loading, error, dataDetail };
}
