import { Client } from "discord.js";
import { ClaimGameBot } from "./ClaimGameBot";

const main = async () => {
  const client = new Client();
  const bot = new ClaimGameBot(client);
  await bot.start();
};

main();
