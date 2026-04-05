import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const limitParam = Number(searchParams.get("limit") || "20");
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 20;

    if (!query) {
      return NextResponse.json([], { status: 200 });
    }

    const groceries = await Grocery.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(groceries, { status: 200 });
  } catch (error) {
    console.log("search grocery error:", error);
    return NextResponse.json(
      { message: "Error while searching groceries" },
      { status: 500 },
    );
  }
}
