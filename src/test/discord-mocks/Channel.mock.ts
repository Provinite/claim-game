import { Guild, SnowflakeUtil, TextChannel } from "discord.js";
import { mocked, MockedObjectDeep } from "ts-jest/dist/utils/testing";

export function createMockTextChannel(
  guild: Guild
): MockedObjectDeep<TextChannel> {
  const result = mocked(new TextChannel(guild, { type: "text" }), true);
  result.type = "text";
  result.id = SnowflakeUtil.generate();
  return result;
}
