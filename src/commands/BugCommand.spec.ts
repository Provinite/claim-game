import { Client, SnowflakeUtil } from "discord.js";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { ClaimGameBot } from "../ClaimGameBot";
import { createMockTextChannel } from "../test/discord-mocks/Channel.mock";
import { createMockClient } from "../test/discord-mocks/Client.mock";
import { createMockGuild } from "../test/discord-mocks/Guild.mock";
import { createMockCommandMessage } from "../test/discordHelpers";

describe("command:BugCommand", () => {
  let bot: ClaimGameBot;
  let mockClient: MockedObjectDeep<Client>;
  beforeEach(async () => {
    mockClient = createMockClient();
    mockClient.user = { id: SnowflakeUtil.generate() } as any;

    bot = new ClaimGameBot(mockClient);
    await bot.start();
    mockClient.emit("ready");
  });

  afterEach(async () => await bot.stop());

  it("replies with a link to github issues", async () => {
    if (!mockClient.user) throw new Error("Client needs to be defined");

    const message = createMockCommandMessage(
      "bug",
      mockClient,
      createMockTextChannel(createMockGuild(mockClient))
    );
    message.author = { bot: false } as any;
    jest.spyOn(message, "reply").mockResolvedValue(null as any);

    await bot.handleMessage(message);

    expect(message.reply.mock.calls[0][0]).toMatchSnapshot();
  });
});
