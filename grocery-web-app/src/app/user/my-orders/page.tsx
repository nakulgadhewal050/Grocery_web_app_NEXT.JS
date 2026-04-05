/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { IOrder } from "@/models/orderModel";
import axios from "axios";
import { ArrowLeft, Loader2, PackageSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import UserOrderCard from "@/components/UserOrderCard";
import { getSocket } from "@/lib/socket";

function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const getMyOrders = async () => {
      try {
        const result = await axios.get("/api/user/my-orders");
        setOrders(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };
    getMyOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.on("order-assigned", ({orderId, assignedDeliveryBoy})=> {
          setOrders((prev)=> prev?.map((order,index)=> (
            order._id === orderId ? {...order, assignedDeliveryBoy} : order
          )))
    })
    return () => {
      socket.off("order-assigned");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-green-500">
        <Loader2 className="animate-spin" size={50} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pt-16 pb-10 relative">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={24} className="text-green-700" />
          </button>
          <h1 className="text-green-700 font-bold text-xl">My Orders</h1>
        </div>
      </div>
      {orders?.length == 0 ? (
        <div className="pt-20 flex flex-col items-center text-center gap-4 text-gray-500">
          <PackageSearch size={80} className="text-green-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700">
            No Orders Found
          </h2>
          <p className="text-gray-500 text-xl mt-1">
            Start shopping to place your first order!
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {orders?.map((order, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{duration:0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-4"
            >
              <UserOrderCard order={order} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
