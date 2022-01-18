import {
  Client,
  Guild,
  Message,
  NewsChannel,
  TextChannel,
  User,
} from "discord.js";
import { Claim, NonRootClaim } from "./Claim";
import { claimService } from "./ClaimService";

export async function getBenefactor(
  client: Client,
  claim: NonRootClaim
): Promise<User | null> {
  return (
    client.users.cache.get(claim.benefactorId) ||
    (await client.users.fetch(claim.benefactorId)) ||
    null
  );
}

export async function getGuild(client: Client, claim: Claim): Promise<Guild> {
  return (
    client.guilds.cache.get(claim.guildId) || client.guilds.fetch(claim.guildId)
  );
}

export async function getClaimMessage(
  client: Client,
  claim: Claim,
  guild?: Guild,
  channel?: TextChannel | NewsChannel
): Promise<Message | null> {
  try {
    guild = guild || (await getGuild(client, claim));
    const targetChannel =
      channel || (await getClaimMessageChannel(client, claim, guild));
    if (!targetChannel) {
      return null;
    }
    return (
      targetChannel.messages.cache.get(claim.claimMessageId) ||
      (await targetChannel.messages.fetch(claim.claimMessageId))
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getClaimMessageChannel(
  client: Client,
  claim: Claim,
  guild?: Guild
): Promise<TextChannel | NewsChannel | null> {
  try {
    guild = guild || (await getGuild(client, claim));
    const result = guild.channels.cache.get(claim.claimMessageChannelId);
    if (!result) {
      return null;
    }
    if (!result.isText()) {
      throw new Error(
        "Claim channel isn't a text channel. Claim id: " + claim.id
      );
    }
    return result;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getParentClaim(claim: NonRootClaim): Promise<Claim> {
  return claimService.getClaims({ id: claim.parentClaimId }).then(([c]) => c);
}

export async function getClaimant(
  claim: Claim,
  client: Client
): Promise<User | null> {
  try {
    return (
      client.users.cache.get(claim.claimantId) ||
      (await client.users.fetch(claim.claimantId))
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}
