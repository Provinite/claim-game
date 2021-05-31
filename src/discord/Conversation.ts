import { APIMessageContentResolvable, Channel, Message } from "discord.js";
import { awaitNextMessage } from "./awaitNextMessage";

export class Conversation {
  constructor(private message: Message) {}
  say(msg: APIMessageContentResolvable): Promise<Message> {
    return this.message.channel.send(msg);
  }
  reply(msg: APIMessageContentResolvable): Promise<Message> {
    return this.message.reply(msg);
  }

  async listen(): Promise<Message> {
    return awaitNextMessage(
      this.message.client,
      (m) =>
        m.channel.id === this.message.channel.id &&
        m.author.id === this.message.author.id
    );
  }

  async askForChannel(prompt: APIMessageContentResolvable): Promise<Channel> {
    while (true) {
      await this.say(prompt);
      const response = await this.listen();
      const channelMentions = Array.from(response.mentions.channels);
      if (channelMentions.length) {
        return channelMentions[0][1];
      }
    }
  }
}
