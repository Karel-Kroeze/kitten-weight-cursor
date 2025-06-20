import db, { type Kitten, type WeightMeasurement, type KittenWithLatestWeight } from './database.js';

// Kitten CRUD operations
export class KittenService {
  static getAllKittens(): KittenWithLatestWeight[] {
    const stmt = db.prepare(`
      SELECT 
        k.*,
        w.weight_grams as latest_weight,
        w.measurement_date as latest_weight_date,
        prev.weight_grams as previous_weight,
        prev.measurement_date as previous_weight_date
      FROM kittens k
      LEFT JOIN (
        SELECT DISTINCT kitten_id, weight_grams, measurement_date,
               ROW_NUMBER() OVER (PARTITION BY kitten_id ORDER BY measurement_date DESC) as rn
        FROM weight_measurements
      ) w ON k.id = w.kitten_id AND w.rn = 1
      LEFT JOIN (
        SELECT DISTINCT kitten_id, weight_grams, measurement_date,
               ROW_NUMBER() OVER (PARTITION BY kitten_id ORDER BY measurement_date DESC) as rn
        FROM weight_measurements
      ) prev ON k.id = prev.kitten_id AND prev.rn = 2
      ORDER BY k.status = 'Active' DESC, k.name
    `);
    
    const kittens = stmt.all() as any[];
    
    return kittens.map(kitten => {
      const result: KittenWithLatestWeight = {
        ...kitten,
        latest_weight: kitten.latest_weight || undefined,
        latest_weight_date: kitten.latest_weight_date || undefined
      };
      
      // Calculate weight change
      if (kitten.latest_weight && kitten.previous_weight) {
        result.weight_change = kitten.latest_weight - kitten.previous_weight;
        
        // Calculate days between measurements
        if (kitten.latest_weight_date && kitten.previous_weight_date) {
          const latestDate = new Date(kitten.latest_weight_date);
          const prevDate = new Date(kitten.previous_weight_date);
          result.weight_change_days = Math.ceil((latestDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        }
      }
      
      return result;
    });
  }

  static getKittenById(id: number): Kitten | null {
    const stmt = db.prepare('SELECT * FROM kittens WHERE id = ?');
    return stmt.get(id) as Kitten || null;
  }

  static createKitten(kitten: Omit<Kitten, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO kittens (name, birth_date, rescue_date, color, sex, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      kitten.name,
      kitten.birth_date || null,
      kitten.rescue_date || null,
      kitten.color || null,
      kitten.sex || 'Unknown',
      kitten.status || 'Active',
      kitten.notes || null
    );
    
    return result.lastInsertRowid as number;
  }

  static updateKitten(id: number, kitten: Partial<Kitten>): boolean {
    const stmt = db.prepare(`
      UPDATE kittens 
      SET name = COALESCE(?, name),
          birth_date = COALESCE(?, birth_date),
          rescue_date = COALESCE(?, rescue_date),
          color = COALESCE(?, color),
          sex = COALESCE(?, sex),
          status = COALESCE(?, status),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `);
    
    const result = stmt.run(
      kitten.name || null,
      kitten.birth_date || null,
      kitten.rescue_date || null,
      kitten.color || null,
      kitten.sex || null,
      kitten.status || null,
      kitten.notes || null,
      id
    );
    
    return result.changes > 0;
  }

  static deleteKitten(id: number): boolean {
    const stmt = db.prepare('DELETE FROM kittens WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

// Weight measurement CRUD operations
export class WeightService {
  static getWeightsByKittenId(kittenId: number): WeightMeasurement[] {
    const stmt = db.prepare(`
      SELECT * FROM weight_measurements 
      WHERE kitten_id = ? 
      ORDER BY measurement_date DESC
    `);
    return stmt.all(kittenId) as WeightMeasurement[];
  }

  static getWeightById(id: number): WeightMeasurement | null {
    const stmt = db.prepare('SELECT * FROM weight_measurements WHERE id = ?');
    return stmt.get(id) as WeightMeasurement || null;
  }

  static createWeight(weight: Omit<WeightMeasurement, 'id' | 'created_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO weight_measurements (kitten_id, weight_grams, measurement_date, notes)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      weight.kitten_id,
      weight.weight_grams,
      weight.measurement_date || new Date().toISOString(),
      weight.notes || null
    );
    
    return result.lastInsertRowid as number;
  }

  static updateWeight(id: number, weight: Partial<WeightMeasurement>): boolean {
    const stmt = db.prepare(`
      UPDATE weight_measurements 
      SET weight_grams = COALESCE(?, weight_grams),
          measurement_date = COALESCE(?, measurement_date),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `);
    
    const result = stmt.run(
      weight.weight_grams || null,
      weight.measurement_date || null,
      weight.notes || null,
      id
    );
    
    return result.changes > 0;
  }

  static deleteWeight(id: number): boolean {
    const stmt = db.prepare('DELETE FROM weight_measurements WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getRecentWeights(limit: number = 10): Array<WeightMeasurement & { kitten_name: string }> {
    const stmt = db.prepare(`
      SELECT w.*, k.name as kitten_name
      FROM weight_measurements w
      JOIN kittens k ON w.kitten_id = k.id
      ORDER BY w.measurement_date DESC
      LIMIT ?
    `);
    return stmt.all(limit) as Array<WeightMeasurement & { kitten_name: string }>;
  }
}