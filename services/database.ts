import * as SQLite from 'expo-sqlite';
import { Diagnosis, DiagnosisLocal } from '../types';

const db = SQLite.openDatabaseSync('agriai.db');

export const initDatabase = async () => {
    try {
        await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        phoneNumber TEXT,
        token TEXT,
        userType TEXT,
        name TEXT,
        email TEXT
      );
      CREATE TABLE IF NOT EXISTS diagnoses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        diagnosisId TEXT,
        crop TEXT,
        disease TEXT,
        confidence REAL,
        advice TEXT,
        imageUri TEXT,
        synced INTEGER DEFAULT 0,
        createdAt TEXT
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
      CREATE TABLE IF NOT EXISTS profiles (
        phoneNumber TEXT PRIMARY KEY,
        userId TEXT,
        token TEXT,
        userType TEXT,
        name TEXT,
        email TEXT
      );
    `);

        // Migration: Add columns if they don't exist (swallowing errors if they do)
        try { await db.execAsync('ALTER TABLE users ADD COLUMN name TEXT;'); } catch (e) { }
        try { await db.execAsync('ALTER TABLE users ADD COLUMN email TEXT;'); } catch (e) { }
        try { await db.execAsync('ALTER TABLE profiles ADD COLUMN name TEXT;'); } catch (e) { }
        try { await db.execAsync('ALTER TABLE profiles ADD COLUMN email TEXT;'); } catch (e) { }

        console.log('Database initialized');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
};

export const saveUserSection = async (userId: string, phoneNumber: string, token: string | null, userType: string, name: string | null = null, email: string | null = null) => {
    // Clear previous user
    await db.runAsync('DELETE FROM users');
    await db.runAsync('INSERT INTO users (userId, phoneNumber, token, userType, name, email) VALUES (?, ?, ?, ?, ?, ?)', userId, phoneNumber, token, userType, name, email);
};

export const getUserSession = async () => {
    return await db.getFirstAsync<{ userId: string, phoneNumber: string, token: string, userType: string, name: string, email: string }>('SELECT * FROM users LIMIT 1');
}

export const clearUserSession = async () => {
    await db.runAsync('DELETE FROM users');
    await db.runAsync('DELETE FROM profiles');
    await db.runAsync('DELETE FROM diagnoses'); // Clear cached history for privacy
}

export const getSavedPhone = async () => {
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'last_phone');
    return row?.value || null;
}

export const saveSavedPhone = async (phone: string) => {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', 'last_phone', phone);
}

export const saveProfile = async (phoneNumber: string, userId: string, token: string | null, userType: string, name: string | null = null, email: string | null = null) => {
    await db.runAsync(
        'INSERT OR REPLACE INTO profiles (phoneNumber, userId, token, userType, name, email) VALUES (?, ?, ?, ?, ?, ?)',
        phoneNumber, userId, token, userType, name, email
    );
};

export const getProfileForPhone = async (phoneNumber: string) => {
    return await db.getFirstAsync<{ userId: string, phoneNumber: string, token: string, userType: string, name: string, email: string }>(
        'SELECT * FROM profiles WHERE phoneNumber = ?',
        phoneNumber
    );
};

export const saveDiagnosisLocal = async (diagnosis: Diagnosis, synced: number = 0) => {
    const crop = diagnosis.crop || diagnosis.cropType;
    // If advice is already a string (from backend), don't double stringify if it's already quoted or just store as is
    // Actually JSON.stringify is fine for strings, it just adds quotes.
    const advice = typeof diagnosis.advice === 'string' ? diagnosis.advice : JSON.stringify(diagnosis.advice);

    await db.runAsync(
        'INSERT INTO diagnoses (diagnosisId, crop, disease, confidence, advice, imageUri, synced, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        diagnosis.id,
        crop,
        diagnosis.disease,
        diagnosis.confidence,
        advice,
        diagnosis.imageUri || diagnosis.imageUrl || null,
        synced,
        diagnosis.createdAt || new Date().toISOString()
    );
};

export const getDiagnoses = async () => {
    const rows = await db.getAllAsync('SELECT * FROM diagnoses ORDER BY createdAt DESC');
    return rows.map((row: any): DiagnosisLocal => {
        let advice = row.advice;
        try {
            // Try to parse if it's a JSON string (for object style advice)
            if (advice && (advice.startsWith('{') || advice.startsWith('['))) {
                advice = JSON.parse(advice);
            }
        } catch (e) {
            console.warn('Failed to parse advice JSON, using as plain string');
        }
        return {
            ...row,
            advice
        };
    });
};

export const deleteDiagnosis = async (id: number) => {
    await db.runAsync('DELETE FROM diagnoses WHERE id = ?', id);
};

export const syncDiagnosesFromBackend = async (diagnoses: Diagnosis[]) => {
    for (const diagnosis of diagnoses) {
        const crop = diagnosis.crop || diagnosis.cropType;
        const advice = typeof diagnosis.advice === 'string' ? diagnosis.advice : JSON.stringify(diagnosis.advice);

        // Extract the actual image URL based on the Prisma relation or fallback to direct imageUrl/imageUri
        const remoteImageUrl = diagnosis.image?.url || diagnosis.imageUrl || diagnosis.imageUri;

        // We check if the diagnosis already exists based on diagnosisId
        const existing = await db.getFirstAsync('SELECT id FROM diagnoses WHERE diagnosisId = ?', diagnosis.id);

        if (!existing) {
            await db.runAsync(
                'INSERT INTO diagnoses (diagnosisId, crop, disease, confidence, advice, imageUri, synced, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                diagnosis.id,
                crop,
                diagnosis.disease,
                diagnosis.confidence,
                advice,
                remoteImageUrl || null,
                1,
                diagnosis.createdAt || new Date().toISOString()
            );
        } else {
            // Optionally update existing records if needed. For now, assuming history doesn't change after creation
            await db.runAsync(
                'UPDATE diagnoses SET imageUri = ?, synced = 1 WHERE diagnosisId = ?',
                remoteImageUrl || null,
                diagnosis.id
            );
        }
    }
};

export const resetDatabase = async () => {
    try {
        await db.execAsync(`
            DROP TABLE IF EXISTS users;
            DROP TABLE IF EXISTS diagnoses;
            DROP TABLE IF EXISTS settings;
            DROP TABLE IF EXISTS profiles;
        `);
        await initDatabase();
        console.log('Database reset successfully');
    } catch (error) {
        console.error('Database reset failed:', error);
        throw error;
    }
}

export default db;
