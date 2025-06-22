import Link from "next/link"
import { MessageSquare,Settings   } from "lucide-react"
import { auth } from "@/auth"
import AddFriendButton from "./AddFriendButton"
import LogoutButton from "./LogoutButton"

const NavBar = async () => {
    
    const session = await auth()


    return (
        <header className="bg-base-100/80 border-b border-base-300 fixed w-full top-0 z-40 
        backdrop-blur-lg">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link href={"/dashboard"} className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-lg font-bold">YapApp</h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href={"/themes"}
                            className={`
                  btn btn-sm gap-2 transition-colors
                  
                  `}
                        >
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Themes</span>
                        </Link>

                        {session?.user && (
                            <>
                                    <AddFriendButton/>

                                <LogoutButton/>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
      )
}

export default NavBar