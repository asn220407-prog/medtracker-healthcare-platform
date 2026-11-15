import pool from '../config/db.js';

async function setupChatTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        sender_id INT NOT NULL,
        sender_role ENUM('doctor', 'patient') NOT NULL,
        sender_name VARCHAR(100),
        message_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('Messages table initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error creating messages table:', err);
    process.exit(1);
  }
}

setupChatTable();
