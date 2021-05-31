import { Message } from "discord.js";
import { createClaimEmbed } from "../claim/Claim";
import {
  createClaim,
  getLatestClaim,
  getOutstandingClaims,
} from "../claim/ClaimService";

export const processClaimCommand = async (msg: Message) => {
  if (msg.channel.type !== "text") {
    return;
  }
  if (msg.guild === null) {
    return;
  }
  // fetch outstanding unfulfilled claims this user owes
  const outstandingClaims = await getOutstandingClaims(msg.author.id);

  if (outstandingClaims.length > 0) {
    const [claim] = outstandingClaims;

    msg.reply({
      content: "You already have an outstanding claim.",
      embed: await createClaimEmbed(claim, {
        client: msg.client,
        guild: msg.guild,
      }),
    });
  } else {
    const lastClaim = await getLatestClaim({ guildId: msg.guild.id });
    if (lastClaim && lastClaim.claimantId === msg.author.id) {
      return msg.reply({
        content:
          "Whoops, you created the last claim. Someone else needs to claim your reference first.",
        embed: await createClaimEmbed(lastClaim, {
          client: msg.client,
          guild: msg.guild,
        }),
      });
    }
    const finalClaim = await createClaim({
      claimantId: msg.author.id,
      fulfilled: lastClaim ? false : true,
      benefactorId: lastClaim?.claimantId || null,
      guildId: msg.guild.id,
      claimMessageId: msg.id,
      parentClaimId: lastClaim?.id || null,
      claimMessageChannelId: msg.channel.id,
    });

    await msg.reply(
      await createClaimEmbed(finalClaim, {
        client: msg.client,
        guild: msg.guild,
      })
    );
  }
};