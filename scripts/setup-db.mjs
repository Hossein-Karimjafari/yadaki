import { Client } from "pg";

const ADMIN_URL =
  process.env.PG_ADMIN_URL ?? "postgresql://postgres@127.0.0.1:5432/postgres";
const DB_NAME = process.env.PG_DB_NAME ?? "yadaki";

async function main() {
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();

  const roleRes = await admin.query(
    "SELECT 1 FROM pg_roles WHERE rolname = $1",
    [DB_NAME]
  );
  if (roleRes.rowCount === 0) {
    await admin.query(`CREATE ROLE ${DB_NAME} LOGIN PASSWORD 'yadaki_local'`);
    console.log(`role ${DB_NAME} created`);
  } else {
    console.log(`role ${DB_NAME} exists`);
  }

  const dbRes = await admin.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_NAME]
  );
  if (dbRes.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${DB_NAME} OWNER ${DB_NAME}`);
    console.log(`database ${DB_NAME} created`);
  } else {
    console.log(`database ${DB_NAME} exists`);
  }

  await admin.end();

  const db = new Client({
    connectionString: `postgresql://${DB_NAME}:yadaki_local@127.0.0.1:5432/${DB_NAME}`,
  });
  await db.connect();
  const v = await db.query("SELECT version()");
  console.log("connected:", v.rows[0].version.slice(0, 40));
  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
