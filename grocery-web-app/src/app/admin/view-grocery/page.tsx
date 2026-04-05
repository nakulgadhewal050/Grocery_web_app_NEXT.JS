"use client";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import React, { useEffect } from "react";
import { ArrowLeft, Package, Pencil, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { IGrocery } from "@/models/groceryModel";
import Image from "next/image";
import { Bounce, toast } from "react-toastify";
import Nav from "@/components/Nav";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

function ViewGrocery() {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const [groceries, setGroceries] = React.useState<IGrocery[]>();
  const [editing, setEditing] = React.useState<IGrocery | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [backendImage, setBackendImage] = React.useState<Blob | null>(null);
  const [EditLoading, setEditLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<IGrocery[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = React.useState(false);
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

  useEffect(() => {
    const getGroceries = async () => {
      try {
        const result = await axios.get("/api/admin/get-grocery");
        setGroceries(result.data);
      } catch (error) {
        console.log("error viewgrocery:", error);
      }
    };
    getGroceries();
  }, []);

  useEffect(() => {
    if (editing) {
      setImagePreview(editing.image);
    }
  }, [editing]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!search.trim()) {
        const result = await axios.get("/api/admin/get-grocery");
        setGroceries(result.data);
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }
      setSearchLoading(true);
      setShowSearchDropdown(true);
      try {
        const result = await axios.get(
          `/api/search-grocery?query=${encodeURIComponent(search)}`,
        );
        setSearchResults(result.data);
      } catch (error) {
        console.log("search error:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackendImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = async () => {
    setEditLoading(true);
    if (!editing) return;
    try {
      const formData = new FormData();
      formData.append("name", editing.name);
      formData.append("category", editing.category);
      formData.append("unit", editing.unit);
      formData.append("price", editing.price);
      formData.append("groceryId", editing?._id.toString()!);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post("/api/admin/edit-save-grocery", formData);
      toast.success("successfully updated!", {
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
          window.location.reload();
        },
      });
      setEditLoading(false);
      setEditing(null);
      setGroceries(
        groceries?.map((g) => (g._id === editing._id ? result.data : g)),
      );
    } catch (error) {
      console.error("Error updating grocery:", error);
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
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    if (!editing) return;
    try {
      const result = await axios.post("/api/admin/delete-grocery", {
        groceryId: editing._id,
      });
      toast.success("successfully deleted!", {
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
          window.location.reload();
        },
      });
      setDeleteLoading(false);
      setEditing(null);
      setGroceries(groceries?.filter((g) => g._id !== editing._id));
    } catch (error) {
      console.log("error in delete grocery", error);
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
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {userData && (
        <Nav
          user={userData}
          searchValue={search}
          onSearchChange={setSearch}
          searchResults={searchResults}
          searchLoading={searchLoading}
          showSearchDropdown={showSearchDropdown}
          onSearchItemSelect={(item) => {
          setEditing(item);
          setShowSearchDropdown(false);
          }}
        />
      )}
      <div className="min-h-screen pt-28 w-[95%] md:w-[85%] mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 bg-green-100 hover:bg-gray-200 text-green-700 font-semibold px-4 py-2 rounded-full transition w-full sm:w-auto cursor-pointer"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-extrabold text-green-700 flex items-center justify-center gap-2">
          <Package size={28} className="text-green-600" /> Manage Groceries
        </h1>
      </motion.div>

      <div className="space-y-4">
        {groceries?.map((g, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 transition-all"
          >
            <div className="relative w-full sm:w-44 aspect-square rounded-xl overflow-hidden border border-gray-200">
              <Image
                src={g.image}
                alt={g.name}
                fill
                className="w-24 h-24 rounded-lg object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between w-full">
              <div className="">
                <h3 className="font-semibold text-gray-800 text-lg truncate">
                  {g.name}
                </h3>
                <p className="text-gray-500 text-sm capitalize">{g.category}</p>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-green-700 font-bold text-lg">
                  ₹{g.price}/{" "}
                  <span className="text-gray-500 text-sm font-medium ml-1">
                    {g.unit}
                  </span>
                </p>
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all cursor-pointer"
                  onClick={() => setEditing(g)}
                >
                  <Pencil size={15} /> Edit
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm px-4 "
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white p-7 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-700">
                  Edit Grocery
                </h2>
                <button
                  className="text-gray-600 hover:text-red-600"
                  onClick={() => setEditing(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-gray-200 mb-4 group">
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt={editing.name}
                    fill
                    className="object-cover"
                  />
                )}
                <label
                  htmlFor="imageUpload"
                  className="absolute inset-0 bg-black/40 opacity-6 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <Upload className="text-white" />
                </label>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  id="imageUpload"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter grocery name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, index) => (
                    <option value={cat} key={index}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Enter grocery name"
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: e.target.value })
                  }
                />
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  value={editing.unit}
                  onChange={(e) =>
                    setEditing({ ...editing, unit: e.target.value })
                  }
                >
                  <option value="">Select Unit</option>
                  {units.map((unit, index) => (
                    <option value={unit} key={index}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center gap-2 cursor-pointer"
                  onClick={handleEdit}
                  disabled={EditLoading}
                >
                  {EditLoading ? "Editing..." : "Edit Grocery"}
                </button>
                <button
                  className="px-4 py-2 rounded-lg border bg-red-500 hover:bg-red-600 transition text-white cursor-pointer"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete Grocery"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

export default ViewGrocery;
