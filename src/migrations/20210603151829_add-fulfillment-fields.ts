import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("claims", (table) => {
    table.string("fulfillmentMessageChannelId", 128).nullable().defaultTo(null);
    table.string("fulfillmentMessageId", 128).nullable().defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("claims", (table) => {
    table.dropColumns("fulfillmentMessageChannelId", "fulfillmentMessageId");
  });
}
