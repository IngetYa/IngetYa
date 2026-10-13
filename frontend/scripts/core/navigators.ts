export async function copyToClipboard(plaintext: string): Promise<boolean> {
  return await navigator.clipboard
    .writeText(plaintext)
    .then(() => {
      return true
    })
    .catch((_err) => {
      // console.log(err)
      return false
    })
}

export async function getPushPermission(): Promise<NotificationPermission> {
  const isSupported = "serviceWorker" in navigator && "PushManager" in window
  if (!isSupported) return "denied"

  return await Notification.requestPermission()
    .then((res) => {
      return res
    })
    .catch(() => "denied")
}
