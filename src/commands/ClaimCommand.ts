import { Message } from "discord.js";
import { claimHelpers } from "../claim/Claim";
import { claimService } from "../claim/ClaimService";

export const processClaimCommand = async (msg: Message) => {
  if (msg.channel.type !== "text") {
    return;
  }
  if (msg.guild === null) {
    return;
  }
  // fetch outstanding unfulfilled claims this user owes
  const outstandingClaims = await claimService.getOutstandingClaims(
    msg.author.id
  );

  if (outstandingClaims.length > 0) {
    const [claim] = outstandingClaims;

    await msg.reply({
      content: "You already have an outstanding claim.",
      embed: await claimHelpers.createClaimEmbed(claim, {
        client: msg.client,
        guild: msg.guild,
      }),
    });
  } else {
    const lastClaim = await claimService.getLatestClaim({
      guildId: msg.guild.id,
    });
    if (lastClaim && lastClaim.claimantId === msg.author.id) {
      msg.reply({
        content:
          "Whoops, you created the last claim. Someone else needs to claim your reference first.",
        embed: await claimHelpers.createClaimEmbed(lastClaim, {
          client: msg.client,
          guild: msg.guild,
        }),
      });
    }
    const finalClaim = await claimService.createClaim({
      claimantId: msg.author.id,
      fulfilled: lastClaim ? false : true,
      benefactorId: lastClaim?.claimantId || null,
      guildId: msg.guild.id,
      claimMessageId: msg.id,
      parentClaimId: lastClaim?.id || null,
      claimMessageChannelId: msg.channel.id,
      fulfillmentMessageChannelId: lastClaim ? null : msg.channel.id,
      fulfillmentMessageId: lastClaim ? null : msg.id,
    });

    await msg.reply(
      await claimHelpers.createClaimEmbed(finalClaim, {
        client: msg.client,
        guild: msg.guild,
      })
    );
  }
};
