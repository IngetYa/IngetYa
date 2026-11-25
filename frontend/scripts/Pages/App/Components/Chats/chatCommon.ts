import type { ChatRoomType, IConvo, IMessage } from "@/types/ServiceTypes"
import db from "../../data/db"
import { lang } from "@/core/languages"
import { toText } from "@/lib/gen"

export function getConvoAvatar(roomType: ChatRoomType): string {
  if (roomType === "order") return "fajdr fa-map"
  return "fadr fa-headset"
}

export function getConvoName(item: IConvo): string {
  return item.roomName ?? item.userName ?? item.id
}

export function getConvoLastMessage(item?: IMessage): string {
  if (!item) return `${lang("chat_open_chat")} <i class="fas fa-chevrons-right"></i>`

  const messageType = item.fileUrl ? "file" : "text"

  const iconClassName = messageType === "file" ? "fajdr fa-file" : "fajdr fa-comment-dots"

  const chatIcon = `<i class="${iconClassName}"></i>`

  const sentClassName = item.userId === db.me.id ? "fajdr fa-check" : null

  const sentIcon = sentClassName ? `<i class="${sentClassName}"></i> ` : ""

  const text = item.text

  const chatText = text ? toText(text) : lang("chat_type_file")

  const chatMessage = (messageType === "text" && text) || messageType === "file" ? `${sentIcon}${chatIcon} ${chatText}` : `${lang("chat_open_chat")} <i class="fas fa-chevrons-right"></i>`

  return chatMessage
}
