import {
  Client,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  TextChannel,
  User,
} from "discord.js";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { claimHelpers } from "../claim/Claim";
import { ClaimGameBot } from "../ClaimGameBot";
import { add } from "../guildSettings/GuildSettingsCache";
import { createMockTextChannel } from "../test/discord-mocks/Channel.mock";
import { createMockClient } from "../test/discord-mocks/Client.mock";
import { createMockGuild } from "../test/discord-mocks/Guild.mock";
import { createMockMessage } from "../test/discord-mocks/Message.mock";
import { createMockUser } from "../test/discord-mocks/User.mock";
import { createMockCommandMessage } from "../test/discordHelpers";

describe("command:stats", () => {
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

  it("lists the top 10 contributors in order", async () => {
    // this makes `message.member` work without trying to mock the getter
    jest.spyOn(mockGuild.members, "resolve").mockImplementation((user: any) => {
      return user as any;
    });

    // create n (1..15) claims for each of 15 users
    const users: ReturnType<typeof createMockUser>[] = [];
    const expectedClaims: number[] = [];
    let lastClaimantId: string | null = null;

    const NUM_USERS = 30;

    for (let i = 0; i < NUM_USERS; i++) {
      users.push(createMockUser(mockClient));
      expectedClaims.push(0);
    }

    /**
     * Helper to perform a claim & fulfillment workflow. Performs a claim message and fulfillment message
     *   as the specified user.
     * @param userIndex - The index of the user in the `users` array to claim & fulfill as. May be an array or number (or table of numbers)
     * @returns void
     */
    const doClaim = async (
      userIndex: number | number[] | Array<number | number[]>
    ) => {
      if (Array.isArray(userIndex)) {
        for (const idx of userIndex) {
          await doClaim(idx);
        }
        return;
      }
      const msg = await createMockCommandMessage(
        "claim claim",
        mockClient,
        mockClaimChannel
      );
      msg.author = users[userIndex] as any;
      jest.spyOn(msg, "reply").mockResolvedValue(null as any);
      await bot.handleMessage(msg);
      expectedClaims[userIndex]++;

      if (!lastClaimantId) {
        // set last claimant id, do not fulfill
        lastClaimantId = msg.author.id;
        return;
      }

      // fulfill the claim so that we can make more
      const fulfillMsg = createMockMessage(
        {
          content: `<@${lastClaimantId}> www.google.com`,
        },
        mockClient,
        mockFulfillmentChannel
      );
      fulfillMsg.author = users[userIndex] as any;
      const lastClaimantUser = users.find((u) => u.id === lastClaimantId);
      fulfillMsg.mentions.members?.set(lastClaimantId, {
        ...lastClaimantUser,
        user: lastClaimantUser,
      } as any);

      jest.spyOn(fulfillMsg, "reply").mockResolvedValue(fulfillMsg);

      jest
        .spyOn(fulfillMsg, "awaitReactions")
        .mockResolvedValue({ size: 0 } as any);

      // update last claimant id
      lastClaimantId = msg.author.id;

      await bot.handleMessage(fulfillMsg);
    };

    // first 10 users each do 3 claims in a chain
    for (let i = 0; i < 3; i++) {
      await doClaim([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }

    let chainHelpIdx = 0;
    // get a chain helper (a user to user to chain without disrupting leads)
    const nextChainHelper = () => {
      return 10 + (chainHelpIdx++ % (NUM_USERS - 10));
    };

    for (let userIdx = 0; userIdx < 10; userIdx++) {
      const numClaims = 10 - userIdx;
      for (let claim = 0; claim < numClaims; claim++) {
        await doClaim([userIdx, nextChainHelper()]);
      }
    }

    const msg = await createMockCommandMessage(
      "stats",
      mockClient,
      mockClaimChannel
    );

    jest.spyOn(msg, "reply").mockImplementation(async (...args: any[]) => {
      return null as any;
    });
    await bot.handleMessage(msg);
    expect(msg.reply).toHaveBeenCalled();
    const embed: MessageEmbed = msg.reply.mock.calls[0][0];

    const { fields } = embed;

    // this is kind of useful to visualize what all of the above bs is doing
    expect(
      fields.map((f) => {
        let { value } = f;
        let idx = 0;
        for (const user of users) {
          value = value.replace(user.id, "USER-" + idx);
          idx++;
        }
        return value;
      })
    ).toMatchInlineSnapshot(`
      Array [
        "<@USER-0>, 13 claims. Started playing just now",
        "<@USER-1>, 12 claims. Started playing just now",
        "<@USER-2>, 11 claims. Started playing just now",
        "<@USER-3>, 10 claims. Started playing just now",
        "<@USER-4>, 9 claims. Started playing just now",
        "<@USER-5>, 8 claims. Started playing just now",
        "<@USER-6>, 7 claims. Started playing just now",
        "<@USER-7>, 6 claims. Started playing just now",
        "<@USER-8>, 5 claims. Started playing just now",
        "<@USER-9>, 4 claims. Started playing just now",
      ]
    `);
    expect(fields).toHaveLength(10);
    let idx = 0;
    for (const { value } of fields) {
      expect(value).toEqual(expect.stringContaining(users[idx].id));
      expect(value).toEqual(
        expect.stringContaining(expectedClaims[idx] + " claims")
      );
      idx++;
    }
  });
});
