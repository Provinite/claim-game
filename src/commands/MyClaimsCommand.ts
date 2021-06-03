import { Message } from "discord.js";
import { Claim, claimHelpers } from "../claim/Claim";
import { claimService } from "../claim/ClaimService";

export const processMyClaimsCommand = async (msg: Message) => {
  const filter: Partial<Claim> = {};
  if (msg.guild) {
    filter.guildId = msg.guild.id;
  }
  const claims = await claimService.getOutstandingClaims(msg.author.id);
  for (const claim of claims) {
    await msg.reply(
      await claimHelpers.createClaimEmbed(claim, { client: msg.client })
    );
  }
  if (!claims.length) {
    return msg.reply("You have no outstanding claims");
  }
};
