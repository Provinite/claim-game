import knex from "knex";

const dbUrl = process.env.cc_claim_game_db_url || process.env.DATABASE_URL;
export const queryBuilder = knex({
  client: "pg",
  connection: dbUrl,
  searchPath: ["public"],
});