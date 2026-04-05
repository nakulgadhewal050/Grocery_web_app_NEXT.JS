'use client'
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building,
  CreditCard,
  CreditCardIcon,
  Home,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Search,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import axios from "axios";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const CheckOutMap = dynamic(() => import("@/components/CheckOutMap"),{ssr: false})



function Page() {
  const router = useRouter()
  const { userData } = useSelector((state: RootState) => state.user);
  const { subTotal, deliveryFee, finalTotal, cartData } = useSelector((state: RootState) => state.cart);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentLoading, setCurrentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Errorin location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
      );
    }
  }, []);

  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({ ...prev, fullName: userData?.name || "" }));
      setAddress((prev) => ({ ...prev, mobile: userData?.mobile || "" }));
    }
  }, [userData]);

  

  const handleSearchQuery = async () => {
    setSearchLoading(true);
    const {OpenStreetMapProvider} = await import ("leaflet-geosearch");
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    setSearchLoading(false);
    setPosition([results[0].y, results[0].x]);
  };

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const result = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${position?.[0]}&lon=${position?.[1]}&format=json`,
        );
        console.log(result.data);
        setAddress((prev) => ({
          ...prev,
          city: result.data.address.city,
          state: result.data.address.state,
          pincode: result.data.address.postcode,
          fullAddress: result.data.display_name,
        }));
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };
    fetchAddress();
  }, [position]);

  const handleCurrentLocation = async () => {
    setCurrentLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setCurrentLoading(false);
      },
        (error) => {
          console.error("Errorin location:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
      );
    }
  };

  const handleCodOrder = async () => {
    setLoading(true);
    if (!position) {
      return null
    }
    try {
      const result = await axios.post("/api/user/order", {
        userId: userData?._id,
        items: cartData.map((item) => (
          {
            grocery: item._id,
            name: item.name,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity,
            image: item.image,
          }
        )),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          fullAddress: address.fullAddress,
          latitude: position?.[0],
          longitude: position?.[1],
        },
        paymentMethod,
      })
      setLoading(false);
      router.push("/user/order-success");
    } catch (error) {
      console.error("Error in placing order in checkout:", error);
      setLoading(false);
    }
  }

  const handleOnlinePayment = async ()=> {
    setLoading(true);
    if (!position) {
      return null
    }
    try {
      const result = await axios.post("/api/user/payment", {
        userId: userData?._id,
        items: cartData.map((item) => (
          {
            grocery: item._id,
            name: item.name,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity,
            image: item.image,
          }
        )),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          fullAddress: address.fullAddress,
          latitude: position?.[0],
          longitude: position?.[1],
        },
        paymentMethod,
      })
      window.location.href = result.data.url
      setLoading(false);
    } catch (error) {
      console.log("error in handleOnlinePayment error", error)
      setLoading(false);
    }
  }

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      <Link
        href={"/user/cart"}
        className="absolute top-2 left-0 flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft className="hidden sm:inline" size={20} />
        <span className="font-medium">Back</span>
      </Link>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10 "
      >
        CheckOut
      </motion.h1>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-700" /> Delivery Address
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                value={address.fullName}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="relative">
              <Phone
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                value={address.mobile}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, mobile: e.target.value }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="relative">
              <Home
                className="absolute left-3 top-3 text-green-600"
                size={18}
              />
              <input
                type="text"
                value={address.fullAddress}
                placeholder="Full Address"
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    fullAddress: e.target.value,
                  }))
                }
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <Building
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  value={address.city}
                  placeholder="City"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
              <div className="relative">
                <Navigation
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  value={address.state}
                  placeholder="State"
                  onChange={(e) =>
                    setAddress((prev) => ({ ...prev, state: e.target.value }))
                  }
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-green-600"
                  size={18}
                />
                <input
                  type="text"
                  value={address.pincode}
                  placeholder="Pincode"
                  onChange={(e) =>
                    setAddress((prev) => ({
                      ...prev,
                      pincode: e.target.value,
                    }))
                  }
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3 ">
              <input
                type="text"
                placeholder="search city or area...."
                className="flex-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 oultine-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium cursor-pointer"
                onClick={handleSearchQuery}
              >
                {searchLoading ? (
                  <Loader2 className="animate-spin " size={22} />
                ) : (
                  "Search"
                )}
              </button>
            </div>

            <div className="relative mt-6 h-82.5 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              {position && <CheckOutMap position={position} setPosition={setPosition}/>}
              <motion.button
                whileTap={{ scale: 0.93 }}
                className="absolute bottom-4 right-4 bg-green-600 text-white shadow-lg rounded-full p-3 hover:bg-green-700 transition-all flex items-center justify-center z-999"
                onClick={handleCurrentLocation}>
                {currentLoading ? <Loader2 className="animate-spin" /> : <LocateFixed size={22} />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-green-600" /> Payment Method
          </h2>
          <div className="space-y-4 mb-6">
            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "online" ?
                "border-green-600 bg-green-50 shadow-sm" : "border-gray-200 hover:border-gray-400 cursor-pointer"
                }`}>
              <CreditCardIcon className="text-green-600" />  <span className="font-medium text-gray-700">Pay Online</span>
            </button>
            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all ${paymentMethod === "cod" ?
                "border-green-600 bg-green-50 shadow-sm" : "border-gray-200 hover:border-gray-400 cursor-pointer"
                }`}>
              <Truck className="text-green-600" />  <span className="font-medium text-gray-700">Pay On Delivery</span>
            </button>

          </div>
          <div className="border-t pt-4 text-gray-700 space-y-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-semibold ">Subtotal:</span>
              <span className="font-semibold text-green-600">₹{subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold ">Delivery Fee:</span>
              <span className="font-semibold text-green-600">₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-semibold text-green-600">₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full bg-green-600 text-white shadow-lg rounded-full py-3 hover:bg-green-700 transition-all font-semibold  mt-6 cursor-pointer"
            onClick={() => {
              if (paymentMethod === "cod") {
                handleCodOrder()
              }
              else {
                handleOnlinePayment()
              }
            }}
          >
            {paymentMethod === "cod" ? (loading ? "Placing Order..." : "Place Order") : (loading ? "Redirecting..." : "Proceed to Pay")}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;
