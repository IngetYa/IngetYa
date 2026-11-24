import type { IAny } from "@/types/LibTypes"
import waittime from "@/lib/waittime"
import xhr from "@/lib/xhr"

interface QueueMessage {
  text?: string
  file?: File
  tempId: string
  url: string
  roomId: string
}

const queue: QueueMessage[] = []
let isProcessing: boolean = false

async function processMessage(s: QueueMessage): Promise<void> {
  let fileKeySuccess: null | string = null

  if (s.file) {
    const getPresign = await xhr.post(`/x/storage/message-presign/${s.roomId}`, {
      filename: s.file.name,
      fileType: s.file.type,
      fileSize: s.file.size
    })

    if (!getPresign.ok && (getPresign.status === 429 || getPresign.status === 408 || getPresign.status >= 500)) {
      await waittime(2000)
      return await processMessage(s)
    }

    if (!getPresign.ok) {
      console.log(getPresign)
      return
    }

    const uploadUrl = getPresign.data.uploadUrl as string
    const fileKey = getPresign.data.fileKey as string

    try {
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": s.file.type
        },
        body: s.file
      })

      console.log(uploadRes)

      if (uploadRes.ok) {
        fileKeySuccess = fileKey
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (s.file && !fileKeySuccess) return

  const chatData = {
    text: s.text,
    tempId: s.tempId,
    fileKey: fileKeySuccess
  }

  const chatSent = await xhr.post(`${s.url}/${s.roomId}`, chatData)

  if (!chatSent.ok && (chatSent.status === 429 || chatSent.status === 408 || chatSent.status >= 500)) {
    await waittime(2000)
    return await processMessage(s)
  }
}

async function processQueue(): Promise<void> {
  if (isProcessing) return
  isProcessing = true

  while (queue.length > 0) {
    const nextJob = queue.shift()
    if (nextJob) {
      await processMessage(nextJob)
      await waittime(150)
    }
  }

  isProcessing = false
}

export async function sendChatMessage(s: QueueMessage): Promise<IAny> {
  queue.push(s)

  processQueue()
}
