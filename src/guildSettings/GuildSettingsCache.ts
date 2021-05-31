import { GuildSettings } from "./GuildSettings";

const cache: Record<string, GuildSettings> = {};

export function getGuildSettings(): GuildSettings[];
export function getGuildSettings(guildId: string): GuildSettings | undefined;
export function getGuildSettings(
  guildId?: string
): GuildSettings | GuildSettings[] | undefined {
  if (guildId === undefined) {
    return Array.from(Object.values(cache));
  } else {
    return cache[guildId];
  }
}

export function add(settings: GuildSettings) {
  cache[settings.guildId] = settings;
}
