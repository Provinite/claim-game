import { Client, Message } from "discord.js";
import { processClaimCommand } from "./commands/ClaimCommand";
import { processPotentialFulfillmentCommand } from "./commands/FulfillmentCommand";
import { processHelpCommand } from "./commands/HelpCommand";
import { processInitCommand } from "./commands/InitCommand";
import { processMyClaimsCommand } from "./commands/MyClaimsCommand";
import { processSettingsCommand } from "./commands/SettingsCommand";
import { isGuildChatMessage } from "./discord/isGuildChatMessage";
import { getGuildSettings } from "./guildSettings/GuildSettingsCache";
import { getAllGuildSettings } from "./guildSettings/GuildSettingsService";

const main = async () => {
  const TOKEN = process.env.cc_claim_game_discord_token;
  const client = new Client();

  // fetch all guild settings, priming the guild settings cache
  await getAllGuildSettings();

  let commandPattern: RegExp | undefined;

  client.on("ready", () => {
    console.log(`Logged in as ${client.user?.username}`);
    commandPattern = new RegExp(`^<@!?${client.user!.id}>`);
  });

  const commands: Record<string, (msg: Message) => void> = {
    init: processInitCommand,
    claim: processClaimCommand,
    myclaims: processMyClaimsCommand,
    settings: processSettingsCommand,
    help: processHelpCommand,
  };

  client.on("message", async (msg) => {
    if (msg.author.bot) {
      return;
    }
    if (!commandPattern) {
      return;
    }
    if (commandPattern.test(msg.content)) {
      const msgContent = msg.content
        .substr(msg.content.indexOf(">") + 1)
        .trim();
      let firstWord = msgContent.split(/\s+/)[0];
      if (firstWord.length > 100) {
        return;
      }
      const cmd = commands[firstWord];
      if (cmd) {
        await cmd(msg);
      }
    } else if (isGuildChatMessage(msg)) {
      const fulfillmentChannelId = getGuildSettings(
        msg.guild.id
      )?.fulfillmentChannelId;
      if (msg.channel.id === fulfillmentChannelId) {
        await processPotentialFulfillmentCommand(msg);
      }
    }
  });

  client.login(TOKEN);
};

main();
