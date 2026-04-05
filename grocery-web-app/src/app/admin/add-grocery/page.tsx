"use client";
import { ArrowLeft, Loader, PlusCircle, Upload } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import { Bounce, toast } from "react-toastify";

function Page() {
  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Spices",
    "Bakery",
    "Household Essentials",
    "Instant & Packaged Food",
    "Beverages",
    "Snacks",
    "Grains & Pulses",
    "Oils & Ghee",
    "Meat & Seafood",
    "Frozen Foods",
    "Personal Care",
    "Dry Fruits & Nuts",
  ];

  const units = ["kg", "g", "l", "ml", "pieces"];

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<string | null>();
  const [backendImage, setBackendImage] = useState<File | null>();
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setBackendImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("unit", unit);
      formData.append("price", price);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post("/api/admin/add-grocery", formData);
      setLoading(false);
      toast.success("successfully added!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
        onClose: () => {
          window.location.href = "/admin/view-grocery";
        }
      });
    } catch (error) {
      console.error("Error adding grocery:", error);
      toast.success("successfully added!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 relative">
      <Link
        href={"/"}
        className="absolute top-6 left-6 flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 transition-all"
      >
        <ArrowLeft />
        <span className="hidden md:flex">Back</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <PlusCircle className="text-green-600 w-8 h-8" />
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Add New Grocery Item
            </h1>
          </div>
          <p className="text-gray-600 text-sm mt-2 text-center">
            Fill in the details below to add a new grocery item to your
            inventory.
          </p>
        </div>

        <form className="flex flex-col gap-6 w-full" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-1"
            >
              Grocery Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="w-full border border-gray-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="category"
                className="block text-gray-700 font-medium mb-1"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-gray-700 font-medium mb-1"
              >
                Unit<span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white"
                onChange={(e) => setUnit(e.target.value)}
                value={unit}
              >
                <option value="">Select Unit</option>
                {units.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-gray-700 font-medium mb-1"
            >
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              className="w-full border border-gray-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-400 transition-all"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <label
              htmlFor="image"
              className="cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 font-semibold border border-green-200 rounded-xl px-6 py-3 hover:bg-green-100 transition-all w-full sm:w-auto"
            >
              <Upload className="w-5 h-5" /> Upload Image
            </label>

            <input
              type="file"
              accept="image/*"
              hidden
              id="image"
              onChange={handleImageChange}
            />
            {preview && (
              <Image
                src={preview}
                alt="Image"
                width={100}
                height={100}
                className="rounded-xl shadow-md border border-gray-200 object-cover"
              />
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            disabled={loading}
            className="mt-4 w-full bg-linear-to-r from-green-500 to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              "Add Grocery"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default Page;
