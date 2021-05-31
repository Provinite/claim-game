import { Message } from "discord.js";
import { Conversation } from "../discord/Conversation";
import { isGuildChatMessage } from "../discord/isGuildChatMessage";
import {
  createGuildSettingsEmbed,
  GuildSettings,
} from "../guildSettings/GuildSettings";
import {
  createGuildSettings,
  getGuildSettings,
  updateGuildSettingsById,
} from "../guildSettings/GuildSettingsService";

export const processInitCommand = async (msg: Message) => {
  if (!isGuildChatMessage(msg)) {
    return;
  }
  if (!msg.member.hasPermission("ADMINISTRATOR")) {
    return;
  }

  const conversation = new Conversation(msg);

  const existingSettings = await getGuildSettings({ guildId: msg.guild.id });
  if (existingSettings) {
    await msg.reply(createGuildSettingsEmbed(msg.guild, existingSettings));
    while (true) {
      await conversation.say(
        "Claim Game has already been set up for this server. Overwrite these settings? (Yes/No)"
      );
      const response = await conversation.listen();
      if (response.content.toLowerCase() === "yes") {
        await conversation.say(
          "Okay, we'll overwrite these settings with your new settings"
        );
        break;
      } else if (response.content.toLowerCase() === "no") {
        return conversation.say("Alright, not changing any settings.");
      }
    }
  }

  let guildSettings: Partial<GuildSettings> = {
    guildId: msg.guild.id,
  };

  const claimChannel = await conversation.askForChannel(
    "First, link the channel where claims should be created"
  );
  const shareChannel = await conversation.askForChannel(
    "Cool, now link the channel where claims are to be fulfilled (and artwork shared)."
  );

  guildSettings.claimChannelId = claimChannel.id;
  guildSettings.fulfillmentChannelId = shareChannel.id;

  if (existingSettings) {
    delete guildSettings.guildId;
    guildSettings = await updateGuildSettingsById(msg.guild.id, guildSettings);
  } else {
    guildSettings = await createGuildSettings(guildSettings);
  }

  await msg.reply({
    content: `Nice! All set, your new settings are below.`,
    embed: createGuildSettingsEmbed(msg.guild, guildSettings as GuildSettings),
  });
};
