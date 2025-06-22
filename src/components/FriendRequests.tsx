'use client'

import React, { useEffect, useState } from 'react'
import { Users, Check, X } from 'lucide-react'
import { IncomingFriendRequest } from '../types/pusher'
import { useRouter } from 'next/navigation'
import { acceptFriend, denyFriend } from '@/lib/server-action'
import toast from 'react-hot-toast'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'

interface FriendRequestSidebarOptionsProps {
    sessionId: string
    initialUnseenRequestCount: number
    incomingFriendRequests: IncomingFriendRequest[]
}

const FriendRequests = ({
    sessionId,
    initialUnseenRequestCount,
    incomingFriendRequests,
}: FriendRequestSidebarOptionsProps) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    const router = useRouter()

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        )
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const friendRequestHandler = (data: IncomingFriendRequest) => {
            setUnseenRequestCount((prev) => prev + 1)
            setFriendRequests((prev) => [...prev, data])
        }

        const addedFriendHandler = () => {
            setUnseenRequestCount((prev) => prev - 1)
        }

        pusherClient.bind('incoming_friend_requests', friendRequestHandler)
        pusherClient.bind('new_friend', addedFriendHandler)

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_requests`)
            )
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))

            pusherClient.unbind('new_friend', addedFriendHandler)
            pusherClient.unbind('incoming_friend_requests', friendRequestHandler)
        }
    }, [sessionId])

    const acceptRequest = async (id: string) => {
        const res = await acceptFriend(id)
        if (res.error) return toast.error(res.error)

        setFriendRequests((prev) => prev.filter((r) => r.senderId !== id))
        setUnseenRequestCount((prev) => Math.max(prev - 1, 0))
        toast.success(res.success || 'Friend added')
        router.refresh()
    }

    const denyRequest = async (id: string) => {
        const res = await denyFriend(id)
        if (res.error) return toast.error(res.error)

        setFriendRequests((prev) => prev.filter((r) => r.senderId !== id))
        setUnseenRequestCount((prev) => Math.max(prev - 1, 0)) 
        toast.success(res.success || 'Request denied')
        router.refresh()
    }

    return (
        <details className="collapse rounded-none bg-base-100 border-base-300 border">
            <summary className="collapse-title font-semibold">
                <div className="group flex items-center gap-x-3 text-sm leading-6 font-semibold">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white indicator">
                        <Users className="h-6 w-6 text-primary" />
                        {unseenRequestCount > 0 ? (
                            <span className="indicator-item badge badge-primary badge-xs text-primary-content">
                                {unseenRequestCount}
                            </span>
                        ) : null}
                    </div>
                    <p className="truncate text-lg cursor-default">Friend requests</p>
                </div>
            </summary>
            <div className="collapse-content text-sm">
                <>
                    {friendRequests.length === 0 ? (
                        <p className="text-sm text-base-content">You have no friend requests...</p>
                    ) : (
                        friendRequests.map((request) => (
                            <div
                                key={request.senderId}
                                className="mt-2 flex gap-4 justify-between items-center"
                            >
                                <p className="font-medium text-md">{request.senderEmail}</p>
                                <div className="flex items-center gap-x-2">
                                    <button
                                        onClick={() => acceptRequest(request.senderId)}
                                        aria-label="accept friend"
                                        className="w-6 h-6 grid bg-success cursor-pointer place-items-center rounded-full transition hover:shadow-md"
                                    >
                                        <Check className="font-semibold text-white w-3/4 h-3/4" />
                                    </button>

                                    <button
                                        onClick={() => denyRequest(request.senderId)}
                                        aria-label="deny friend"
                                        className="w-6 h-6 grid bg-error cursor-pointer place-items-center rounded-full transition hover:shadow-md"
                                    >
                                        <X className="font-semibold text-white w-3/4 h-3/4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </>
            </div>
        </details>
    )
}

export default FriendRequests
