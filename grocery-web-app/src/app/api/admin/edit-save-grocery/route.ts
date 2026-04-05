import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin allow" },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const groceryId = formData.get("groceryId") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = (formData.get("image") as Blob) || null;

    const updateData: {
      name: string;
      price: string;
      category: string;
      unit: string;
      image?: string;
    } = {
      name,
      price,
      category,
      unit,
    };

    if (file) {
      const imageUrl = await uploadOnCloudinary(file);
      if (imageUrl) {
        updateData.image = imageUrl;
      }
    }

    const grocery = await Grocery.findByIdAndUpdate(groceryId, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(grocery, { status: 200 });
  } catch (error) {
    console.log("error in edit grocery:", error);
    return NextResponse.json(
      { message: "Error editing grocery item" },
      { status: 400 },
    );
  }
}


