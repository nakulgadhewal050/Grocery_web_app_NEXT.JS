import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest, context: { params: Promise<{ orderId: string; } >}) {
  try {
    await connectDb();
    const { orderId } = await context.params;

    const order = await Order.findById(orderId).populate("assignedDeliveryBoy");

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error) {
    console.error("Error in get-order API:", error);

    return NextResponse.json(
      {message: "get order error",error},
      { status: 500 }
    );
  }
}