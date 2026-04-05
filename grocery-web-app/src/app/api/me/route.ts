import { auth } from "@/auth";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "user is not authenticated" },
        { status: 401 },
      );
    }
    const user = await User.findOne({email: session.user.email}).select("-password");
    if(!user){
        return NextResponse.json(
            {message: "user not found"},
            {status: 404}
        )
    } 
    
    return NextResponse.json(
        user,
        {status: 200}
    );
   

  } catch (error) {
    NextResponse.json(
      { message: "error in get me", error },
      { status: 500 },
    );
  }
}
