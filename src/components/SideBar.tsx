import { auth } from "@/auth"
import Image from "next/image"
import FriendRequests from "./FriendRequests"
import { fetchRedis } from "@/helpers/redis"
import { User } from "@/types/db.t"
import { getFriendsByUserId } from "@/helpers/get-friends"
import ChatList from "./ChatList"


const SideBar = async () => {
    
    const session = await auth()

    const incomingSenderIds = (await fetchRedis(
        'smembers',
        `user:${session!.user.id}:incoming_friend_requests`
    )) as string[]

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = (await fetchRedis('get', `user:${senderId}`)) as string
            const senderParsed = JSON.parse(sender) as User

            return {
                senderId,
                senderEmail: senderParsed.email,
            }
        })
    )
    const unseenRequestCount = (
        (await fetchRedis(
            'smembers',
            `user:${session!.user.id}:incoming_friend_requests`
        )) as User[]
    ).length
    
    const friends = await getFriendsByUserId(session!.user.id)

  return (
      <div className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col ">
          <div className="border-b border-base-300 w-full p-5">
              <div className='flex flex-1 items-center gap-x-4  py-3 text-sm font-semibold leading-6 text-primary'>
                  <div className="avatar">
                                <div className="size-10 rounded-full relative">
                                  <Image
                                    fill
                                    referrerPolicy='no-referrer'
                                    src={session!.user.image || ""}
                                    alt={`${session!.user.name} profile picture`}
                                    className='rounded-full'
                                  />
                                </div>
                              </div>

                  <span className='sr-only'>Your profile</span>
                  <div className='flex flex-col'>
                      <span className="text-base-content" aria-hidden='true'>{session!.user.name}</span>
                      <span className='text-xs text-info-content' aria-hidden='true'>
                          {session!.user.email}
                      </span>
                  </div>
              </div>
          </div>

          <FriendRequests sessionId={session!.user.id}
              initialUnseenRequestCount={unseenRequestCount}
                incomingFriendRequests={incomingFriendRequests}
          />

          <ChatList friends={friends} sessionId={ session!.user.id} />
    </div>
  )
}

export default SideBar