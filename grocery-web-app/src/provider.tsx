'use client'
import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from 'react-toastify'
import React from 'react'

function Provider({children}: {children: React.ReactNode}) {

  return (
    <SessionProvider>
      <ToastContainer />
      {children}
    </SessionProvider>
  )
}

export default Provider