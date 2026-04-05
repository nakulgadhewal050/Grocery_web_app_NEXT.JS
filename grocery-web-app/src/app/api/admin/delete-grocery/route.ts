import { auth } from "@/auth";
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
    const {groceryId} = await req.json()
    const grocery = await Grocery.findByIdAndDelete(groceryId);

    return NextResponse.json(grocery, { status: 201 });
  } catch (error) {
    console.log("error in delete grocery:", error);
    return NextResponse.json(
      { message: "Error deleting grocery item" },
      { status: 400 },
    );
  }
}


