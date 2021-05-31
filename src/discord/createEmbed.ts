import { MessageEmbed } from "discord.js";

export function createEmbed() {
  return new MessageEmbed()
    .setColor("#5E63A7")
    .setAuthor(
      "Prov",
      "https://avatars.githubusercontent.com/u/13734094?s=400&u=09327218ed4a22862c6d1ce9e68116f7a26d5ada&v=4",
      "https://github.com/provinite"
    );
}
