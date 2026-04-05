"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/userModel";

interface IOrder {
  _id?: string;
  user: string;
  items: [
    {
      grocery: string;
      name: string;
      price: string;
      unit: string;
      image: string;
      quantity: number;
    },
  ];
  isPaid: boolean;
  totalAmount: number;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignment?: string;
  assignedDeliveryBoy?: IUser;
  status: "pending" | "out of delivery" | "delivered";
  createdAt?: Date;
  updatedAt?: Date;
}

function ManageOrders() {
  const [orders, setOrders] = React.useState<IOrder[]>();
  const router = useRouter();

  const handleLocalStatusChange = (
    orderId: string,
    nextStatus: IOrder["status"],
  ) => {
    setOrders((prev) =>
      prev?.map((order) =>
        String(order._id) === String(orderId)
          ? { ...order, status: nextStatus }
          : order,
      ),
    );
  };

  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/admin/manage-orders");
        setOrders(result.data);
      } catch (error) {
        console.log("error in manage orders", error);
      }
    };
    getOrders();
  }, []);

  useEffect(()=> {
    const socket = getSocket();
    socket.on("newOrder", (newOrder)=>{
      setOrders(prev => prev ? [newOrder, ...prev] : [newOrder] )
    } )
    socket.on("order-assigned", ({orderId, assignedDeliveryBoy})=> {
      setOrders((prev)=> prev?.map((order)=> (
            String(order._id) === String(orderId) ? {...order, assignedDeliveryBoy} : order
          )))
    })
    socket.on("orderStatusUpdate", ({ orderId, status }) => {
      setOrders((prev) =>
        prev?.map((order) =>
          String(order._id) === String(orderId) ? { ...order, status } : order,
        ),
      );
    });
    return () => {
      socket.off("newOrder");
      socket.off("order-assigned");
      socket.off("orderStatusUpdate");
    }
  },[])

  return (
    <div>
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={24} className="text-green-700" />
          </button>
          <h1 className="text-green-700 font-bold text-xl">Manage Orders</h1>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <div className="space-y-6">
          {orders?.map((order, index) => (
            <AdminOrderCard
              key={index}
              order={order}
              onStatusChange={handleLocalStatusChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageOrders;
