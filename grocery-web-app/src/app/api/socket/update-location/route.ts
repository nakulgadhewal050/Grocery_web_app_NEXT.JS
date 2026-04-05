import connectDb from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, location } = await req.json();
    if (!userId || !location) {
      return NextResponse.json(
        { message: "userId and location are missing" },
        { status: 400 },
      );
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { location },
      { returnDocument: "after" },
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "User location updated successfully", user },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "updating user location", error },
      { status: 500 },
    );
  }
}
