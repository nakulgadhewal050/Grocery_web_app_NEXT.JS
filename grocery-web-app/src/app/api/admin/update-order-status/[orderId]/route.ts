import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { DeliveryAssignment } from "@/models/deliveryAssignmentModel";
import Order from "@/models/orderModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";


type DeliveryBoyPayload = {
  id: string;
  name: string;
  mobile: string;
  latitude: number;
  longitude: number;
};

export async function POST(
  req: NextRequest,
 context: { params: Promise<{ orderId: string; } > },
) {
  try {
    await connectDb();
    const { orderId } = await context.params;
    const { status } = await req.json();
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    order.status = status;
    let deliveryBoysPayLoads: DeliveryBoyPayload[] = [];
    if (status === "out of delivery" ) {
      const { latitude, longitude } = order.address;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 10000,
          },
        },
      });
      const nearByIds = nearByDeliveryBoys.map((boy) => boy._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");
      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      const availableDeliveryBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );
      const candidates = availableDeliveryBoys.map((b) => b._id);
      if (candidates.length==0) {
        await order.save();

        await emitEventHandler("orderStatusUpdate",{orderId: order._id, status: order.status})

        return NextResponse.json(
          { message: "there is no available delivery boy" },
          { status: 200 },
        );
      }
      let deliveryAssignment = await DeliveryAssignment.findOne({
        order: order._id,
      })

      if(deliveryAssignment){
        deliveryAssignment.broadcastedTo = candidates;
        deliveryAssignment.status = "broadcasted";
        deliveryAssignment.assignedTo = null

        await deliveryAssignment?.save();
      }
      else {
        deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          broadcastedTo: candidates,
          status: "broadcasted",
        })
      }

      if(status === "pending"){
        await DeliveryAssignment.findOneAndUpdate(
          { order: order._id },
          {
            status: "cancelled",
            assignedTo: null,
            broadcastedTo: [],
          }
        )
      }

      await deliveryAssignment.populate("order");
      for(const boyId of candidates){
        const boy = await User.findById(boyId);
        if(boy?.socketId){
           await emitEventHandler("newAssignment", deliveryAssignment,
            boy.socketId
           )
        }
      }

      order.assignment = deliveryAssignment._id;
      deliveryBoysPayLoads = availableDeliveryBoys.map((b) => ({
        id: b._id,
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
      }))
     await deliveryAssignment.populate("order");
    }
    await order.save();
    await order.populate("user");

    await emitEventHandler("orderStatusUpdate", { orderId: order._id, status: order.status });

    return NextResponse.json({
      assignment: order.assignment?._id,
      availableBoys: deliveryBoysPayLoads,
    },{ status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "Error updating order status", error },
      { status: 500 },
    );
  }
}




