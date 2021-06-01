import { Knex } from "knex";

const DISCORD_ID_LENGTH = 128;

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("claims", (table) => {
    table.uuid("id").primary().notNullable();
    table.string("benefactorId", DISCORD_ID_LENGTH).nullable();
    table.string("claimantId", DISCORD_ID_LENGTH).notNullable();
    table.boolean("fulfilled").notNullable();
    table.string("guildId", DISCORD_ID_LENGTH).notNullable();
    table.dateTime("createDate", { useTz: true }).notNullable();
    table.string("claimMessageId", DISCORD_ID_LENGTH).notNullable();
    table.string("claimMessageChannelId", DISCORD_ID_LENGTH).notNullable();
    table.uuid("parentClaimId").nullable();

    table
      .foreign("parentClaimId", "FK_CLAIMS_PARENT_CHILD")
      .references("id")
      .inTable("claims");
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("claims");
}
