import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { DeliveryAssignment } from "@/models/deliveryAssignmentModel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();
    const deliveryBoyId = session?.user?.id;
    const activeAssignment = await DeliveryAssignment.findOne({
      assignedTo: deliveryBoyId,
      status: "assigned",
    }).populate({
      path: "order",
      model: "Order",
    });

    if (!activeAssignment || !activeAssignment.order) {
      return NextResponse.json({ active: false }, { status: 200 });
    }
    return NextResponse.json(
      { active: true, assignment: activeAssignment },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching current order:", error);
    return NextResponse.json(
      { message: "Error fetching active assignment", error },
      { status: 500 },
    );
  }
}
