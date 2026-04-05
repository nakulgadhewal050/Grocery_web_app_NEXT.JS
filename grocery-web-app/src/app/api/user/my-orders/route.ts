import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/orderModel";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        await connectDb();
        const session = await auth();
        const orders = await Order.find({user: session?.user?.id}).populate("user assignedDeliveryBoy").sort({createdAt: -1});
        if(!orders){
            return NextResponse.json(
                {message: "no orders found"},
                {status: 404}
            )
        }
        return NextResponse.json(orders, {status: 200});
    } catch (error) {
        return NextResponse.json(
            {message: "Error fetching orders",error},
            {status: 500}
        );

    }
}
