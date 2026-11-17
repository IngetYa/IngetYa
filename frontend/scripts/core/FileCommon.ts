interface IMediaExtension {
  image: string[]
  video: string[]
}

const mediaExtension: IMediaExtension = {
  image: ["jpg", "jpeg", "png", "webp", "svg"],
  video: ["mp4", "3gp", "flv", "mov", "mkv"]
  // audio: ["ogg", "mp3", "wav", "m4a", "opus"]
}

export default function getFileType(filename: string): keyof IMediaExtension | undefined {
  const fileFormat = /\.([a-zA-Z0-9]+)$/
  filename = filename.toLowerCase()
  const fileExt = filename.match(fileFormat)?.[1] || "unknown"

  const extension = Object.keys(mediaExtension).find((key) => {
    const k = key as keyof IMediaExtension
    return mediaExtension[k] && mediaExtension[k].some((key: string) => key === fileExt)
  })

  if (extension) return extension as keyof typeof mediaExtension

  return undefined
}
