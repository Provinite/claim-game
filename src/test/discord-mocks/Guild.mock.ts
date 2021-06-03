import { Client, Guild, SnowflakeUtil } from "discord.js";
import { mocked } from "ts-jest/utils";

export function createMockGuild(client: Client) {
  const result = mocked(new Guild(client, {}), true);
  result.id = SnowflakeUtil.generate();
  return result;
}
