import Grocery from "@/models/groceryModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    try {
       const groceries = await Grocery.find({}).sort({ createdAt: -1 });
       return NextResponse.json(groceries, {status: 200})
    } catch (error) {
        return NextResponse.json({message: `get groceries error ${error}`}, { status: 500 });
    }
}