import Provider from "@/provider";
import "./globals.css";
import { Metadata } from "next";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/initUser";

export const metadata: Metadata = {
  title: "SnapKart",
  description: "Your one-stop online grocery store for fresh produce, pantry essentials, and household items. Enjoy seamless shopping with fast delivery and unbeatable prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen overflow-x-hidden bg-linear-to-b from-green-300 to-white">
        <Provider>
          <StoreProvider>
            <InitUser/>
              {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
