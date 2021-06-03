import { Claim, NonRootClaim } from "./Claim";
import { getParentClaim } from "./ClaimUtils";
import { createMockClaim } from "./Claim.mock";
import { queryBuilder } from "../db/queryBuilder";
describe("function:getParentClaim", () => {
  it("fetches the parent claims", async () => {
    const mockParentClaim = createMockClaim({
      parentClaimId: null,
      benefactorId: null,
    });
    await queryBuilder<Claim>()("claims").insert(mockParentClaim);

    const mockClaim = createMockClaim({
      parentClaimId: mockParentClaim.id,
      guildId: mockParentClaim.guildId,
      claimMessageChannelId: mockParentClaim.claimMessageChannelId,
      benefactorId: mockParentClaim.claimantId,
    });
    const result = await getParentClaim(mockClaim as NonRootClaim);

    expect(result).toEqual(mockParentClaim);
  });
});
