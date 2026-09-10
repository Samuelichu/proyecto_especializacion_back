const mysql = require("mysql2/promise");
const env = require("../config/env");

let pool;
let serverPool;

class DatabaseUnavailableError extends Error {
  constructor(cause) {
    super("No fue posible conectar con la base de datos MySQL.");
    this.name = "DatabaseUnavailableError";
    this.code = "DATABASE_UNAVAILABLE";
    this.status = 500;
    this.expose = true;
    this.cause = cause;
  }
}

function isDatabaseConfigured() {
  const { host, name, user, password } = env.database;
  return Boolean(host && name && user && password);
}

function getPool() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseUnavailableError(
      new Error(
        "Faltan las variables DB_HOST, DB_NAME, DB_USER o DB_PASSWORD.",
      ),
    );
  }

  if (!pool) {
    pool = mysql.createPool({
      host: env.database.host,
      port: env.database.port,
      database: env.database.name,
      user: env.database.user,
      password: env.database.password,
      waitForConnections: true,
      connectionLimit: env.database.connectionLimit,
      queueLimit: 0,
      connectTimeout: 5000,
      ...(env.database.ssl ? { ssl: { rejectUnauthorized: true } } : {}),
    });
  }

  return pool;
}

function getServerPool() {
  if (!isDatabaseConfigured()) {
    throw new DatabaseUnavailableError(
      new Error(
        "Faltan las variables DB_HOST, DB_NAME, DB_USER o DB_PASSWORD.",
      ),
    );
  }

  if (!serverPool) {
    serverPool = mysql.createPool({
      host: env.database.host,
      port: env.database.port,
      user: env.database.user,
      password: env.database.password,
      waitForConnections: true,
      connectionLimit: env.database.connectionLimit,
      queueLimit: 0,
      connectTimeout: 5000,
      ...(env.database.ssl ? { ssl: { rejectUnauthorized: true } } : {}),
    });
  }

  return serverPool;
}

function asDatabaseError(error) {
  if (error instanceof DatabaseUnavailableError) return error;
  return new DatabaseUnavailableError(error);
}

async function execute(sql, params = []) {
  try {
    return await getPool().execute(sql, params);
  } catch (error) {
    console.error("DATABASE ERROR:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });

    throw asDatabaseError(error);
  }
}

async function ensureDatabase() {
  try {
    const databaseName = mysql.escapeId(env.database.name);
    await getServerPool().query(
      `CREATE DATABASE IF NOT EXISTS ${databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } catch (error) {
    throw asDatabaseError(error);
  }
}

async function checkConnection() {
  let connection;

  try {
    connection = await getPool().getConnection();
    await connection.ping();
  } catch (error) {
    throw asDatabaseError(error);
  } finally {
    connection?.release();
  }
}

module.exports = {
  checkConnection,
  ensureDatabase,
  execute,
  isDatabaseConfigured,
};
