import { auth } from '@/auth'
import AdminDashboard from '@/components/AdminDashboard'
import DeliveryBoy from '@/components/DeliveryBoy'
import EditRoleandMobile from '@/components/EditRoleandMobile'
import Footer from '@/components/Footer'
import GeoUpdater from '@/components/GeoUpdater'
import Nav from '@/components/Nav'
import UserDashBoard from '@/components/UserDashBoard'
import connectDb from '@/lib/db'
import User from '@/models/userModel'
import { redirect } from 'next/navigation'
import React from 'react'

async function page() {
  await connectDb()
  const session = await auth()
  const user = await User.findById(session?.user?.id)
  if (!user) {
    redirect("/login")
  }

  const inComplete = !user?.mobile || !user?.role || (!user.mobile && user.role === "user")
  if (inComplete) {
    return <EditRoleandMobile />
  }
  const plainUser = JSON.parse(JSON.stringify(user))
  return (
    <>
      <Nav user={plainUser} />
      <GeoUpdater userId={plainUser._id} />
      {user.role === "user" ? (
        <UserDashBoard />) : user.role === "admin" ? (
          <AdminDashboard />) : <DeliveryBoy />}
          <Footer/>
    </>
  )
}

export default page
