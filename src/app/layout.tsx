import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavBar from '../components/NavBar';
import ThemeChanger from "@/components/ThemeChanger";



export const metadata: Metadata = {
  title: "YapApp",
  description: "Implemented with Nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeChanger>
          <NavBar />
          {children}
          <Toaster />
        </ThemeChanger>
      </body>
    </html>
  );
}
