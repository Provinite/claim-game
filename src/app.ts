import { Client, Message } from "discord.js";
import { processBugCommand } from "./commands/BugCommand";
import { processClaimCommand } from "./commands/ClaimCommand";
import { processCreditsCommand } from "./commands/CreditsCommand";
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
    credits: processCreditsCommand,
    bug: processBugCommand,
  };

  client.on("message", async (msg) => {
    if (msg.author.bot) {
      return;
    }
    if (!commandPattern) {
      return;
    }
    const hasCommand = commandPattern.test(msg.content);
    if (hasCommand || msg.channel.type === "dm") {
      let msgContent = msg.content;

      if (hasCommand) {
        msgContent = msgContent.substr(msg.content.indexOf(">") + 1);
      }
      msgContent = msgContent.trim();
      let firstWord = msgContent.split(/\b/)[0];
      if (firstWord) {
        firstWord = firstWord.toLowerCase();
      } else {
        return;
      }
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
