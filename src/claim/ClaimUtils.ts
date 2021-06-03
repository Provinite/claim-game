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

export async function getBenefactor(client: Client, claim: NonRootClaim) {
  return (
    client.users.cache.get(claim.benefactorId) ||
    client.users.fetch(claim.benefactorId)
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
): Promise<Message> {
  guild = guild || (await getGuild(client, claim));
  channel = channel || (await getClaimMessageChannel(client, claim, guild));
  return (
    channel.messages.cache.get(claim.claimMessageId) ||
    channel.messages.fetch(claim.claimMessageId)
  );
}

export async function getClaimMessageChannel(
  client: Client,
  claim: Claim,
  guild?: Guild
): Promise<TextChannel | NewsChannel> {
  guild = guild || (await getGuild(client, claim));
  const result = guild.channels.cache.get(claim.claimMessageChannelId);
  if (!result) {
    throw new Error("Claim channel not found, claim id: " + claim.id);
  }
  if (!result.isText()) {
    throw new Error(
      "Claim channel isn't a text channel. Claim id: " + claim.id
    );
  }
  return result;
}

export async function getParentClaim(claim: NonRootClaim): Promise<Claim> {
  return claimService.getClaims({ id: claim.parentClaimId }).then(([c]) => c);
}

export async function getClaimant(claim: Claim, client: Client): Promise<User> {
  return (
    client.users.cache.get(claim.claimantId) ||
    client.users.fetch(claim.claimantId)
  );
}
