'use client'

import { User } from '@/types/db.t'
import { sendMessage } from '@/lib/server-action'
import { FC, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import TextareaAutosize from 'react-textarea-autosize'

interface ChatInputProps {
    chatPartner: User
    chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')

    const handleMessage = async () => {
        if (!input) return
        setIsLoading(true)

        try {
            await sendMessage(chatId, input)
            setInput('')
            textareaRef.current?.focus()
        } catch {
            toast.error('Something went wrong. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='border-t border-base-300 px-4 pt-4 mb-2 sm:mb-0'>
            <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm   '>
                <TextareaAutosize
                    ref={textareaRef}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleMessage()
                        }
                    }}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Message ${chatPartner.name}`}
                    className='block w-full resize-none border-0 bg-transparent text-base-content placeholder:text-gray-400 sm:py-1.5 sm:text-sm sm:leading-6 focus:outline-none focus:ring-0 focus:border-none'
                />

                <div
                    onClick={() => textareaRef.current?.focus()}
                    className='py-2'
                    aria-hidden='true'>
                    <div className='py-px'>
                        <div className='h-9' />
                    </div>
                </div>

                <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                    <div className='flex-shrin-0'>
                        <button className='btn btn-outline btn-primary' onClick={handleMessage} type='submit'>
                            {isLoading ? (<span className="loading loading-spinner loading-xs"></span>): "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInput