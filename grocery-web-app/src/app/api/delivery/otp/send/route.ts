import connectDb from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { orderId } = await req.json();
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    order.deliveryOtp = otp;
    await order.save();

    await sendEmail(
        order.user.email,
        "Your Delivery OTP",
        `<h2>Your OTP for order delivery is:<strong> <b>${otp}</b></strong></h2>`,
    )

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: `Error sending OTP: ${error}` },
      { status: 500 },
    );
  }
}
