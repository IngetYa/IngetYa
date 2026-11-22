import { ButtonInteraction, Colors, EmbedBuilder, MessageFlags } from "discord.js"
import { Button } from "#bot/Structures/Interfaces/interfaces"
import { BotClient } from "#bot/BotClient"

export default async function buttonInteraction(interaction: ButtonInteraction, client: BotClient) {
  let button: Button | undefined = undefined

  for (const key of client.buttons.keys()) {
    if (interaction.customId.includes(key)) {
      const checkButton = client.buttons.get(key)
      if (!checkButton?.checkIfCustomIdIncludes && key !== interaction.customId) {
        return
      }

      button = checkButton as Button
    }
  }

  if (!button) {
    return await interaction.reply({
      flags: [MessageFlags.Ephemeral],
      embeds: [new EmbedBuilder().setColor(Colors.NotQuiteBlack).setDescription(`> Tombol ini udah **penyakitan**, coba lagi ntar kalo udah diperbarui.`)]
    })
  }

  if (button.allowInteractionAuthorOnly && interaction.user.id !== interaction.message.interactionMetadata?.user.id)
    return await interaction.reply({
      flags: [MessageFlags.Ephemeral],
      embeds: [new EmbedBuilder().setColor(Colors.NotQuiteBlack).setDescription(`> Kamu **ga boleh** pake tombol ini.`)]
    })

  if (button.cooldown) {
    const currentMemberCooldown = client.cooldowns.get(`${interaction.user.id}-button-${interaction.customId}`)
    if (!currentMemberCooldown) client.cooldowns.set(`${interaction.user.id}-button-${interaction.customId}`, (Date.now() + button.cooldown).toString())
    else if (parseInt(currentMemberCooldown) < Date.now()) client.cooldowns.set(`${interaction.user.id}-button-${interaction.customId}`, (Date.now() + button.cooldown).toString())
    else
      return await interaction.reply({
        flags: [MessageFlags.Ephemeral],
        embeds: [new EmbedBuilder().setColor(Colors.NotQuiteBlack).setDescription(`> Kamu lagi **cooldown**, coba lagi ntar. <t:${Math.floor(parseInt(currentMemberCooldown) / 1000)}:R>**.`)]
      })
  }

  button.execute(interaction, client)
}
