import { Client, Guild, SnowflakeUtil, TextChannel, User } from "discord.js";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { claimHelpers } from "../claim/Claim";
import { ClaimGameBot } from "../ClaimGameBot";
import { queryBuilder } from "../db/queryBuilder";
import { add, resetCache } from "../guildSettings/GuildSettingsCache";
import { createMockTextChannel } from "../test/discord-mocks/Channel.mock";
import { createMockClient } from "../test/discord-mocks/Client.mock";
import { createMockGuild } from "../test/discord-mocks/Guild.mock";
import { createMockUser } from "../test/discord-mocks/User.mock";
import { createMockCommandMessage } from "../test/discordHelpers";

describe("command:Claim", () => {
  let mockClient: MockedObjectDeep<Client>;
  let mockGuild: MockedObjectDeep<Guild>;
  let mockClaimChannel: MockedObjectDeep<TextChannel>;
  let bot: ClaimGameBot;
  beforeEach(async () => {
    jest.spyOn(claimHelpers, "createClaimEmbed").mockResolvedValue({} as any);

    mockClient = createMockClient();
    mockGuild = createMockGuild(mockClient);
    mockClaimChannel = createMockTextChannel(mockGuild);
    bot = new ClaimGameBot(mockClient);
    add({
      guildId: mockGuild.id,
      claimChannelId: mockClaimChannel.id,
      fulfillmentChannelId: "1",
    });

    await bot.start();
    mockClient.emit("ready");
  });
  afterEach(async () => {
    await bot.stop();
    resetCache({});
  });
  it("creates a root claim", async () => {
    const msg = await createMockCommandMessage(
      "claim this my claim bro! www.somereference.website/image.jpg",
      mockClient,
      mockClaimChannel
    );

    jest.spyOn(msg, "reply").mockResolvedValue(null as any);

    msg.author = {
      bot: false,
      id: SnowflakeUtil.generate(),
    } as any;

    await bot.handleMessage(msg);

    const claim = await queryBuilder()("claims")
      .select("*")
      .orderBy("createDate", "desc")
      .first();

    expect(claim).toMatchObject({
      claimantId: msg.author.id,
      claimMessageId: msg.id,
      claimMessageChannelId: mockClaimChannel.id,
      fulfilled: true,
      benefactorId: null,
      parentClaimId: null,
    });
  });
  it("creates a non-root claim", async () => {
    const msg = await createMockCommandMessage(
      "claim this my claim bro! www.somereference.website/image.jpg",
      mockClient,
      mockClaimChannel
    );

    const msg2 = await createMockCommandMessage(
      "claim this is a new claim!",
      mockClient,
      mockClaimChannel
    );

    jest.spyOn(msg, "reply").mockResolvedValue(null as any);

    msg.author = {
      bot: false,
      id: SnowflakeUtil.generate(),
    } as any;

    await bot.handleMessage(msg);
    const firstClaim = await queryBuilder()("claims")
      .select("*")
      .orderBy("createDate", "desc")
      .first();

    msg.author.id = SnowflakeUtil.generate();
    await bot.handleMessage(msg);

    const claim = await queryBuilder()("claims")
      .select("*")
      .orderBy("createDate", "desc")
      .first();

    expect(claim).toMatchObject({
      claimantId: msg.author.id,
      claimMessageId: msg.id,
      claimMessageChannelId: mockClaimChannel.id,
      fulfilled: false,
      benefactorId: firstClaim.claimantId,
      parentClaimId: firstClaim.id,
    });
  });
  it("does not allow you to claim twice in a row", async () => {
    const msg = await createMockCommandMessage(
      "claim this my claim bro! www.somereference.website/image.jpg",
      mockClient,
      mockClaimChannel
    );

    const msg2 = await createMockCommandMessage(
      "claim this is a new claim!",
      mockClient,
      mockClaimChannel
    );

    jest.spyOn(msg, "reply").mockResolvedValue(null as any);

    msg.author = {
      bot: false,
      id: SnowflakeUtil.generate(),
    } as any;

    await bot.handleMessage(msg);

    msg.reply.mockClear();
    await bot.handleMessage(msg);

    expect(msg.reply.mock.calls[0][0].content).toMatchInlineSnapshot(
      `"Whoops, you created the last claim. Someone else needs to claim your reference first."`
    );
    await expect(queryBuilder()("claims").count("id")).resolves.toEqual([
      { count: "1" },
    ]);
  });
  it("does not allow you to claim if you already have an open claim", async () => {
    const mockUser = createMockUser(mockClient);
    const mockUser2 = createMockUser(mockClient);
    const mockUser3 = createMockUser(mockClient);

    const claimMessage = await createMockCommandMessage(
      "claim 1",
      mockClient,
      mockClaimChannel
    );
    claimMessage.author = mockUser as any;

    const claimMessage2 = await createMockCommandMessage(
      "claim 2",
      mockClient,
      mockClaimChannel
    );
    claimMessage2.author = mockUser2 as any;

    const claimMessage3 = await createMockCommandMessage(
      "claim 3",
      mockClient,
      mockClaimChannel
    );
    claimMessage3.author = mockUser3 as any;

    const claimMessage4 = await createMockCommandMessage(
      "claim 4",
      mockClient,
      mockClaimChannel
    );
    claimMessage4.author = mockUser2 as any;

    await bot.handleMessage(claimMessage);
    await bot.handleMessage(claimMessage2);
    await bot.handleMessage(claimMessage3);

    jest
      .spyOn(claimHelpers, "createClaimEmbed")
      .mockResolvedValue({} as any)
      .mockClear();
    await bot.handleMessage(claimMessage4);
    await expect(queryBuilder()("claims").count("id")).resolves.toEqual([
      { count: "3" },
    ]);
    expect(claimMessage4.reply.mock.calls[0][0].content).toMatchInlineSnapshot(
      `"You already have an outstanding claim."`
    );
    expect(claimHelpers.createClaimEmbed).toHaveBeenCalledTimes(1);
  });
  it("does allow you to claim if you have an open claim in another guild", async () => {
    const mockGuild2 = createMockGuild(mockClient);
    const mockClaimChannel2 = createMockTextChannel(mockGuild2);

    add({
      guildId: mockGuild2.id,
      claimChannelId: mockClaimChannel2.id,
      fulfillmentChannelId: SnowflakeUtil.generate(),
    });

    const mockUser = createMockUser(mockClient);
    const mockUser2 = createMockUser(mockClient);
    const mockUser3 = createMockUser(mockClient);

    const claimMessage = await createMockCommandMessage(
      "claim 1",
      mockClient,
      mockClaimChannel
    );
    claimMessage.author = mockUser as any;

    const claimMessage2 = await createMockCommandMessage(
      "claim 2",
      mockClient,
      mockClaimChannel
    );
    claimMessage2.author = mockUser2 as any;

    const claimMessage3 = await createMockCommandMessage(
      "claim 3",
      mockClient,
      mockClaimChannel
    );
    claimMessage3.author = mockUser3 as any;

    // claim in a new guild
    const claimMessage4 = await createMockCommandMessage(
      "claim 1 on server 2",
      mockClient,
      mockClaimChannel2
    );
    claimMessage4.author = mockUser2 as any;

    await bot.handleMessage(claimMessage);
    await bot.handleMessage(claimMessage2);
    await bot.handleMessage(claimMessage3);
    await bot.handleMessage(claimMessage4);

    jest
      .spyOn(claimHelpers, "createClaimEmbed")
      .mockResolvedValue({} as any)
      .mockClear();
    await bot.handleMessage(claimMessage4);
    await expect(queryBuilder()("claims").count("id")).resolves.toEqual([
      { count: "4" },
    ]);
    expect(claimHelpers.createClaimEmbed).toHaveBeenCalledTimes(1);
  });
  it("ignores claims outside the claim channel", async () => {
    const mockUser = createMockUser(mockClient);
    const mockNonClaimChannel = await createMockTextChannel(mockGuild);
    const claimMessage = await createMockCommandMessage(
      "claim 1",
      mockClient,
      mockNonClaimChannel
    );
    claimMessage.author = mockUser as any;

    await bot.handleMessage(claimMessage);

    expect(claimMessage.reply).not.toHaveBeenCalled();
    await expect(queryBuilder()("claims").count("id")).resolves.toEqual([
      { count: "0" },
    ]);
  });
});
