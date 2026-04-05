"use client";
import React, { useEffect, useState } from "react";
import { Leaf, Truck, Smartphone, ShoppingBasket } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

function HeroSection() {


  const slides = [
    {
      id: 1,
      icon: (
        <Leaf className="w-20 h-20 sm:w-28 sm:h-28 text-green-400 drop-shadow-lg" />
      ),
      title: "Fresh Organic Groceries",
      subtitle:
        "Farm-fresh fruits, vegetables, and daily essentials delivered to you.",
      btnText: "Shop Now",
      bg: "https://plus.unsplash.com/premium_photo-1663012860167-220d9d9c8aca?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0",
    },
    {
      id: 2,
      icon: (
        <Truck className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 drop-shadow-lg" />
      ),
      title: "Fast & Reliable Delivery",
      subtitle: "We ensure your groceries reach your doorstep in no time.",
      btnText: "Order Now",
      bg: "https://images.unsplash.com/photo-1683553170878-049f180627b0?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },

    {
      id: 3,
      icon: (
        <Smartphone className="w-20 h-20 sm:w-28 sm:h-28 text-blue-400 drop-shadow-lg" />
      ),
      title: "Shop Anytime, Anywhere 📱",
      subtitle: "Easy and seamless online grocery shopping experience.",
      btnText: "Get Started",
      bg: "https://plus.unsplash.com/premium_photo-1679736181128-ac8e129dd99d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFzdCUyMGdyb2NlcnklMjBkZWxpdmVyeXxlbnwwfHwwfHx8MA%3D%3D",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-[98%] mx-auto mt-32 h-[80vh] rounded-3xl overflow-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide]?.bg}
            alt={slides[currentSlide].title}
            priority
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center text-center text-white px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="flex flex-col items-center justify-center gap-6 max-w-3xl"
        >
          <div className="bg-white/10 backdrop-blure-md p-6 rounded-full shadow-lg">
            {slides[currentSlide]?.icon}
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            {slides[currentSlide]?.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 max-w-2xl ">
            {slides[currentSlide]?.subtitle}
          </p>
          <motion.button
            whileHover={{ scale: 0.9 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="mt-4 bg-white text-green-700 hover:bg-green-100 font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 inline-flex items-center gap-2"
          >
            <ShoppingBasket className="w-5 h-5" />
            {slides[currentSlide]?.btnText}
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-6" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSection;
