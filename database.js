import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';

let dbInstance = null;

// Open or reuse database connection
export const getDatabase = async () => {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('projahnmo.db');
  }
  return dbInstance;
};

// Initialize database with tables
export const initDatabase = async () => {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_logged_in INTEGER DEFAULT 0
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS form_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      womanName TEXT, husbandName TEXT, district TEXT, upazila TEXT, village TEXT, landmark TEXT,
      dateOfCollection TEXT, timeOfCollection TEXT,
      hospitalAdmissionDate TEXT, hospitalAdmissionTime TEXT,
      hospitalRegistrationNumber TEXT, lmpDate TEXT, lmpDate1 TEXT,
      usgAvailable TEXT, usgDate TEXT, modeOfDelivery TEXT,
      deliveryDate TEXT, outcome TEXT, birthOrder1 TEXT, birthOrder2 TEXT, deliveryTime1 TEXT,
      isSex TEXT, isDiagnosed TEXT, isDiagnosed1 TEXT, isPerinatal TEXT,
      isAdmitted TEXT, isConvulsion TEXT, isConvulsion1 TEXT,
      isVentilator TEXT, isVentilator1 TEXT, paramedicName TEXT,
      somchChecked TEXT, swmchChecked TEXT, somchChecked1 TEXT, swmchChecked1 TEXT,
      mobile1 TEXT, mobile2 TEXT, mobile3 TEXT, endInterviewTime TEXT, endInterviewTime1 TEXT, endInterviewTime2 TEXT, endInterviewTime3 TEXT, endInterviewTime4 TEXT,
    );
  `);
};

// Register new user
export const registerUser = async (email, password) => {
  if (!email.trim() || !password.trim()) {
    return { success: false, message: 'Email and password are required.' };
  }

  const db = await getDatabase();
  try {
    await db.runAsync(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, password]
    );
    return { success: true };
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return { success: false, message: 'Email already exists' };
    }
    return { success: false, message: error.message };
  }
};

// Login existing user
export const loginUser = async (email, password) => {
  if (!email.trim() || !password.trim()) {
    return { success: false, message: 'Email and password are required.' };
  }

  const db = await getDatabase();
  try {
    const result = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    return result ? { success: true } : { success: false, message: 'Invalid credentials' };
  } catch (error) {
    return { success: false, message: error.message || 'Login failed' };
  }
};

// Logout current user
export const logoutUser = async () => {
  const db = await getDatabase();
  await db.runAsync('UPDATE users SET is_logged_in = 0');
};

// Insert form data with validation
export const insertFormData = async (formData) => {
  const db = await getDatabase();

  const email = formData.email?.trim().toLowerCase();
  const password = formData.password?.trim();

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    await db.runAsync(`
      INSERT INTO form_data (
        email, password, womanName, husbandName, district, upazila, village, landmark,
        dateOfCollection, timeOfCollection, hospitalAdmissionDate, hospitalAdmissionTime,
        hospitalRegistrationNumber, lmpDate, lmpDate1, usgAvailable, usgDate,
        modeOfDelivery, deliveryDate, outcome, birthOrder1, birthOrder2, deliveryTime1,
        isSex, isDiagnosed, isDiagnosed1, isPerinatal, isAdmitted, isConvulsion,
        isConvulsion1, isVentilator, isVentilator1, paramedicName,
        somchChecked, swmchChecked, somchChecked1, swmchChecked1,
        mobile1, mobile2, mobile3, endInterviewTime, endInterviewTime1, endInterviewTime2, endInterviewTime3, endInterviewTime4,
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      formData.email || '', formData.password || '', formData.womanName || '', formData.husbandName || '', formData.district || '',
      formData.upazila || '', formData.village || '', formData.landmark || '',
      formData.dateOfCollection || '', formData.timeOfCollection || '',
      formData.hospitalAdmissionDate || '', formData.hospitalAdmissionTime || '',
      formData.hospitalRegistrationNumber || '', formData.lmpDate || '', formData.lmpDate1 || '',
      formData.usgAvailable || '', formData.usgDate || '', formData.modeOfDelivery || '',
      formData.deliveryDate || '', formData.outcome || '', formData.birthOrder1 || '',
      formData.birthOrder2 || '', formData.deliveryTime1 || '', formData.isSex || '',
      formData.isDiagnosed || '', formData.isDiagnosed1 || '', formData.isPerinatal || '',
      formData.isAdmitted || '', formData.isConvulsion || '', formData.isConvulsion1 || '',
      formData.isVentilator || '', formData.isVentilator1 || '', formData.paramedicName || '',
      formData.somchChecked || '', formData.swmchChecked || '', formData.somchChecked1 || '',
      formData.swmchChecked1 || '', formData.mobile1 || '', formData.mobile2 || '',
      formData.mobile3 || '', formData.endInterviewTime || '', formData.endInterviewTime1 || '', formData.endInterviewTime2 || '', formData.endInterviewTime3 || '', formData.endInterviewTime4 || ''
    ]);

    return { success: true };
  } catch (error) {
    console.error('Insert failed:', error.message);
    return { success: false, message: error.message };
  }
};

// Fetch all form data
export const fetchAllFormData = async () => {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM form_data');
};

// Export DB to file and share
export const exportDatabaseToStorage = async () => {
  try {
    const dbFilePath = `${FileSystem.documentDirectory}SQLite/projahnmo.db`;
    const exportFileName = `projahnmo-backup-${Date.now()}.db`;
    const exportPath = `${FileSystem.documentDirectory}${exportFileName}`;

    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    if (!fileInfo.exists) throw new Error('Database file not found');

    await FileSystem.copyAsync({ from: dbFilePath, to: exportPath });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(exportPath, {
        mimeType: 'application/octet-stream',
        dialogTitle: 'Share your database backup',
      });
    }

    return exportPath;
  } catch (error) {
    console.error('Export failed:', error.message);
    throw error;
  }
};
