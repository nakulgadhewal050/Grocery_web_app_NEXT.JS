"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Boxes,
  ClipboardCheck,
  LogOutIcon,
  Package,
  PlusCircle,
  Search,
  ShoppingCartIcon,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { IGrocery } from "@/models/groceryModel";
import { addToCart, increaseQuantity } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

interface NavProps {
  user: IUser;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchResults?: IGrocery[];
  searchLoading?: boolean;
  showSearchDropdown?: boolean;
  onSearchItemSelect?: (item: IGrocery) => void;
}

function Nav({
  user,
  searchValue = "",
  onSearchChange,
  searchResults = [],
  searchLoading = false,
  showSearchDropdown = false,
  onSearchItemSelect,
}: NavProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const profileDropDown = useRef<HTMLDivElement>(null);
  const searchDropDownRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cartData } = useSelector((state: RootState) => state.cart);
  const [localSearch, setLocalSearch] = useState("");
  const [localSearchLoading, setLocalSearchLoading] = useState(false);
  const [localSearchResults, setLocalSearchResults] = useState<IGrocery[]>([]);
  const [localShowSearchDropdown, setLocalShowSearchDropdown] = useState(false);
  const getImageSrc = (image?: string) =>
    image && image.trim() ? image : "/next.svg";
  const showAdminSearch = user.role === "admin" && !!onSearchChange;
  const activeSearchValue = showAdminSearch ? searchValue : localSearch;
  const activeSearchLoading = showAdminSearch
    ? searchLoading
    : localSearchLoading;
  const activeSearchResults = showAdminSearch
    ? searchResults
    : localSearchResults;
  const activeShowSearchDropdown = showAdminSearch
    ? showSearchDropdown
    : localShowSearchDropdown;

  const handleSearchItemClick = (item: IGrocery) => {
    if (showAdminSearch) {
      onSearchItemSelect?.(item);
      return;
    }

    if (user.role === "user") {
      const existingItem = cartData.find(
        (cartItem) => String(cartItem._id) === String(item._id),
      );

      if (existingItem) {
        dispatch(increaseQuantity(existingItem._id));
      } else {
        dispatch(addToCart({ ...item, _id: String(item._id), quantity: 1 }));
      }
    }

    setLocalSearch(item.name);
    setLocalShowSearchDropdown(false);
    setSearchOpen(false);
    router.push("/user/checkout");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropDown.current &&
        !profileDropDown.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }

      if (
        searchDropDownRef.current &&
        !searchDropDownRef.current.contains(e.target as Node) &&
        !showAdminSearch
      ) {
        setLocalShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAdminSearch]);

  useEffect(() => {
    if (showAdminSearch) return;

    const fetchSearchResults = async () => {
      if (!localSearch.trim()) {
        setLocalSearchResults([]);
        setLocalShowSearchDropdown(false);
        return;
      }

      setLocalSearchLoading(true);
      setLocalShowSearchDropdown(true);
      try {
        const result = await axios.get(
          `/api/search-grocery?query=${encodeURIComponent(localSearch)}`,
        );
        setLocalSearchResults(result.data);
      } catch (error) {
        console.log("search error:", error);
        setLocalSearchResults([]);
      } finally {
        setLocalSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [localSearch, showAdminSearch]);

  return (
    <div className="w-[95%] fixed top-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-green-500 to-green-700 rounded-2xl shadow-lg shadow-black/30 flex justify-between items-center h-20 px-4 md:px-8 z-50">
      <Link
        href={"/"}
        className="text-white font-extrabold text-2xl sm:text-3xl tracking-wide hover:scale-105 transition-transform"
      >
        SnapKart
      </Link>

      {showAdminSearch ? (
        <div className="hidden md:block w-1/2 max-w-lg relative">
          <form
            className="flex items-center bg-white rounded-full px-4 py-2 shadow-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search groceries..."
              className="w-full outline-none text-gray-700 placeholder-gray-400"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </form>

          <AnimatePresence>
            {showSearchDropdown && searchValue.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
              >
                {searchLoading ? (
                  <div className="px-5 py-4 text-center text-gray-500">
                    <div className="inline-block animate-spin">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <button
                      key={item._id.toString()}
                      type="button"
                      onClick={() => handleSearchItemClick(item)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 border border-gray-200">
                        <Image
                          src={getImageSrc(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate text-sm">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-green-700 font-bold text-sm">
                            ₹{item.price}
                          </p>
                          <p className="text-gray-500 text-xs">{item.unit}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-center text-gray-500 text-sm">
                    No results found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div
          className="hidden md:block w-1/2 max-w-lg relative"
          ref={searchDropDownRef}
        >
          <form
            className="flex items-center bg-white rounded-full px-4 py-2 shadow-md"
            onSubmit={(e) => e.preventDefault()}
          >
            <Search className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full outline-none text-gray-700 placeholder-gray-400"
              value={activeSearchValue}
              onChange={(e) => setLocalSearch(e.target.value)}
              onFocus={() => {
                if (localSearch.trim()) {
                  setLocalShowSearchDropdown(true);
                }
              }}
            />
          </form>

          <AnimatePresence>
            {activeShowSearchDropdown && activeSearchValue.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
              >
                {activeSearchLoading ? (
                  <div className="px-5 py-4 text-center text-gray-500">
                    <div className="inline-block animate-spin">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                ) : activeSearchResults.length > 0 ? (
                  activeSearchResults.map((item) => (
                    <button
                      key={item._id.toString()}
                      type="button"
                      onClick={() => handleSearchItemClick(item)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 border border-gray-200">
                        <Image
                          src={getImageSrc(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate text-sm">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-green-700 font-bold text-sm">
                            ₹{item.price}
                          </p>
                          <p className="text-gray-500 text-xs">{item.unit}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-4 text-center text-gray-500 text-sm">
                    No results found
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex items-center gap-3 md:gap-6 relative">
        {user.role === "user" && (
          <>
            <div
              className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition md:hidden"
              onClick={() => setSearchOpen((prev) => !prev)}
            >
              <Search className="text-green-600 w-6 h-6" />
            </div>
            <Link
              href={"/user/cart"}
              className="relative bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md hover:scale-105 transition"
            >
              <ShoppingCartIcon className="text-green-600 w-6 h-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-semibold shadow">
                {cartData.length}
              </span>
            </Link>
          </>
        )}

        <div className="relative" ref={profileDropDown}>
          <div
            className="relative bg-white rounded-full w-11 h-11 flex items-center justify-center overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt="user image"
                fill
                sizes="44px"
                className="rounded-full object-cover"
              />
            ) : (
              <User />
            )}
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-999"
              >
                <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden relative">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt="user image"
                        fill
                        sizes="40px"
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User />
                    )}
                  </div>
                  <div>
                    <div className="text-gray-800 font-semibold">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                </div>

                {user.role === "user" && (
                  <Link
                    href={"/user/my-orders"}
                    className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium "
                    onClick={() => setOpen(false)}
                  >
                    <Package className="w-5 h-5 text-green-600" />
                    My Orders
                  </Link>
                )}

                {user.role === "admin" && (
                  <>
                    <Link
                      href={"/admin/add-grocery"}
                      className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium "
                      onClick={() => setOpen(false)}
                    >
                      <PlusCircle className="w-5 h-5 text-green-600" />
                      Add Grocery
                    </Link>
                    <Link
                      href={"/admin/manage-orders"}
                      className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium "
                      onClick={() => setOpen(false)}
                    >
                      <ClipboardCheck className="w-5 h-5 text-green-600" />
                      Manage Orders
                    </Link>
                    <Link
                      href={"/admin/view-grocery"}
                      className="flex items-center gap-2 px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium "
                      onClick={() => setOpen(false)}
                    >
                      <Boxes className="w-5 h-5 text-green-600" />
                      View Grocery
                    </Link>
                  </>
                )}

                <button
                  className="flex items-center gap-2 w-full text-left px-3 py-3 hover:bg-green-50 rounded-lg text-gray-700 font-medium cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                >
                  <LogOutIcon className="w-5 h-5 text-red-600" />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-white rounded-2xl shadow-lg z-40 px-4 py-2"
                ref={searchDropDownRef}
              >
                <div className="flex items-center">
                  <Search className="text-gray-500 w-5 h-5 mr-2" />
                  <form className="grow" onSubmit={(e) => e.preventDefault()}>
                    <input
                      className="w-full outline-none text-gray-700"
                      type="text"
                      placeholder="Search..."
                      value={activeSearchValue}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      onFocus={() => {
                        if (localSearch.trim()) {
                          setLocalShowSearchDropdown(true);
                        }
                      }}
                    />
                  </form>

                  <button>
                    <X
                      className="text-gray-500 w-5 h-5"
                      onClick={() => setSearchOpen(false)}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {activeShowSearchDropdown && activeSearchValue.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                    >
                      {activeSearchLoading ? (
                        <div className="px-5 py-4 text-center text-gray-500">
                          <div className="inline-block animate-spin">
                            <Search className="w-5 h-5" />
                          </div>
                        </div>
                      ) : activeSearchResults.length > 0 ? (
                        activeSearchResults.map((item) => (
                          <button
                            key={item._id.toString()}
                            type="button"
                            onClick={() => handleSearchItemClick(item)}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="relative w-11 h-11 rounded-md overflow-hidden shrink-0 border border-gray-200">
                              <Image
                                src={getImageSrc(item.image)}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate text-sm">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-green-700 font-bold text-sm">
                                  ₹{item.price}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {item.unit}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-4 text-center text-gray-500 text-sm">
                          No results found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Nav;
