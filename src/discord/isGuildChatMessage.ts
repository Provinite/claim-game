import { Guild, GuildMember, Message, TextChannel } from "discord.js";

export const isGuildChatMessage = (
  msg: Message
): msg is Message & {
  guild: Guild;
  member: GuildMember;
  channel: TextChannel;
} => {
  return Boolean(msg.member && msg.guild && msg.channel);
};
