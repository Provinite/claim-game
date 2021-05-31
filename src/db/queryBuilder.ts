import knex from "knex";

const dbUrl = process.env.cc_claim_game_db_url || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("No database configuration set, exiting.");
}

export const queryBuilder = knex({
  client: "pg",
  connection: { connectionString: dbUrl, ssl: { rejectUnauthorized: false } },
  searchPath: ["public"],
});
