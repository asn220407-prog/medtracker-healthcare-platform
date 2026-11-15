import pool from '../config/db.js';

async function applyPhase1() {
  console.log('--- Applying Phase 1 Database Indexes & HIPAA Audit Schema ---');

  try {
    // 1. Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        actor_id INT NOT NULL,
        actor_role ENUM('doctor', 'patient', 'admin', 'system') NOT NULL,
        patient_id INT NULL,
        action VARCHAR(64) NOT NULL,
        resource_type VARCHAR(64) NOT NULL,
        resource_id INT NULL,
        ip_address VARCHAR(45) NOT NULL,
        user_agent VARCHAR(255) NULL,
        details JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_patient (patient_id, created_at),
        INDEX idx_audit_actor (actor_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[PASS] Created audit_logs table');

    // 2. Helper to add index if not exists
    const addIndexSafe = async (table, indexName, indexCols) => {
      try {
        const [existing] = await pool.query(
          `SHOW INDEX FROM ${table} WHERE Key_name = ?`,
          [indexName]
        );
        if (existing.length === 0) {
          await pool.query(`CREATE INDEX ${indexName} ON ${table}(${indexCols})`);
          console.log(`[PASS] Created index ${indexName} on ${table}`);
        } else {
          console.log(`[INFO] Index ${indexName} on ${table} already exists`);
        }
      } catch (err) {
        console.warn(`[WARN] Could not create index ${indexName}:`, err.message);
      }
    };

    // Composite indexes for clinical queries
    await addIndexSafe('medication_adherence', 'idx_adherence_patient_date', 'patient_id, taken_date');
    await addIndexSafe('appointments', 'idx_appointments_patient_date', 'patient_id, appointment_date DESC');
    await addIndexSafe('reminders', 'idx_reminders_patient_active', 'patient_id, is_active');

    console.log('--- Phase 1 Database Migration Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Phase 1 Migration failed:', err);
    process.exit(1);
  }
}

applyPhase1();
