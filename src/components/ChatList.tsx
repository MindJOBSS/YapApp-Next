"use client"
import { Message, User } from '@/types/db.t'
import { usePathname, useRouter } from 'next/navigation'
import {  useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import Link from 'next/link'
import { pusherClient } from '@/lib/pusher'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'


interface ChatListProps{
    friends: User[]
    sessionId : string
}
interface ExtendedMessage extends Message {
    senderImg: string
    senderName: string
  }

const ChatList = ({ friends, sessionId }: ChatListProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)
    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])
    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = (newFriend: User) => {
            console.log("received new user", newFriend)
            setActiveChats((prev) => [...prev, newFriend])
        }

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify =
                pathname !==
                `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return

            // should be notified
            toast.custom((t) => (
                <UnseenChatToast
                    t={t}
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderImg={message.senderImg}
                    senderMessage={message.text}
                    senderName={message.senderName}
                />
            ))

            setUnseenMessages((prev) => [...prev, message])
        }

        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_message', chatHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }
    }, [pathname, sessionId, router])
    
    
  return (
      <details className="collapse rounded-none bg-base-100 border-base-300 border">
          <summary className="collapse-title font-semibold">
                  <div className=' group flex items-center gap-x-3 text-sm leading-6 font-semibold'>
                      <div className=' flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white indicator'>
                          <MessageCircle className="h-6 w-6 text-primary" />
                      </div>
                      <p className='truncate text-lg cursor-default'>Your chats</p>
                  </div>
          </summary>
          <div className="collapse-content text-sm">
              <>
                  {friends.length > 0 ? (
                      <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
                          {activeChats.sort().map((friend) => {
                              const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
                                  return unseenMsg.senderId === friend.id
                              }).length

                              return (
                                  <li key={friend.id}>
                                      <Link
                                          href={`/dashboard/chat/${chatHrefConstructor(
                                              sessionId,
                                              friend.id
                                          )}`}
                                          className='text-base-content hover:bg-base-300 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                          {friend.name}
                                          {unseenMessagesCount > 0 ? (
                                              <div className='bg-indigo-600 font-medium text-xs text-primary w-4 h-4 rounded-full flex justify-center items-center'>
                                                  {unseenMessagesCount}
                                              </div>
                                          ) : null}
                                      </Link>
                                  </li>
                              )
                          })}
                 </ul>
                  ) : (
                      <div>You have no chats</div>
                  )}
              </>
          </div>
      </details>
  )
}

export default ChatList