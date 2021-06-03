import {
  Client,
  DMChannel,
  Message,
  MessageOptions,
  SnowflakeUtil,
  TextChannel,
} from "discord.js";
import { MockedObjectDeep } from "ts-jest/dist/utils/testing";
import { mocked } from "ts-jest/utils";
import { createMockTextChannel } from "./Channel.mock";
import { createMockClient } from "./Client.mock";
import { createMockGuild } from "./Guild.mock";
export function createMockMessage(
  data: MessageOptions,
  client: Client = createMockClient(),
  channel: TextChannel | DMChannel = createMockTextChannel(
    createMockGuild(client)
  )
): MockedObjectDeep<Message> {
  const result = mocked(
    new Message(client, { id: SnowflakeUtil.generate(), ...data }, channel),
    true
  );
  jest.spyOn(result, "reply").mockResolvedValue(null as any);

  return result;
}
