import { Client, SnowflakeUtil } from "discord.js";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { mocked } from "ts-jest/utils";
export function createMockClient(): MockedObjectDeep<Client> {
  // restsweepinterval is here to prevent discord.js from holding up the event queue
  const client = new Client({ restSweepInterval: 0 });
  client.user = { id: SnowflakeUtil.generate(), setPresence: jest.fn() } as any;
  jest.spyOn(client, "login").mockImplementation();

  return mocked(client, true);
}
