import { MockedObject } from "ts-jest/dist/utils/testing";
import { ClaimGameBot } from "./ClaimGameBot";
import { createMockClient } from "./test/discord-mocks/Client.mock";
import { mocked } from "ts-jest/utils";
import { version } from "../package.json";

describe("class:ClaimGameBot", () => {
  let bot: MockedObject<ClaimGameBot>;
  let mockClient: ReturnType<typeof createMockClient>;
  beforeEach(() => {
    mockClient = createMockClient();
    bot = mocked(new ClaimGameBot(mockClient));
  });
  describe("method:handleBotReady", () => {
    it("updates the client bot's presence info", async () => {
      await bot.handleClientReady();
      expect(mockClient.user?.setPresence).toHaveBeenCalled();
      const presenceObject = mockClient.user?.setPresence.mock.calls[0][0];
      expect(presenceObject?.status).toEqual("online");
      expect(presenceObject?.activity?.name).toEqual(`Claim Game v${version}`);
    });
  });
});
