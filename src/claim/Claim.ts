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
  claimMessage?: Message | null;
  claimant?: User | null;
}

export const claimHelpers = {
  createClaimEmbed,
};

async function createClaimEmbed(claim: Claim, options: ClaimEmbedOptions) {
  try {
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

    let claimantMember: GuildMember | null = null;
    try {
      if (claimant) {
        const fetchedMember =
          guild?.members.cache.get(claimant.id) ||
          (await guild?.members.fetch(claimant.id));
        claimantMember = fetchedMember || null;
      } else {
        claimantMember = null;
      }
    } catch (err) {
      claimantMember = null;
    }

    const embed = createEmbed()
      .setTitle(`Claim in ${guild!.toString()}`)
      .setFooter(`${claim.id} Claimed`)
      .setTimestamp(claim.createDate);

    embed.setAuthor(
      claimantMember?.displayName || "Unknown User",
      claimant?.displayAvatarURL() || undefined
    );

    embed.addField("Owed to", benefactor?.toString() || "Not Found");
    embed.addField("Claimed by", claimant?.toString() || "Not Found", true);

    embed.addField("Reference Message", parentMessage?.url || "Not Found");
    embed.addField("Claim Message", claimMessage?.url || "Not Found");
    if (!isNonRootClaim(claim)) {
      embed.setDescription("The first claim in the chain for this server");
    }

    return embed;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function isNonRootClaim(claim: Claim): claim is NonRootClaim {
  return claim.parentClaimId !== null;
}
