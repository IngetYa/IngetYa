// mekanik copy to clipboard
export async function copyToClipboard(plaintext: string): Promise<boolean> {
  // kadang kalo browsernya kek anjing, ga bisa copy cuk
  // makanya dikasih catch biar gada state error
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

// permission push notification
// jangan terlalu diseriusin, banyak orang yg block notification
export async function getPushPermission(): Promise<NotificationPermission> {
  const isSupported = "serviceWorker" in navigator && "PushManager" in window
  if (!isSupported) return "denied"

  return await Notification.requestPermission()
    .then((res) => {
      return res
    })
    .catch(() => "denied")
}
