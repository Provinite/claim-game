import { queryBuilder } from "../db/queryBuilder";
import { Claim } from "./Claim";

export function insertClaim(data: Claim) {
  return queryBuilder()("claims").insert(data);
}
