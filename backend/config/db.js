import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { localQuery } from './localDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'med_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let isMysqlAvailable = false;
let checkDone = false;

// Probe MySQL connection on startup
(async () => {
  try {
    const conn = await mysqlPool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    isMysqlAvailable = true;
    console.log('[Database] Connected successfully to MySQL (med_tracker) on localhost:3306.');
  } catch (err) {
    isMysqlAvailable = false;
    console.log('[Database] MySQL server not reachable on localhost:3306 (ECONNREFUSED).');
    console.log('[Database] Seamlessly activated local embedded database with pre-seeded demo accounts!');
  } finally {
    checkDone = true;
  }
})();

const pool = {
  query: async (sql, params) => {
    if (isMysqlAvailable) {
      try {
        return await mysqlPool.query(sql, params);
      } catch (err) {
        // If MySQL dropped mid-session, fallback
        if (err.code === 'ECONNREFUSED') {
          isMysqlAvailable = false;
          console.warn('[Database] MySQL connection dropped. Falling back to local embedded database.');
          return await localQuery(sql, params);
        }
        throw err;
      }
    }
    return await localQuery(sql, params);
  },
  execute: async (sql, params) => {
    return await pool.query(sql, params);
  },
  getConnection: async () => {
    if (isMysqlAvailable) {
      return await mysqlPool.getConnection();
    }
    return {
      query: (sql, params) => localQuery(sql, params),
      release: () => {},
    };
  }
};

export default pool;
