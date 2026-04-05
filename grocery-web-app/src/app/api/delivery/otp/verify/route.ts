import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import { DeliveryAssignment } from "@/models/deliveryAssignmentModel";
import Order from "@/models/orderModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const {orderId, otp} = await req.json();
        if(!orderId || !otp) {
            return NextResponse.json(
                {message: "orderId and otp are required"},
                {status: 400}
            )
        }
        const order = await Order.findById(orderId);
        if(!order) {
            return NextResponse.json(
                {message: "order not found"},
                {status: 404}
            )
        }
        if(order.deliveryOtp !== otp){
            return NextResponse.json(
                {message: "Invalid OTP"},
                {status: 400}
            )
        }

        order.status = "delivered";
        order.deliveryOtpVerification = true;
        order.deliveredAt = new Date();
        await order.save();

         await emitEventHandler("orderStatusUpdate", { orderId: order._id, status: order.status });

        await DeliveryAssignment.updateOne(
            {order: orderId},
            {$set: {assignedTo: null, status: "completed"}}
        )
        
        return NextResponse.json(
            {message: "OTP Sent Successfull"},
            {status: 200}
        )

    } catch (error) {
        return NextResponse.json(
            {message: `Error verifying OTP: ${error}`},
            {status: 500}
        );
    }
}