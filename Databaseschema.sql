-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS med_tracker;
USE med_tracker;

-- Set default storage engine
SET default_storage_engine = INNODB;

-- 1. Users Table
-- Stores login details and role for both Doctors and Patients
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Store hashed passwords (e.g., bcrypt)
    role ENUM('doctor', 'patient') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctor Profiles
-- Stores additional information specific to Doctors
CREATE TABLE IF NOT EXISTS doctor_profiles (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    qualification VARCHAR(255),
    contact_details VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Patient Profiles
-- Stores additional information specific to Patients
CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    sex ENUM('Male', 'Female', 'Other'),
    age INT,
    weight DECIMAL(5, 2), -- e.g., 80.50 kg
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Doctor-Patient Relationship Map
-- Links Doctors to their Patients
CREATE TABLE IF NOT EXISTS doctor_patient_map (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    patient_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensures a patient isn't added to the same doctor twice
    UNIQUE KEY unique_doctor_patient (doctor_id, patient_id)
);

-- 5. Appointments Table
-- Stores details for each patient consultation
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATETIME NOT NULL,
    present_complaint TEXT,
    final_diagnosis TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Medications Table
-- Stores all prescribed medications, linked to an appointment
CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255), -- e.g., "1 tablet, 3 times a day"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

-- 7. Medication Adherence (The Calendar)
-- Tracks each time a patient marks a medication as "taken"
CREATE TABLE IF NOT EXISTS medication_adherence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medication_id INT NOT NULL,
    patient_id INT NOT NULL,
    taken_date DATE NOT NULL,
    
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Prevents logging the same medication twice on the same day
    UNIQUE KEY unique_med_date (medication_id, taken_date)
);

-- 8. Health Tips
-- Stores doctor-provided health tips for a patient
CREATE TABLE IF NOT EXISTS health_tips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    tip_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Lab Reports
-- Stores file paths for uploaded lab reports
CREATE TABLE IF NOT EXISTS lab_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL, -- The user who uploaded the report
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL, -- Path on server or cloud URL
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Reminders / Alarms
-- Stores user-defined reminders
CREATE TABLE IF NOT EXISTS reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The user who SET the reminder (can be doctor or patient)
    patient_id INT NOT NULL, -- The patient the reminder is FOR
    medication_id INT, -- Can be null for general reminders
    reminder_time TIME NOT NULL,
    reminder_message VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL
);


-- 11. Real-Time Patient-Doctor Clinical Chat Messages
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
);
