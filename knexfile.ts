const connectionString =
  process.env.cc_claim_game_db_url || process.env.DATABASE_URL;

const useSsl = process.env.cc_claim_game_db_use_ssl === "false" ? false : true;

export default {
  client: "pg",
  connection: {
    connectionString: connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  },
  searchPath: ["public"],
  migrations: {
    directory: "./migrations",
    tableName: "migrations",
  },
};
