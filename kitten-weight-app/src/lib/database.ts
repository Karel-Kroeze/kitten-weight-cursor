import Database from 'better-sqlite3';
import { dev } from '$app/environment';

const db = new Database('kitten_weights.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS kittens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    birth_date DATE,
    rescue_date DATE,
    color TEXT,
    sex TEXT CHECK(sex IN ('M', 'F', 'Unknown')),
    status TEXT CHECK(status IN ('Active', 'Adopted', 'Medical Hold', 'Deceased')) DEFAULT 'Active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS weight_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kitten_id INTEGER NOT NULL,
    weight_grams INTEGER NOT NULL,
    measurement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kitten_id) REFERENCES kittens(id) ON DELETE CASCADE
  )
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_weight_measurements_kitten_id 
  ON weight_measurements(kitten_id);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_weight_measurements_date 
  ON weight_measurements(measurement_date);
`);

// Trigger to update updated_at on kittens table
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_kittens_updated_at
  AFTER UPDATE ON kittens
  FOR EACH ROW
  BEGIN
    UPDATE kittens SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`);

if (dev) {
  console.log('Database initialized successfully');
}

export default db;

// Helper types
export interface Kitten {
  id?: number;
  name: string;
  birth_date?: string;
  rescue_date?: string;
  color?: string;
  sex?: 'M' | 'F' | 'Unknown';
  status?: 'Active' | 'Adopted' | 'Medical Hold' | 'Deceased';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeightMeasurement {
  id?: number;
  kitten_id: number;
  weight_grams: number;
  measurement_date?: string;
  notes?: string;
  created_at?: string;
}

export interface KittenWithLatestWeight extends Kitten {
  latest_weight?: number;
  latest_weight_date?: string;
  weight_change?: number;
  weight_change_days?: number;
}