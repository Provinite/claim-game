import { Knex } from "knex";
import { GuildSettings } from "./GuildSettings";
import { queryBuilder } from "../db/queryBuilder";
import { add } from "./GuildSettingsCache";

function guildSettings<
  T = GuildSettings,
  U = GuildSettings
>(): Knex.QueryBuilder<T, U> {
  return queryBuilder("guildSettings");
}

export function getGuildSettings(data: { guildId: string }) {
  return guildSettings()
    .select("*")
    .where(data)
    .first()
    .then((guildSettings) => {
      if (guildSettings) {
        add(guildSettings);
      }
      return guildSettings;
    });
}

export function getAllGuildSettings() {
  return guildSettings<GuildSettings[]>()
    .select("*")
    .then((allSettings) => {
      allSettings.forEach(add);
      return allSettings;
    });
}

export function createGuildSettings(
  data: Partial<GuildSettings>
): Promise<GuildSettings> {
  return guildSettings()
    .insert({
      ...data,
    })
    .returning("*")
    .then((guildSettings) => {
      const newSettings = guildSettings[0];
      add(newSettings);
      return newSettings;
    });
}

export function updateGuildSettingsById(
  guildId: string,
  data: Partial<GuildSettings>
): Promise<GuildSettings> {
  return guildSettings()
    .where({ guildId })
    .update(data)
    .returning("*")
    .then(([f]) => {
      if (!f) {
        throw new Error("Error updating guild settings. Settings not found.");
      }
      add(f);
      return f;
    });
}
