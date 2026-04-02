import sql from "mssql";

const dbConfig: sql.config = {
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "1433"),
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false,
    connectTimeout: 30000, // Increase timeout to 30s
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export const getPool = async (): Promise<sql.ConnectionPool> => {
  if (!pool) {
    pool = await sql.connect(dbConfig);
    console.log("✅ Connected to Azure SQL Server");
  }
  return pool;
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.close();
    pool = null;
    console.log("🔌 SQL Server connection closed");
  }
};

export default { getPool, closePool };
