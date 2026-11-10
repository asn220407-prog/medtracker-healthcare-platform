
-- -- This file contains SQL statements to add dummy contact details to existing doctors.
-- -- Please execute these statements on your database to ensure data consistency.

-- -- Update doctor with user_id = 1
-- UPDATE doctor_profiles
-- SET contact_details = '123-456-7890'
-- WHERE user_id = 1 AND (contact_details IS NULL OR contact_details = '');

-- -- Update doctor with user_id = 2
-- UPDATE doctor_profiles
-- SET contact_details = '098-765-4321'
-- WHERE user_id = 5 AND (contact_details IS NULL OR contact_details = '');

-- -- Add more update statements for other doctors as needed.

-- UPDATE doctor_profiles
-- SET contact_details = '098-765-4321'
-- WHERE user_id = 12 AND (contact_details IS NULL OR contact_details = '');


