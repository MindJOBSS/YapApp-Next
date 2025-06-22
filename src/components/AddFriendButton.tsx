"use client"
import { addFriend } from "@/lib/server-action"
import { User,Plus } from "lucide-react"
import { useActionState } from "react"
import toast from "react-hot-toast"
import { useEffect } from "react"

const AddFriendButton = () => {
    const openModal = () => {
        const modal = document.getElementById('my_modal_1') as HTMLDialogElement
        if (modal) modal.showModal()
    }
    
    const [error, action, isPending] = useActionState(addFriend, null)

    useEffect(() => {
        if (error?.error) {
            toast.error(error.error)
        }
        if (error?.success) {
            toast.success(error.success)
        }
    },[error])

    return (
        <>
            <button className="btn btn-sm gap-2" onClick={openModal}>
                <User className="size-5" />
                Add
            </button>

            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Add a friend</h3>
                    
                    <form action={action} >
                        <input
                            required
                            name="email" 
                            type="email"
                            className="input input-bordered pl-10 mt-6"
                            placeholder="you@example.com"
                        />
                        <button className="btn btn-soft btn-md ml-4 mt-6">
                            {isPending ? null : (<div className="flex gap-2">Add < Plus className="size-5" /></div>)}
                            {isPending && (<span className="loading loading-spinner loading-sm"></span>)}
                        </button>
                    </form>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* This button will close the modal */}
                            <button className="btn btn-ghost">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </>
    )
}

export default AddFriendButton
