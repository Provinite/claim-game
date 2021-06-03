import { Client, SnowflakeUtil, User } from "discord.js";
import { mocked } from "ts-jest/utils";

export function createMockUser(client: Client) {
  const result = mocked(new User(client, {}));
  result.bot = false;
  result.id = SnowflakeUtil.generate();
  return result;
}
