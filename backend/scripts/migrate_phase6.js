import pool from '../config/db.js';

async function migrate() {
  try {
    const labReportsSql = `
      CREATE TABLE IF NOT EXISTS lab_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(1024) NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    const remindersSql = `
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        patient_id INT NOT NULL,
        medication_id INT,
        reminder_time TIME NOT NULL,
        reminder_message VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `;

    await pool.query(labReportsSql);
    console.log('Created lab_reports table');

    await pool.query(remindersSql);
    console.log('Created reminders table');

    const [tables] = await pool.query('SHOW TABLES');
    console.log('Current database tables:', tables.map(t => Object.values(t)[0]));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit();
  }
}

migrate();
