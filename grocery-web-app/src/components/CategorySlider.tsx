'use client'
import { Apple, Carrot, Milk, Flame, Wheat, Home, Package, Coffee, Cookie, Bean, Droplets, Snowflake, Leaf, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react'

function CategorySlider() {
    const categories = [
        { id: 1, name: "Fruits", icon: Apple, color: "bg-green-100" },
        { id: 2, name: "Vegetables", icon: Carrot, color: "bg-lime-100" },
        { id: 3, name: "Dairy", icon: Milk, color: "bg-blue-50" },
        { id: 4, name: "Spices", icon: Flame, color: "bg-orange-100" },
        { id: 5, name: "Bakery", icon: Wheat, color: "bg-yellow-100" },
        { id: 6, name: "Household Essentials", icon: Home, color: "bg-indigo-100" },
        { id: 7, name: "Instant & Packaged Food", icon: Package, color: "bg-purple-100" },
        { id: 8, name: "Beverages", icon: Coffee, color: "bg-cyan-100" },
        { id: 9, name: "Snacks", icon: Cookie, color: "bg-amber-100" },
        { id: 10, name: "Grains & Pulses", icon: Bean, color: "bg-stone-100" },
        { id: 11, name: "Oils & Ghee", icon: Droplets, color: "bg-yellow-50" },
        { id: 12, name: "Frozen Foods", icon: Snowflake, color: "bg-sky-100" },
        { id: 13, name: "Dry Fruits & Nuts", icon: Leaf, color: "bg-orange-200" },
    ]


    const [showLeft, setShowLeft] = useState<boolean>()
    const [showRight, setShowRight] = useState<boolean>()

    const scrollRef = useRef<HTMLDivElement>(null)
    const scroll = (direc: "left" | "right") => {
        if (!scrollRef.current) return
        const scrollAmount = direc === "left" ? -300 : 300
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }

    const checkScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setShowLeft(scrollLeft > 0)
        setShowRight(scrollLeft + clientWidth <= scrollWidth - 5)
    }

    useEffect(() => {
        checkScroll()
        scrollRef.current?.addEventListener("scroll", checkScroll)
        return () => removeEventListener("scroll", checkScroll)
    }, [])

    useEffect(() => {
      const autoScroll =  setInterval(() => {
            if (!scrollRef.current) return
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current

            if (scrollLeft + clientWidth >= scrollWidth - 5) {
                scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
            } else {
                scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
            }

        }, 2000)
        return ()=> clearInterval(autoScroll)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, amount: 0.5 }}
            className='w-[90%] md:w-[80%] mx-auto mt-10 relative'
        >
            <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>🛒 Shop by Category</h2>


            {showLeft && <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10
                       flex items-center justify-center transition-all" onClick={() => scroll("left")}>
                <ChevronLeft className='w-6 h-6 text-green-700' />
            </button>}

            <div className='flex gap-6 overflow-x-auto px-10 pb-4 scrollbar-hide scroll-smooth' ref={scrollRef}>
                {categories.map((cat) => {
                    const Icon = cat.icon
                    return <motion.div
                        key={cat.id}
                        className={`min-w-[150px] md:min-w-[180px] flex flex-col items-center justify-center rounded-2xl ${cat.color} shadow-md hover:shadow-xl transition-all cursor-pointer`}>
                        <div className='flex flex-col items-center justify-center p-5'>
                            <Icon className='w-10 h-10 text-green-700 mb-3' />
                            <p className="text-center text-sm md:text-base font-semibold text-gray-700">{cat.name}</p>
                        </div>
                    </motion.div>
                })}
            </div>

            {showRight && (
                <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg hover:bg-green-100 rounded-full w-10 h-10
                           flex items-center justify-center transition-all" onClick={() => scroll("right")}>
                    <ChevronRight className='w-6 h-6 text-green-700' />
                </button>
            )}

        </motion.div>
    )
}

export default CategorySlider