import { Client, Message } from "discord.js";

export const awaitNextMessage = (
  client: Client,
  filter: (msg: Message) => boolean
) => {
  return new Promise<Message>((res, rej) => {
    const listener = (msg: Message) => {
      if (filter(msg)) {
        client.removeListener("message", listener);
        res(msg);
      }
    };
    client.on("message", listener);
  });
};
