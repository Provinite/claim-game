import { Knex } from "knex";
import { queryBuilder } from "../db/queryBuilder";
import { v4 } from "uuid";
import { Claim } from "./Claim";
import { Message } from "discord.js";

export const claimService = {
  getOutstandingClaims,
  getClaims,
  createClaim,
  deleteClaims,
  getLatestClaim,
  fulfillClaim,
  revertClaimFulfillment,
};

function getOutstandingClaims(userId: string) {
  return claims().select<Claim[]>("*").where({
    claimantId: userId,
    fulfilled: false,
  });
}

function getClaims(data: Partial<Claim>): Promise<Claim[]> {
  return claims()
    .select<Claim[]>("*")
    .where({ ...data });
}

function createClaim(data: Partial<Claim>): Promise<Claim> {
  return claims()
    .insert({
      id: v4(),
      fulfilled: false,
      createDate: new Date(),
      ...data,
    })
    .returning("*")
    .then((claims) => {
      if (!claims.length) {
        throw new Error("Error creating claim.");
      }
      return claims[0];
    });
}

function deleteClaims(deleteWhere: Partial<Claim>) {
  return claims()
    .delete()
    .where({ ...deleteWhere });
}

function getLatestClaim(data: Pick<Claim, "guildId">) {
  return claims().select("*").where(data).orderBy("createDate", "desc").first();
}

function fulfillClaim(
  claimOrClaimId: Claim | Claim["id"],
  msg: Message
): Promise<Claim> {
  const claimId =
    typeof claimOrClaimId === "object" ? claimOrClaimId.id : claimOrClaimId;
  return claims().where({ id: claimId }).update({
    fulfilled: true,
    fulfillmentMessageChannelId: msg.channel.id,
    fulfillmentMessageId: msg.id,
  });
}

function revertClaimFulfillment(
  claimOrClaimId: Claim | Claim["id"]
): Promise<Claim> {
  const claimId =
    typeof claimOrClaimId === "object" ? claimOrClaimId.id : claimOrClaimId;
  return claims()
    .where({ id: claimId })
    .update({
      fulfilled: false,
      fulfillmentMessageId: null,
      fulfillmentMessageChannelId: null,
    });
}

function claims(): Knex.QueryBuilder<Claim> {
  return queryBuilder()("claims");
}
