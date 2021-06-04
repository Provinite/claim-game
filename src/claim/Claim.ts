import { Client, Guild, GuildMember, Message, User } from "discord.js";
import { createEmbed } from "../discord/createEmbed";
import {
  getBenefactor,
  getClaimant,
  getClaimMessage,
  getGuild,
  getParentClaim,
} from "./ClaimUtils";

export interface Claim {
  id: string;
  guildId: string;
  parentClaimId: string | null;
  benefactorId: string | null;
  claimantId: string;
  fulfilled: boolean;
  createDate: Date;
  claimMessageId: string;
  claimMessageChannelId: string;
  fulfillmentMessageId: string | null;
  fulfillmentMessageChannelId: string | null;
}

export type NonRootClaim = Claim & {
  parentClaimId: string;
  benefactorId: string;
};

export interface ClaimEmbedOptions {
  client: Client;
  guild?: Guild;
  benefactor?: GuildMember | User | null;
  parentMessage?: Message | null;
  claimMessage?: Message;
  claimant?: User;
}

export const claimHelpers = {
  createClaimEmbed,
};

async function createClaimEmbed(claim: Claim, options: ClaimEmbedOptions) {
  let { client, guild, benefactor, parentMessage, claimMessage, claimant } =
    options;
  if (isNonRootClaim(claim)) {
    if (guild === undefined) {
      guild = await getGuild(client, claim);
    }
    if (benefactor === undefined) {
      benefactor = await getBenefactor(client, claim);
    }
    if (parentMessage === undefined) {
      const parentClaim = await getParentClaim(claim);
      parentMessage = await getClaimMessage(client, parentClaim);
    }
  }
  if (claimant === undefined) {
    claimant = await getClaimant(claim, client);
  }
  if (claimMessage === undefined) {
    claimMessage = await getClaimMessage(client, claim);
  }

  const claimantMember =
    guild?.members.cache.get(claimant.id) ||
    (await guild?.members.fetch(claimant.id));

  const embed = createEmbed()
    .setTitle(`Claim in ${guild!.toString()}`)
    .setFooter(`${claim.id} Claimed`)
    .setTimestamp(claim.createDate);

  if (claimantMember) {
    embed.setAuthor(claimantMember.displayName, claimant.displayAvatarURL());
  }
  if (benefactor) {
    embed.addField("Owed to", benefactor.toString(), true);
  }
  if (claimant) {
    embed.addField("Claimed by", claimant.toString(), true);
  }

  if (parentMessage) {
    embed.addField("Reference Message", parentMessage.url);
  }
  if (claimMessage) {
    embed.addField("Claim Message", claimMessage.url);
  }
  if (!isNonRootClaim(claim)) {
    embed.setDescription("The first claim in the chain for this server");
  }

  return embed;
}

export function isNonRootClaim(claim: Claim): claim is NonRootClaim {
  return claim.parentClaimId !== null;
}
