import axios from "axios";

async function emitEventHandler(event:string, data:any, socketId?:string) {
     try {
        const result = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/notify`, {
            socketId,
            event,
            data
        })
        console.log("result of emit event", result.data)
     } catch (error) {
        console.log("error in emitEventHandler", error)
     }
}

export default emitEventHandler;