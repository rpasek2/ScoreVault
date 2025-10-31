// Mock in-memory database for testing
export class MockDatabase {
  private tables: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.tables.set('gymnasts', new Map());
    this.tables.set('meets', new Map());
    this.tables.set('scores', new Map());
    this.tables.set('team_placements', new Map());
  }

  async execAsync(sql: string): Promise<void> {
    // Mock table creation - do nothing
    return Promise.resolve();
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    const insertMatch = sql.match(/INSERT INTO (\w+)/i);
    const updateMatch = sql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]+?)\s+WHERE/i);
    const deleteMatch = sql.match(/DELETE FROM (\w+)/i);

    if (insertMatch) {
      const tableName = insertMatch[1];
      const table = this.tables.get(tableName);
      if (table) {
        // Extract ID from params (first param is usually the ID)
        const id = params[0];
        const row: any = { id };

        // Build row from params based on table
        if (tableName === 'gymnasts') {
          row.name = params[1];
          row.dateOfBirth = params[2];
          row.usagNumber = params[3];
          row.level = params[4];
          row.discipline = params[5];
          row.isHidden = params[6] || 0;
          row.createdAt = params[7];
        } else if (tableName === 'meets') {
          row.name = params[1];
          row.date = params[2];
          row.season = params[3];
          row.location = params[4];
          row.createdAt = params[5];
        } else if (tableName === 'scores') {
          row.meetId = params[1];
          row.gymnastId = params[2];
          row.level = params[3];
          row.vault = params[4];
          row.bars = params[5];
          row.beam = params[6];
          row.floor = params[7];
          row.pommelHorse = params[8];
          row.rings = params[9];
          row.parallelBars = params[10];
          row.highBar = params[11];
          row.allAround = params[12];
          row.vaultPlacement = params[13];
          row.barsPlacement = params[14];
          row.beamPlacement = params[15];
          row.floorPlacement = params[16];
          row.pommelHorsePlacement = params[17];
          row.ringsPlacement = params[18];
          row.parallelBarsPlacement = params[19];
          row.highBarPlacement = params[20];
          row.allAroundPlacement = params[21];
          row.createdAt = params[22];
        } else if (tableName === 'team_placements') {
          row.meetId = params[1];
          row.level = params[2];
          row.discipline = params[3];
          row.vaultPlacement = params[4];
          row.barsPlacement = params[5];
          row.beamPlacement = params[6];
          row.floorPlacement = params[7];
          row.pommelHorsePlacement = params[8];
          row.ringsPlacement = params[9];
          row.parallelBarsPlacement = params[10];
          row.highBarPlacement = params[11];
          row.allAroundPlacement = params[12];
          row.createdAt = params[13];
        }

        table.set(id, row);
      }
      return { lastInsertRowId: 1, changes: 1 };
    }

    if (updateMatch) {
      const tableName = updateMatch[1];
      const setClause = updateMatch[2];
      const table = this.tables.get(tableName);

      // Get the ID from the last param (WHERE id = ?)
      const id = params[params.length - 1];

      if (table && id) {
        const existingRow = table.get(id);
        if (existingRow) {
          // Special handling for team_placements
          if (tableName === 'team_placements') {
            existingRow.vaultPlacement = params[0];
            existingRow.barsPlacement = params[1];
            existingRow.beamPlacement = params[2];
            existingRow.floorPlacement = params[3];
            existingRow.pommelHorsePlacement = params[4];
            existingRow.ringsPlacement = params[5];
            existingRow.parallelBarsPlacement = params[6];
            existingRow.highBarPlacement = params[7];
            existingRow.allAroundPlacement = params[8];
          } else {
            // Parse SET clause to handle both hardcoded values and placeholders
            const assignments = setClause.split(',').map(s => s.trim());
            let paramIndex = 0;

            assignments.forEach(assignment => {
              const [field, value] = assignment.split('=').map(s => s.trim());

              if (value === '?') {
                // Value is a placeholder, use param
                existingRow[field] = params[paramIndex++];
              } else {
                // Value is hardcoded in SQL
                // Try to parse as number or keep as string
                const numValue = Number(value);
                existingRow[field] = isNaN(numValue) ? value.replace(/['"]/g, '') : numValue;
              }
            });
          }

          table.set(id, existingRow);
        }
      }
      return { lastInsertRowId: 0, changes: 1 };
    }

    if (deleteMatch) {
      const tableName = deleteMatch[1];
      const table = this.tables.get(tableName);
      if (table && params[0]) {
        table.delete(params[0]);
      }
      return { lastInsertRowId: 0, changes: 1 };
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const selectMatch = sql.match(/FROM (\w+)/i);
    if (!selectMatch) return [];

    const tableName = selectMatch[1];
    const table = this.tables.get(tableName);
    if (!table) return [];

    let rows = Array.from(table.values());

    // Handle WHERE clauses
    const whereMatch = sql.match(/WHERE (.+?)(?:ORDER BY|$)/i);
    if (whereMatch) {
      const condition = whereMatch[1].trim();

      // Handle parameterized conditions
      if (params.length > 0) {
        // Handle team_placements multi-condition: meetId = ? AND level = ? AND discipline = ?
        if (condition.includes('meetId = ? AND level = ? AND discipline = ?')) {
          rows = rows.filter(row =>
            row.meetId === params[0] &&
            row.level === params[1] &&
            row.discipline === params[2]
          );
        } else if (condition.includes('id = ?')) {
          rows = rows.filter(row => row.id === params[0]);
        } else if (condition.includes('gymnastId = ?')) {
          rows = rows.filter(row => row.gymnastId === params[0]);
        } else if (condition.includes('meetId = ?')) {
          rows = rows.filter(row => row.meetId === params[0]);
        }
      }

      // Handle hardcoded conditions
      if (condition.includes('isHidden = 0')) {
        rows = rows.filter(row => row.isHidden === 0);
      } else if (condition.includes('isHidden = 1')) {
        rows = rows.filter(row => row.isHidden === 1);
      }
    }

    // Handle ORDER BY
    if (sql.includes('ORDER BY createdAt DESC')) {
      rows.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sql.includes('ORDER BY date DESC')) {
      rows.sort((a, b) => b.date - a.date);
    }

    return rows as T[];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // Helper to clear all data
  clearAll() {
    this.tables.forEach(table => table.clear());
  }

  // Helper to get table data for inspection
  getTable(name: string) {
    return this.tables.get(name);
  }
}
