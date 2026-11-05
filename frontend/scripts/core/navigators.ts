// mekanik copy to clipboard
export async function copyToClipboard(plaintext: string): Promise<boolean> {
  // kadang kalo browsernya kek anjing, ga bisa copy cuk
  // makanya dikasih catch biar gada state error

  if ("clipboard" in navigator) {
    return await navigator.clipboard
      .writeText(plaintext)
      .then(() => true)
      .catch(() => false)
  }

  return false
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

export function openLink(url: string): void {
  const canOpen = window.open(url, "_blank")

  if (!canOpen) window.location.href = url
}
