import { EmbedBuilder, ChatInputCommandInteraction, MessageFlags, Colors } from "discord.js"
import { BotClient } from "#bot/BotClient"

export default async function slashCmdInteraction(interaction: ChatInputCommandInteraction, client: BotClient) {
  // cek apakah slash command valid di collection
  const command = client.slashCommands.get(interaction.commandName)

  // kalo ternyata ga valid, kasih follow-up
  if (!command) {
    return await interaction.reply({
      flags: [MessageFlags.Ephemeral],
      embeds: [new EmbedBuilder().setColor(Colors.NotQuiteBlack).setDescription(`> Command ini udah **penyakitan**, coba lagi ntar kalo udah diperbarui.`)]
    })
  }

  // logic cooldown biasa
  if (command.options?.cooldown) {
    const currentMemberCooldown = client.cooldowns.get(`${interaction.user.id}-button-${interaction.commandName}`)
    if (!currentMemberCooldown) client.cooldowns.set(`${interaction.user.id}-button-${interaction.commandName}`, (Date.now() + command.options.cooldown).toString())
    else if (parseInt(currentMemberCooldown) < Date.now()) client.cooldowns.set(`${interaction.user.id}-button-${interaction.commandName}`, (Date.now() + command.options.cooldown).toString())
    else
      return await interaction.reply({
        flags: [MessageFlags.Ephemeral],
        embeds: [new EmbedBuilder().setColor(Colors.NotQuiteBlack).setDescription(`> Kamu lagi **cooldown**, coba lagi ntar. <t:${Math.floor(parseInt(currentMemberCooldown) / 1000)}:R>**.`)]
      })
  }

  // lanjut ke method di class slashCommands
  command.execute(interaction, client)
}
