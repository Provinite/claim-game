import { Client, DMChannel, Message, TextChannel } from "discord.js";
import { mocked } from "ts-jest/utils";
import { createMockMessage } from "./discord-mocks/Message.mock";

export function createMockCommandMessage(
  content: string,
  client: Client,
  channel: TextChannel | DMChannel
) {
  const message = createMockMessage(
    {
      content: `<@${client.user!.id}> ${content}`,
    },
    client,
    channel
  );
  message.author = client.user as any;
  return mocked(message, true);
}
