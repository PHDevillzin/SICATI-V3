import { Sequelize } from "sequelize";
import sqlite3 from "@libsql/sqlite3";

const dbUrl = "libsql://database-vercel-icfg-m3mu6rj4nyfbz3e49l6bfgj9.aws-us-east-1.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQ2MDYxNjEsImlkIjoiZmFmZTgyMWQtZTRmNS00YjRiLWFmNmUtYWNjZWZhNTc0MjA1IiwicmlkIjoiOTBhNjhjNDgtYmRhMy00N2FjLTg2OWQtNmY1MTg2NTk1M2QxIn0.n2e2d-dPp0wPnIS72GIg6c8Un28p_EpZ0rrhV9OiuI0xxNpU5UJVJ21EW9ipxz8Ue6KL2LoMBwidwhpILdkFBw";

const sequelize = new Sequelize({
  dialect: "sqlite",
  dialectModule: sqlite3,
  storage: dbUrl,
  logging: console.log,
});

async function test() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  } finally {
    await sequelize.close();
  }
}

test();
