import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/messageModel";
import Order from "@/models/orderModel";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { roomId } = await req.json();
    let room = await Order.findById(roomId);
    if (!room) {
      return NextResponse.json({ message: "room not found" }, { status: 404 });
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });

    return NextResponse.json({messages }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { 
        message: "get messages error", 
        error: error instanceof Error ? error.message : "Unknown error"
       },
      { status: 500 },
    );
  }
}
