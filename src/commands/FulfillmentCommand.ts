import {
  Collection,
  GuildMember,
  Message,
  MessageMentions,
  MessageReaction,
  ReactionEmoji,
  User,
} from "discord.js";
import getUrls from "get-urls";
import {
  fulfillClaim,
  getClaims,
  revertClaimFulfillment,
} from "../claim/ClaimService";

export const processPotentialFulfillmentCommand = async (msg: Message) => {
  if (isFulfillmentLike(msg)) {
    const benefactorMember = msg.mentions.members.first()!;
    const claims = await getClaims({
      claimantId: msg.author.id,
      benefactorId: benefactorMember.id,
      fulfilled: false,
    });
    if (!claims.length) {
      return;
    } else {
      await fulfillClaim(claims[0]);
      const message = await msg.reply(
        `Nice, looks like you've fulfilled your claim for ${benefactorMember}. If i've got that wrong, react to this message with an ❌ within 2 minutes.`
      );
      await message.react("❌");

      // cancel if need-be
      message
        .awaitReactions(
          (reaction: MessageReaction, user: User) => {
            return reaction.emoji.name === "❌" && user.id === msg.author.id;
          },
          { max: 1, time: 120000 }
        )
        .then(async (reactionSet) => {
          if (reactionSet.size) {
            await revertClaimFulfillment(claims[0]);
          }
        });
    }
  }
};
export const isFulfillmentLike = (
  msg: Message
): msg is Message & {
  mentions: MessageMentions & { members: Collection<string, GuildMember> };
} => {
  const hasMention = Boolean(msg.mentions.members?.size);
  const messageUrls = getUrls(msg.content);
  const hasLink = messageUrls.size > 0;
  const hasAttachment = Boolean(msg.attachments.size);

  const hasFulfillment = hasLink || hasAttachment;

  return hasMention && hasFulfillment;
};
