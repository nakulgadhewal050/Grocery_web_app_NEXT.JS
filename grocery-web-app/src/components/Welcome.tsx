'use client'

import React from 'react'
import { motion } from "motion/react"
import { ArrowRight, Bike, ShoppingBasket } from 'lucide-react'

type propType = {
    nextStep: (s:number) => void
}

function Welcome({nextStep}: propType) {
    return (
        <div className='flex flex-col items-center justify-center min-h-screen text-center p-6'>
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className='flex items-center gap-3 z-10'
            >
                <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, 1, -1, 0] }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className='flex items-center gap-3'
                >
                    <ShoppingBasket className='w-10 h-10 text-green-600' />
                    <h1 className='text-4xl md:text-5xl font-extrabold text-green-700'>SnapKart</h1>
                </motion.div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className='mt-4 text-gray-700 text-lg md:text-xl max-w-lg z-10 leading-relaxed'
            >
                Fresh groceries and everyday essentials, delivered fast at unbeatable prices.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className='z-10'
            >
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className='flex items-center justify-center gap-10 mt-10'
                >
                    <ShoppingBasket className='w-24 h-24 md:w-32 md:h-32 text-green-600 drop-shadow-md' />
                    <Bike className='w-24 h-24 md:w-32 md:h-32 text-orange-600 drop-shadow-md' />
                </motion.div>
            </motion.div>

            <motion.button
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className='inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 mt-10 cursor-pointer z-10'
                onClick={() => nextStep(2)}
            >
                <span>Next</span>
                <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <ArrowRight/>
                </motion.span>
            </motion.button>
        </div>
    )
}

export default Welcome
