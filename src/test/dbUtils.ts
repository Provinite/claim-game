import { queryBuilder, resetConnection } from "../db/queryBuilder";

export async function resetDb() {
  await queryBuilder().schema.dropTableIfExists("guildSettings");
  await queryBuilder().schema.dropTableIfExists("claims");
  await queryBuilder().schema.dropTableIfExists("migrations");
  await queryBuilder().schema.dropTableIfExists("migrations_lock");
  await queryBuilder().migrate.latest();
}
