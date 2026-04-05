import mongoose from "mongoose";

export interface IGrocery {
    _id: mongoose.Types.ObjectId;
    name: string;
    category: string;
    price: string;
    unit: string;
    image: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const grocerySchema = new mongoose.Schema<IGrocery>({
    name: { type: String, required: true },
    category: { type: String, enum: ["Fruits", "Vegetables", "Dairy", "Spices", "Bakery", "Household Essentials", "Instant & Packaged Food", "Beverages", "Snacks", "Grains & Pulses", "Oils & Ghee", "Meat & Seafood", "Frozen Foods", "Personal Care", "Dry Fruits & Nuts"], required: true },
    price: { type: String, required: true },
    unit: { type: String, required: true, enum: ["kg", "g", "l", "ml", "pieces"] },
    image: { type: String, required: true },
},{timestamps: true});

const Grocery = mongoose.models.Grocery || mongoose.model("Grocery", grocerySchema);

export default Grocery;