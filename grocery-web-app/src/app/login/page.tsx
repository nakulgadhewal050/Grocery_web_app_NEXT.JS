'use client'
import { EyeClosed, EyeIcon, Loader2, Lock, LogIn, Mail } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';



function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const session = useSession()
    console.log("session", session)

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const res = await signIn("credentials", {
                email, password, redirect: false
            })
            if (res?.error) {
                setError("Invalid email or password")
                return
            }

            if (res?.ok) {
                router.push("/")
            } else {
                setError("Invalid email or password")
            }
        } catch (error) {
            console.log("error in handleLogin", error)
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center  min-h-screen px-6 py-10  relative'>

            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className='text-4xl font-extrabold text-green-700 mb-5'>
                Sign In to Your Account
            </motion.h1>

            {error && <p className="text-red-500 text-medium mt-2 mb-4 ">{error}</p>}

            <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className='flex flex-col gap-5 w-full max-w-sm'
                onSubmit={handleLogin}
            >

                <div className='relative'>
                    <Mail className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
                    <input type="email" placeholder='Email'
                        className='w-full border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-green-500 focus:ring-2 focus:outline-none transition-all'
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                </div>
                <div className='relative'>
                    <Lock className='absolute left-3 top-3.5 w-5 h-5 text-gray-400' />
                    <input type={showPassword ? "text" : "password"} placeholder='Password'
                        className='w-full border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:ring-green-500 focus:ring-2 focus:outline-none transition-all'
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                    {showPassword ? <EyeClosed className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer'
                        onClick={() => setShowPassword(false)}
                    /> : <EyeIcon className='absolute right-3 top-3.5 w-5 h-5 text-gray-500 cursor-pointer' onClick={() => setShowPassword(true)} />}
                </div>

                <button
                    className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 shadow-md inline-flex items-center justify-center gap-2 
                        ${email && password ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' :
                            'bg-gray-300 text-gray-700 cursor-not-allowed'}`} disabled={loading || !email || !password}
                >
                    {loading ? <Loader2 className='w-5 h-5 animate-spin' /> : 'Sign In'}
                </button>

                <div className='flex items-center gap-2 text-gray-400 text-sm mt-2'>
                    <span className="flex-1 h-px bg-gray-400"></span>
                    OR
                    <span className="flex-1 h-px bg-gray-400"></span>
                </div>

                <button type='button' className='w-full flex justify-center bg-white rounded-xl gap-3 border border-gray-300 hover:bg-gray-50 py-3 transition-all duration-200 cursor-pointer '
                 disabled={loading} onClick={()=> signIn("google", {callbackUrl: "/"})}
                >
                    <FcGoogle size={25} />
                    <span className="text-xl font-medium text-gray-700">Continue with Google</span>
                </button>
            </motion.form>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}

                className='text-gray-600 mt-6 text-sm flex items-center gap-1 '>
                Want to create an account ? <LogIn className="w-4 h-4" />
                <span className='text-green-600 font-medium hover:underline  hover:text-green-800 transition-colors cursor-pointer'
                    onClick={() => router.push("/register")}
                >Register</span>
            </motion.p>
        </div>
    )
}

export default Login



