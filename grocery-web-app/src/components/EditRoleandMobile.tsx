"use client";
import React from "react";
import { motion } from "motion/react";
import { useState } from "react";
import { User, UserCog, Bike, ArrowRight } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function EditRoleandMobile() {
    const router = useRouter();
    const [roles, setRoles] = useState([
        { id: "admin", label: "Admin", icon: UserCog },
        { id: "user", label: "User", icon: User },
        { id: "deliveryBoy", label: "Delivery Boy", icon: Bike },
    ]);
    const [selectedRole, setSelectedRole] = useState("");
    const [mobile, setMobile] = useState("");
    const {update} = useSession();

    const handleEdit = async () => {
        try {
            const res = await axios.post("/api/user/edit-role-mobile", {
              role: selectedRole,
              mobile
            })
            await update({role: selectedRole});
            router.push("/")
        } catch (error) {
            console.log("edit role and mobile error:", error)
        }
    }

    return (
        <div className="w-full flex flex-col items-center justify-center min-h-screen p-6">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-3xl md:text-4xl font-extrabold text-green-700 text-center mt-8"
            >
                Select Your Role
            </motion.h1>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10">
                {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                        <motion.div
                            key={role.id}
                            whileTap={{ scale: 0.9 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            className={`flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 transition-all 
                                ${isSelected ? "border-green-900 bg-green-100 shadow-lg" : "border-gray-300 bg-white hover:border-green-500 cursor-pointer"}`}
                            onClick={() => setSelectedRole(role.id)}
                        >
                            <Icon />
                            <span>{role.label}</span>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center mt-10"
            >
                <label htmlFor="mobile" className="text-gray-700 font-medium mb-2">
                    Enter your mobile number
                </label>
                <input
                    className="w-64 md:w-80 px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                    placeholder="eg. 1234567890"
                    type="tel"
                    id="mobile"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    onChange={(e) => {
                        setMobile(e.target.value);
                    }}
                />
            </motion.div>
            <motion.button
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 w-[100px] mt-20 mx-auto ${selectedRole && mobile.length === 10 ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer" : "bg-gray-300 text-gray-700 cursor-not-allowed "}`}
                onClick={handleEdit}
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
                    <ArrowRight />
                </motion.span>
            </motion.button>
        </div>
    );
}

export default EditRoleandMobile;
