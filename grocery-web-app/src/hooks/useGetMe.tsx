'use client'
import { setUserData } from '@/redux/userSlice'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'

function UseGetMe() {
    const dispatch = useDispatch<AppDispatch>()

  useEffect(()=> {
  const getMe = async () => {
   try {
    const result = await axios.get("/api/me")
    dispatch(setUserData(result.data))
    
   } catch (error) {
    console.log("error in useGetMe", error)
   }
  }
  getMe()
  },[dispatch])
}

export default UseGetMe