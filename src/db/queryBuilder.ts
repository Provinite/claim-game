import knex, { Knex } from "knex";
import knexConfig from "../../knexfile";

let connection: Knex<any, any> | undefined;
export const queryBuilder = <T = any, R = unknown>() => {
  if (!connection) {
    connection = knex<T, R>(knexConfig);
  }
  return connection;
};
