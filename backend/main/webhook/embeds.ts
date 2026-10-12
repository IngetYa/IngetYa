import { chunkString } from "#lib/gen"
import { APIEmbed } from "#types/DiscordTypes"

export function createEmbeds(s: APIEmbed): APIEmbed[] {
  // pisahin string dengan batas 1000 karakter, jadi `string[]`
  const strings = chunkString(s.description || "", 1000)

  const isInspect = s.inspect

  // jangan sampe string dianggap undefined/null, so, kasih string kosong
  if (strings.length < 1) strings.push("")

  // kelompokkan array description tadi, dengan tetap memiliki properti lainnya.
  const embeds = strings
    .filter((_str, i) => i <= 8)
    .map((str, i) => {
      const data: APIEmbed = { description: isInspect ? `\`\`\`\n${str}\n\`\`\`` : str }
      if (str.length < 1) delete data.description

      if (s.author) data.author = s.author
      if (s.color) data.color = s.color
      if (s.fields) data.fields = s.fields
      if (s.footer) data.footer = s.footer
      if (s.image) data.image = s.image
      if (s.provider) data.provider = s.provider
      if (s.thumbnail) data.thumbnail = s.thumbnail
      if (s.timestamp) data.timestamp = s.timestamp
      if (s.ts) data.timestamp = new Date().toISOString()

      // kasih aturan "num/total", buat jelasin nomor halaman di pesan yang sama
      if (s.title || strings.length >= 1) {
        data.title = strings.length <= 1 ? s.title : `${s.title || ""} [Page ${i + 1}/${strings.length}]`.trim()
      }

      if (s.url) data.url = s.url
      if (s.video && s.url) data.video = { url: s.url }
      return data
    })

  return embeds
}
