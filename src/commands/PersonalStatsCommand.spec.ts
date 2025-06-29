import {
  Client,
  Guild,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { claimHelpers } from "../claim/Claim";
import { ClaimGameBot } from "../ClaimGameBot";
import { add } from "../guildSettings/GuildSettingsCache";
import { createMockTextChannel } from "../test/discord-mocks/Channel.mock";
import { createMockClient } from "../test/discord-mocks/Client.mock";
import { createMockGuild } from "../test/discord-mocks/Guild.mock";
import { createMockUser } from "../test/discord-mocks/User.mock";
import { createMockCommandMessage } from "../test/discordHelpers";

describe("command:mystats", () => {
  let mockClient: MockedObjectDeep<Client>;
  let mockGuild: MockedObjectDeep<Guild>;
  let mockClaimChannel: MockedObjectDeep<TextChannel>;
  let mockFulfillmentChannel: MockedObjectDeep<TextChannel>;
  let bot: ClaimGameBot;

  beforeEach(async () => {
    jest.spyOn(claimHelpers, "createClaimEmbed").mockResolvedValue({} as any);

    mockClient = createMockClient();
    mockGuild = createMockGuild(mockClient);
    mockClaimChannel = createMockTextChannel(mockGuild);
    mockFulfillmentChannel = createMockTextChannel(mockGuild);
    bot = new ClaimGameBot(mockClient);

    add({
      guildId: mockGuild.id,
      claimChannelId: mockClaimChannel.id,
      fulfillmentChannelId: mockFulfillmentChannel.id,
    });

    await bot.start();
    await bot.handleClientReady();
  });

  afterEach(async () => {
    await bot.stop();
  });

  it("shows message for user with no claims", async () => {
    const user = createMockUser(mockClient);
    
    const msg = await createMockCommandMessage(
      "mystats",
      mockClient,
      mockClaimChannel
    );
    msg.author = user as any;

    jest.spyOn(msg, "reply").mockImplementation(async (...args: any[]) => {
      return null as any;
    });

    await bot.handleMessage(msg);
    expect(msg.reply).toHaveBeenCalled();
    const embed: MessageEmbed = msg.reply.mock.calls[0][0];
    
    expect(embed.description).toContain("You haven't made any claims yet!");
  });

  it("shows personal stats for user with claims", async () => {
    jest.spyOn(mockGuild.members, "resolve").mockImplementation((user: any) => {
      return user as any;
    });

    const user = createMockUser(mockClient);
    const helperUser = createMockUser(mockClient);

    // Make 3 claims as the user
    for (let i = 0; i < 3; i++) {
      const claimMsg = await createMockCommandMessage(
        "claim claim",
        mockClient,
        mockClaimChannel
      );
      claimMsg.author = user as any;
      jest.spyOn(claimMsg, "reply").mockResolvedValue(null as any);
      await bot.handleMessage(claimMsg);

      if (i < 2) {
        // Fulfill previous claim to allow next one
        const fulfillMsg = await createMockCommandMessage(
          `<@${user.id}> https://example.com`,
          mockClient,
          mockFulfillmentChannel
        );
        fulfillMsg.author = helperUser as any;
        fulfillMsg.mentions.members?.set(user.id, {
          ...user,
          user: user,
        } as any);
        jest.spyOn(fulfillMsg, "reply").mockResolvedValue(fulfillMsg);
        jest.spyOn(fulfillMsg, "awaitReactions").mockResolvedValue({ size: 0 } as any);
        
        await bot.handleMessage(fulfillMsg);
      }
    }

    // Check personal stats
    const statsMsg = await createMockCommandMessage(
      "mystats",
      mockClient,
      mockClaimChannel
    );
    statsMsg.author = user as any;

    jest.spyOn(statsMsg, "reply").mockImplementation(async (...args: any[]) => {
      return null as any;
    });

    await bot.handleMessage(statsMsg);
    expect(statsMsg.reply).toHaveBeenCalled();
    const embed: MessageEmbed = statsMsg.reply.mock.calls[0][0];
    
    expect(embed.description).toContain("You have made **3** claims");
    expect(embed.description).toContain("You started playing");
  });
});