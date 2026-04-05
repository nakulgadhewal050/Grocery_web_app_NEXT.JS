'use client'
import { getSocket } from '@/lib/socket'
import { useEffect } from 'react'


type GeoUpdaterProps = {
    userId: string
}

function GeoUpdater({ userId }: GeoUpdaterProps) {
    
      const socket = getSocket();
      socket.emit("identity", userId);
 
    useEffect(() => {
        let socket = getSocket()
        if (!userId) return
        if (!navigator.geolocation) return

        const watcher = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                socket.emit('updateLocation', {
                    userId,
                    latitude: lat,
                    longitude: lng,
                })
            },
            (error) => {
                console.error('Error watching position:', error)
            },
            { enableHighAccuracy: true }
        )

        return () => {
            navigator.geolocation.clearWatch(watcher)
        }
    }, [userId])

    return null
}

export default GeoUpdater