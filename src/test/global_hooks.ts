import { queryBuilder } from "../db/queryBuilder";
import { resetDb } from "./dbUtils";

beforeAll(async () => {
  try {
    await resetDb();
  } catch (e) {
    console.error(e);
  }
});

afterAll(async () => {
  await queryBuilder().destroy();
});
