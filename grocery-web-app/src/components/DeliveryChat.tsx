import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/messageModel";
import axios from "axios";
import { Send, Sparkle } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

type props = {
  orderId: string;
  deliveryBoyId: string;
};

function DeliveryChat({ orderId, deliveryBoyId }: props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [suggestion, setSuggestion] = useState([])
  const [loading, setLoading] = useState(false);

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

  const sendMessage = () => {
    const socket = getSocket();
    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: deliveryBoyId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    if(!message){
      return;
    }
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

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    })
  },[messages])

  const generateSuggestions = async () => {
    setLoading(true);
     try {
      const lastMessage = messages?.filter(m=>m.senderId.toString() !== deliveryBoyId)?.at(-1);
      const result = await axios.post("/api/chat/ai-suggestion", {message: lastMessage?.text, role: "delivery_boy" })
      console.log("ai:",result.data)
      setSuggestion(result.data.suggestions);
      setLoading(false);
     } catch (error) {
      console.error("Error generating AI suggestions:", error);
      setLoading(false);
     }
  }
  

  return (
    <div className="bg-white rounded-3xl shadow-xl border p-4 h-107.5 flex flex-col relative">

    <div className="flex justify-between items-center mb-3">
      <span className="font-semibold text-gray-700 text-sm">Quick Replies</span>
      <motion.button 
      whileTap={{scale: 0.9}}
      disabled={loading}
      className="px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer"
      onClick={generateSuggestions}>
        <Sparkle size={14}/>
        {loading ? "Generating..." : "Ai Suggestions"}
        </motion.button>

    </div>

    <div className="flex gap-2 flex-wrap mb-3">
     {suggestion.map((sug, index)=> (
      <motion.div 
      key={index}
      whileTap={{scale: 0.92}}
      className="px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full shadow-sm cursor-pointer"
      onClick={()=> setNewMessage(sug)}
      >
        {sug}
      </motion.div>
     ))}
    </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar" ref={chatBoxRef}>
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg._id?.toString()}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: index * 0.07 }}
              className={`flex flex-col ${msg.senderId.toString() === deliveryBoyId ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-md mb-1 ${msg.senderId.toString() === deliveryBoyId ? "bg-green-500 text-white rounded-br-md" : "bg-gray-200 text-gray-800 rounded-bl-md"}`}
              >
                <p className="wrap-break-word whitespace-pre-line">{msg.text}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{msg.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 left-0 w-full bg-white/80 backdrop-blur flex gap-2 p-3 border-t z-10">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button
          className="bg-green-500 hover:bg-green-600 p-3 rounded-xl text-white shadow-md transition-colors duration-150 cursor-pointer"
          onClick={sendMessage}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default DeliveryChat;
