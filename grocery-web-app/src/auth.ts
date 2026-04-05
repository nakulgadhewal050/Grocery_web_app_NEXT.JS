import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDb from "./lib/db";
import User from "./models/userModel";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDb();
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          return null;
        }

        const user = await User.findOne({ email });
        if (!user) {
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return null;
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ,
    })
  ],

  callbacks: {

    async signIn({user, account}){
      if (account?.provider === "google"){
        await connectDb();
        let existUser = await User.findOne({email: user.email});
        if(!existUser){
          existUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            location: {
              type: "Point",
              coordinates: [0, 0],
            },
          })
        }
        user.id = existUser._id.toString();
        user.role = existUser.role;
      }
      return true;
    },

    async jwt({ token, user, trigger, session}) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }

      if(trigger === "update") {
        token.role = session.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.AUTH_SECRET,
});
