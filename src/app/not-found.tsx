import { auth } from '@/auth'
import React from 'react'
import Link from 'next/link'

const page = async() => {
    const session = await auth()
  return (
      <div className='h-dvh w-dvw bg-base-300 flex justify-center items-center' >
          <div className="card bg-base-100 w-96 shadow-sm">
              <div className="card-body">
                  <h2 className="card-title">404 Not-found </h2>
                  <p>This page either does not exist or is not supported yet</p>
                  <p>Do you want to be redirected to {session? " dashboard":" login" }</p>
                  <div className="card-actions justify-end">
                      <Link href = {session?"/dashboard":"/login"}>
                          <button className="btn btn-primary">Yes</button>
                      </Link>
                  </div>
              </div>
          </div>
    </div>
  )
}

export default page