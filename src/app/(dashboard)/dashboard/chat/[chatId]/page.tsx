import { auth } from '@/auth'
import { fetchRedis } from '@/helpers/redis'
import { Message, User } from '@/types/db.t'
import { messageArrayValidator } from '@/validators/message'
import { notFound, redirect } from 'next/navigation'
import React from 'react'
import Image from 'next/image'
import Messages from '@/components/Messages'
import ChatInput from '@/components/ChatInput'

export const dynamic = "force-dynamic"



async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:messages`,
      0,
      -1
    )

    const dbMessages = results.map((message) => JSON.parse(message) as Message)

    const reversedDbMessages = dbMessages.reverse()

    const messages = messageArrayValidator.parse(reversedDbMessages)

    return messages
  } catch (error) {
    console.log(error)
    notFound()
  }
}


const Page = async ({ params }: {params :Promise<{chatId:string}>}) => {
  const  chatId  = (await params).chatId
  const session = await auth()
  if (!session) redirect("/login")
  const { user } = session
  const [userId1, userId2] = chatId.split("--")
  if (user.id !== userId1 && user.id !== userId2) {
    notFound()
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1

  const chatPartnerRaw = (await fetchRedis(
    'get',
    `user:${chatPartnerId}`
  )) as string
  const chatPartner = JSON.parse(chatPartnerRaw) as User
  const initialMessages = await getChatMessages(chatId)
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <Image
                  fill
                  referrerPolicy='no-referrer'
                  src={chatPartner.image}
                  alt={`${chatPartner.name} profile picture`}
                  className='rounded-full'
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium">{chatPartner.name}</h3>
            </div>
          </div>
        </div>
      </div>
      <Messages
        chatId={chatId}
        chatPartner={chatPartner}
        sessionImg={session.user.image}
        sessionId={session.user.id}
        initialMessages={initialMessages}
      />
      <ChatInput chatId={chatId} chatPartner={chatPartner} />
    </div>
  )
}

export default Page