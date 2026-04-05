import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { role, mobile } = await req.json();
        const session = await auth();
        const user = await User.findOneAndUpdate(
            { email: session?.user?.email },
            { role, mobile },
            { returnDocument: "after" },
        );
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "User:", user }, { status: 200 });
    } catch (error) {
        console.log("error in edit role and mobile route:", error);
        return NextResponse.json(
            { message: "error in edit role and mobile route", error },
            { status: 404 },
        );
    }
}
