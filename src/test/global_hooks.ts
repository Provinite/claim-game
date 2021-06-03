import { queryBuilder, resetConnection } from "../db/queryBuilder";
import { resetDb } from "./dbUtils";

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await queryBuilder().destroy();
});
