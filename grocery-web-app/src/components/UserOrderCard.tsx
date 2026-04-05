"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IOrder } from "@/models/orderModel";
import { UserCheck } from "lucide-react";
import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";

function UserOrderCard({ order }: { order: IOrder }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);
  const router = useRouter();

  const deliveryBoy =
    typeof order.assignedDeliveryBoy === "object" &&
    order.assignedDeliveryBoy !== null &&
    "name" in order.assignedDeliveryBoy
      ? order.assignedDeliveryBoy
      : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "out of delivery":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  useEffect(() => {
    const socket = getSocket();
    socket.on("orderStatusUpdate", (data) => {
      if (data.orderId === order._id) {
        setStatus(data.status);
      }
    });
    return () => {
      socket.off("orderStatusUpdate");
    };
  }, [order._id]);

  return (
    <motion.div className="w-full max-w-full bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-100 px-5 py-4 bg-linear-to-r from-green-50 to-white">
        <div className="">
          <h3 className="text-lg font-semibold text-gray-800">
            Order{" "}
            <span className="text-green-700 font-bold">
              #{order?._id?.toString()?.slice(-6)}
            </span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.createdAt!).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status !== "delivered" && (
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${order.isPaid ? "bg-green-200 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}
            >
              {order?.isPaid ? "Paid" : "Unpaid"}
            </span>
          )}
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full border bg-green-200 text-green-700  ${getStatusColor(status)}`}
          >
            {status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4 overflow-x-hidden">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <CreditCard className="text-green-700" size={16} />
          {order.paymentMethod == "cod" ? "Cash on Delivery" : "Online Payment"}
        </div>

        <div className="flex items-center gap-2 text-gray-700 text-sm min-w-0">
          <MapPin className="text-green-700" size={16} />
          <span className="truncate min-w-0">{order.address.fullAddress}</span>
        </div>

        {deliveryBoy && status !== "delivered" && (
          <>
            <div className="mt-4 bg-blue border border-blue-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <UserCheck className="text-blue-600" size={18} />
                <div className="font-semibold text-gray-800">
                  <p>
                    Assigned to: <span>{deliveryBoy.name.toUpperCase()}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    📞 +91 {deliveryBoy.mobile}
                  </p>
                </div>
              </div>

              <a
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                href={`tel:${deliveryBoy.mobile}`}
              >
                Call
              </a>
            </div>

            <button
              className="w-1/2 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-green-700 transition cursor-pointer"
              onClick={() =>
                router.push(`/user/track-order/${order._id?.toString()}`)
              }
            >
              <Truck size={18} />
              Track Your Order
            </button>
          </>
        )}

        <div className="border-t border-gray-200 pt-3 ">
          <button
            className="w-full flex justify-between items-center text-sm font-medium text-gray-700 hover:text-green-700 transition"
            onClick={() => setExpanded((prev) => !prev)}
          >
            <span className="flex items-center gap-2 min-w-0">
              <Package className="text-green-600" size={16} />
              {expanded ? "Hide Items" : `View ${order.items.length} Items`}
            </span>
            {expanded ? (
              <ChevronUp className="text-green-600" size={16} />
            ) : (
              <ChevronDown className="text-green-600" size={16} />
            )}
          </button>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden w-full"
          >
            <div className="mt-3 space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="object-cover rounded-lg border border-gray-200"
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x {item.unit}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      ₹{Number(item.price) * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t pt-3 flex justify-between items-center text-sm font-semibold text-gray-800">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Truck className="text-green-600" size={16} />
            <span>
              Delivery:{" "}
              <span className="text-green-700 font-semibold">{status}</span>
            </span>
          </div>
          <div>
            Total:{" "}
            <span className="text-green-700 font-bold">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default UserOrderCard;
