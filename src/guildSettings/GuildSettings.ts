import { Guild, MessageEmbed } from "discord.js";
import { createEmbed } from "../discord/createEmbed";

export interface GuildSettings {
  guildId: string;
  claimChannelId: string;
  fulfillmentChannelId: string;
}

export const createGuildSettingsEmbed = (
  guild: Guild,
  settings: GuildSettings
) => {
  return createEmbed()
    .setTitle(`Claim Game Settings for ${guild.toString()}`)
    .addFields([
      {
        name: `Claim Channel`,
        value: `The claim command can be used in the <#${settings.claimChannelId}> channel to create claims.`,
      },
      {
        name: "Fulfillment Channel",
        value: `Claims can be fulfilled in the <#${settings.fulfillmentChannelId}> channel by mentioning the recipient of the claim and including a link or an image.`,
      },
    ]);
};
