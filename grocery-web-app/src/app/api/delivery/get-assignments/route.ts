import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { DeliveryAssignment } from "@/models/deliveryAssignmentModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import '@/models/orderModel';

export async function GET() {
  try {
    await connectDb();

    const session = await auth();
    const deliveryBoyId = session?.user?.id;

    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);

   const assignments = await DeliveryAssignment.find({
  broadcastedTo: { $in: [deliveryBoyObjectId] },
  status: "broadcasted",
}).populate("order");

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error in get assignments", error },
      { status: 500 },
    );
  }
}
