"use client";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { IUser } from "@/models/userModel";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { ArrowLeft, Send, Sparkle } from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { getSocket } from "@/lib/socket";
import { AnimatePresence, motion } from "motion/react";
import { IMessage } from "@/models/messageModel";

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

interface ILocation {
  latitude: number;
  longitude: number;
}

function TrackOrder() {
  const { orderId } = useParams();
  const { userData } = useSelector((state: RootState) => state.user);
  const [order, setOrder] = useState<IOrder>();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [suggestion, setSuggestion] = useState([])
  const [loading, setLoading] = useState(false);

  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`);
        console.log("order details in track order page", result.data);
        setOrder(result.data);
        setUserLocation({
          latitude: result.data?.address?.latitude,
          longitude: result.data?.address?.longitude,
        });
        setDeliveryBoyLocation({
          latitude: result.data?.assignedDeliveryBoy?.location?.coordinates[1],
          longitude: result.data?.assignedDeliveryBoy?.location?.coordinates[0],
        });
      } catch (error) {
        console.error(
          "Error fetching order details in track order page:",
          error,
        );
        // Log the full error object for detailed inspection
        console.dir(error);
      }
    };
    getOrder();
  }, [orderId, userData?._id]);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("updateDeliveryBoyLocation", ({ userId, location }) => {
      if (userId.toString() === order?.assignedDeliveryBoy?._id?.toString()) {
        setDeliveryBoyLocation({
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
        });
      }
    });
    return () => socket.off("updateDeliveryBoyLocation");
  }, [order]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("joinRoom", orderId);
    socket.on("newMessage", (message) => {
      if (message.roomId === orderId) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => {
      socket.off("newMessage");
    };
  }, []);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    const socket = getSocket();
    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: userData?._id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("sendMessage", message);

    setNewMessage("");
  };

  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const result = await axios.post("/api/chat/messages", {
          roomId: orderId,
        });
        setMessages(result.data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    getAllMessages();
  }, [orderId]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const lastMessage = messages
        ?.filter((m) => m.senderId.toString() !== userData?._id)
        ?.at(-1);
      const result = await axios.post("/api/chat/ai-suggestion", {
        message: lastMessage?.text,
        role: "user",
      });
      console.log("ai:",result.data)
      setSuggestion(result.data.suggestions);
      setLoading(false);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      setLoading(false);
    }
  };

  const isValidLocation = (loc: ILocation) =>
    typeof loc.latitude === "number" &&
    typeof loc.longitude === "number" &&
    loc.latitude !== 0 &&
    loc.longitude !== 0;

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-2xl mx-auto pb-24">
        <div className="sticky top-0  backdrop-blur-xl p-4 border-b shadow flex gap-3 items-center z-999 cursor-pointer">
          <button
            className="p-2 bg-green-100 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="text-green-700" size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold ">Track Order</h2>
            <p className="text-sm text-gray-600">
              Order#{order?._id?.toString().slice(-6)}{" "}
              <span className="text-green-700 font-semibold">
                {order?.status}
              </span>
            </p>
          </div>
        </div>
        <div className="px-4 mt-6 space-y-6">
          <div className="rounded-3xl overflow-hidden border shadow min-h-[400px] flex items-center justify-center bg-white">
            {isValidLocation(userLocation) &&
            isValidLocation(deliveryBoyLocation) ? (
              <LiveMap
                userLocation={userLocation}
                deliveryBoyLocation={deliveryBoyLocation}
              />
            ) : (
              <div className="text-gray-500 text-center w-full">
                Loading map...
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border p-4 h-[430px] flex flex-col relative">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 text-sm">
                Quick Replies
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer"
                onClick={generateSuggestions}
                disabled={loading}
              >
                <Sparkle size={14} />
                {loading ? "Generating..." : "Ai Suggestions"}
              </motion.button>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              {suggestion.map((sug, index) => (
                <motion.div
                  key={index}
                  whileTap={{ scale: 0.92 }}
                  className="px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full shadow-sm cursor-pointer"
                  onClick={() => setNewMessage(sug)}
                >
                  {sug}
                </motion.div>
              ))}
            </div>
            <div
              className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar"
              ref={chatBoxRef}
            >
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg._id?.toString()}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.07 }}
                    className={`flex flex-col ${msg.senderId.toString() === userData?._id ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md mb-1 ${msg.senderId.toString() === userData?._id ? "bg-green-500 text-white rounded-br-none ml-auto" : "bg-gray-100 text-gray-800 rounded-bl-none mr-auto"}`}
                      style={{
                        borderBottomRightRadius:
                          msg.senderId.toString() === userData?._id ? 0 : undefined,
                        borderBottomLeftRadius:
                          msg.senderId.toString() !== userData?._id ? 0 : undefined,
                        boxShadow:
                          msg.senderId.toString() === userData?._id
                            ? "0 2px 8px 0 rgba(16,185,129,0.10)"
                            : "0 2px 8px 0 rgba(0,0,0,0.04)",
                      }}
                    >
                      <p className="break-words whitespace-pre-line">
                        {msg.text}
                      </p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-2 mt-3 border-t pt-3 bg-white sticky bottom-0 z-10">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                autoComplete="off"
              />
              <button
                className="bg-green-500 hover:bg-green-700 p-3 rounded-xl text-white shadow-md transition cursor-pointer"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
