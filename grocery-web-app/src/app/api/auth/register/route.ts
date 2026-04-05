import connectDb from "@/lib/db";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    await connectDb();
    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const hashPass = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashPass,
    })

     return NextResponse.json(
        { message: "User created successfully", user: { name: user.name, email: user.email, role: user.role } },
        { status: 201 },
     )

  } catch (error) {
    console.log("error in register route:", error);
    return NextResponse.json(
      { message: "Error creating user" },
      { status: 500 },
    );
  }
}
