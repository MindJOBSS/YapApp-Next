import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";




interface LayoutProps {
    children: ReactNode
}

const Layout = async ({ children }: LayoutProps) => {
    const session = await auth()
    if (session) redirect("/dashboard")
    
    return (
        <>
            {children}
        </>
    )
}

export default Layout