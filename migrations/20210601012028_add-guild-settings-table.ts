import { Knex } from "knex";

const DISCORD_ID_LENGTH = 128;

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("guildSettings", (table) => {
    table.string("guildId", DISCORD_ID_LENGTH).primary().notNullable();
    table.string("claimChannelId", DISCORD_ID_LENGTH).notNullable();
    table.string("fulfillmentChannelId", DISCORD_ID_LENGTH).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("guildSettings");
}
