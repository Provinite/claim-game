import { Claim } from "./Claim";
import { v4 } from "uuid";
function getDefaultClaim() {
  const result: Claim = {
    benefactorId: v4(),
    claimMessageChannelId: v4(),
    claimantId: v4(),
    claimMessageId: v4(),
    createDate: new Date(),
    fulfilled: false,
    guildId: v4(),
    id: v4(),
    parentClaimId: v4(),
    fulfillmentMessageChannelId: null,
    fulfillmentMessageId: null,
  };
  return result;
}

export const createMockClaim = (data: Partial<Claim> = {}) => ({
  ...getDefaultClaim(),
  ...data,
});
