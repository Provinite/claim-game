import knex from "knex";
import knexConfig from "../../knexfile";

export const queryBuilder = knex(knexConfig);
