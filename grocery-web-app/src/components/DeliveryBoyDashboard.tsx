"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LiveMap from "./LiveMap";
import DeliveryChat from "./DeliveryChat";
import {motion} from "motion/react"
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";


interface ILocation {
  latitude: number;
  longitude: number;
}

function DeliveryBoyDashboard({earnings}: {earnings: number}) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const { userData } = useSelector((state: RootState) => state.user);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<ILocation>(
    {latitude: 0, longitude: 0}
  );
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>(
    {latitude: 0, longitude: 0}
  );

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const result = await axios.get(`/api/delivery/get-assignments`);
        setAssignments(result.data);
      } catch (error) {
        console.log("error in deliveryboydashboard", error);
      }
    };
    fetchAssignments();
  }, [userData]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("newAssignment", (deliveryAssignment) => {
      setAssignments((prev) => {
        const exit = prev.find(
          (a) => a.order._id === deliveryAssignment.order._id,
        );
        if (exit) return prev;
        return [...prev, deliveryAssignment];
      });
    });
    return () => {
      socket.off("newAssignment");
    };
  }, []);

  useEffect(() => {
  const socket = getSocket();
  socket.on("updateDeliveryBoyLocation", (data) => {
    if (data && data.coordinates) {
      setDeliveryBoyLocation({
        latitude: data.coordinates[1],
        longitude: data.coordinates[0],
      })
    }
  })
  return () => {
    socket.off("updateDeliveryBoyLocation")
  } 
  },[])

  const handleAccept = async (id: string) => {
    try {
      const result = await axios.get(
        `/api/delivery/assignment/${id}/accept-assignment`,
      );
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      await fetchCurrentOrder();
    } catch (error) {
      console.log("error in handleAccept", error);
    }
  };

  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get(`/api/delivery/current-order`);
      if (result.data.active) {
        setActiveOrder(result.data.assignment);
        setUserLocation({
          latitude: result.data.assignment.order.address?.latitude,
          longitude: result.data.assignment.order.address?.longitude,
        })
      }
    } catch (error) {
      console.error(
        "Error fetching current order in DeliveryBoyDashboard:",
        error,
      );
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, [userData]);

  useEffect(() => {
        let socket = getSocket()
        if (!userData?._id) return
        if (!navigator.geolocation) return

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                setDeliveryBoyLocation({
                    latitude: lat,
                    longitude: lng,
                })
                socket.emit('updateLocation', {
                    userId: userData?._id,
                    latitude: lat,
                    longitude: lng,
                })
            },
            (error) => {
                console.error('Error watching position:', error)
            },
            { enableHighAccuracy: true }
        )

        return () => {
            navigator.geolocation.clearWatch(watcher)
        }
  }, [userData?._id]);

  const sendOtp = async () => {
    setSendOtpLoading(true);
    try {
      const result = await axios.post("/api/delivery/otp/send", {orderId: activeOrder?.order?._id} )
      console.log(result.data)
      setShowOtpBox(true);
      setSendOtpLoading(false);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setSendOtpLoading(false);
    }
  }

  const verifyOtp = async () => {
    setVerifyOtpLoading(true);
    try {
      const result = await axios.post("/api/delivery/otp/verify", {orderId: activeOrder?.order?._id, otp} )
      console.log(result.data)
      setActiveOrder(null);
      setVerifyOtpLoading(false);
      await fetchCurrentOrder();
      window.location.reload();
    } catch (error) {
      setOtpError("Invalid OTP. Please try again.");
      console.error("Error verifying OTP:", error);
      setVerifyOtpLoading(false);
    }
  }

 if(!activeOrder && assignments.length === 0) {
  const todayEarning = [
    {
      name: "Today",
      earnings,
      deliveries: earnings / 40,
      
    }

  ]
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800">No Active Deliveries 🚛</h2>
        <p className="text-gray-500 mb-5 ">Stay online to receive new orders</p>
         
         <div className="bg-white border rounded-xl shadow-xl p-6">
          <h2 className="font-medium text-green-700 mb-2">Today's Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={todayEarning} >
                      <XAxis dataKey="name" />
                      <YAxis/>
                      <Tooltip/>
                      <Legend/>
                      <Bar dataKey="earnings" name="Earnings (₹)"/>
                      <Bar dataKey="deliveries" name="Deliveries"/>
                    </BarChart>
                  </ResponsiveContainer>

                  <p>{earnings || 0} Earned Today</p>
                  <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg cursor-pointer"
                  onClick={()=>window.location.reload()}
                  >
                    Refresh Earning
                  </button>
         </div>
      </div>
    </div>
  )
 }

  if (activeOrder && userLocation) {
    return (
      <div className="w-full min-h-screen">
        <div className="max-w-2xl mx-auto px-4 pt-30 pb-24">
          <div className="sticky top-24 backdrop-blur-xl p-4 border bg-white/80 rounded-2xl shadow flex gap-3 items-center z-40 mb-6">
            <div>
              <h2 className="text-xl font-bold">Active Order</h2>
              <p className="text-sm text-gray-600">
                Order #{activeOrder?.order?._id?.slice(-6)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border shadow min-h-100 flex items-center justify-center bg-white relative z-0 mb-6">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>

          <DeliveryChat orderId={activeOrder?.order?._id} deliveryBoyId={userData?._id?.toString()!}/>


        <div className="mt-6 bg-white rounded-xl border shadow p-6">

        {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
          <motion.button 
          whileTap={{scale: 0.99}}
          className="w-full py-4 bg-green-600 text-white rounded-full cursor-pointer"
          onClick={sendOtp}
          >
            {sendOtpLoading ? "Sending OTP..." : "Mark as Delivered"}
          </motion.button>
        )}

        {showOtpBox && 
           <div className="mt-4">
          <input type="text" className="w-full py-3 border rounded-lg text-center"
          placeholder="Enter OTP" maxLength={4} onChange={(e)=>setOtp(e.target.value)} value={otp} 
          />
          <button className="bg-green-600 w-full mt-4 text-white py-3 rounded-full cursor-pointer"
          onClick={verifyOtp}
          >
            {verifyOtpLoading ? "Verifying OTP..." : "Verify"}
          </button>

          {otpError && <p className="text-red-600 mt-2 text-center">{otpError}</p>}

           </div>
        } 

        {activeOrder.order.deliveryOtpVerification && (
          <div className="text-green-700 text-center font-bold">
            Delivered!
          </div>
        )}

        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold mt-28 mb-7.5">
          Delivery Assignments
        </h2>
        {assignments.map((a, index) => (
          <div
            key={index}
            className="p-5 bg-white rounded-xl shadow mb-4 border"
          >
            <p>
              <b>Order ID: </b>#{a?.order?._id?.slice(-6)}
            </p>
            <p className="text-gray-600">
              <b className="font-bold text-gray-800">Delivery Address: </b>
              {a?.order?.address?.fullAddress}
            </p>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded-lg cursor-pointer"
                onClick={() => handleAccept(a._id)}
              >
                Accept
              </button>
              <button className="flex-1 bg-red-600 text-white py-2 rounded-lg cursor-pointer">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;
