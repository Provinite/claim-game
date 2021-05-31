import { Message } from "discord.js";
import { isGuildChatMessage } from "../discord/isGuildChatMessage";
import { createGuildSettingsEmbed } from "../guildSettings/GuildSettings";
import { getGuildSettings } from "../guildSettings/GuildSettingsService";

export async function processSettingsCommand(msg: Message) {
  if (!isGuildChatMessage(msg)) {
    return;
  }
  if (!msg.member.hasPermission("ADMINISTRATOR")) {
    return;
  }
  const settings = await getGuildSettings({ guildId: msg.guild.id });
  if (settings) {
    msg.reply(createGuildSettingsEmbed(msg.guild, settings));
  } else {
    msg.reply(
      "Use the init command to get started with Claim Game on this server."
    );
  }
}
