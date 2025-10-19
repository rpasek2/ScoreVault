# ScoreVault Import/Export Guide

## Overview

ScoreVault allows you to export your data to JSON or CSV formats and import data from properly formatted JSON files.

## Exporting Data

### JSON Export (Complete Backup)
- **Format**: JSON
- **Contains**: All gymnasts, meets, and scores with complete details
- **Use Case**:
  - Full backup of your data
  - Transferring data between devices
  - Re-importing data into ScoreVault

### CSV Export (Spreadsheet)
- **Format**: CSV (Comma-Separated Values)
- **Options**:
  - Gymnasts only
  - Meets only
  - Scores only
- **Use Case**:
  - Viewing/editing in Excel or Google Sheets
  - Data analysis
  - Sharing with coaches or parents
- **Note**: CSV exports are read-only for external use. You **cannot** re-import CSV files back into ScoreVault.

## Importing Data

### Requirements

**Only JSON files can be imported back into ScoreVault.**

The JSON file must contain exactly three top-level arrays:
- `gymnasts` - Array of gymnast objects
- `meets` - Array of meet objects
- `scores` - Array of score objects

### Data Structure

#### Gymnast Object

```json
{
  "id": "unique-id-string",
  "name": "Athlete Name",
  "dateOfBirth": 1136073600000,  // Unix timestamp in milliseconds, or null
  "usagNumber": "123456",         // Optional, can be null
  "level": "Level 7",
  "discipline": "Womens",         // Must be "Womens" or "Mens"
  "createdAt": 1704067200000     // Unix timestamp in milliseconds
}
```

**Required Fields:**
- `id` - Must be unique for each gymnast
- `name` - Athlete's full name
- `level` - Competition level (e.g., "Level 7", "Level 10", "Elite")
- `discipline` - Must be exactly "Womens" or "Mens"
- `createdAt` - Timestamp when gymnast was added

**Optional Fields:**
- `dateOfBirth` - Can be `null` if unknown
- `usagNumber` - Can be `null` if not applicable

#### Meet Object

```json
{
  "id": "unique-meet-id",
  "name": "State Championship 2024",
  "date": 1704585600000,          // Unix timestamp in milliseconds
  "season": "2023-2024",
  "location": "Springfield Gym",  // Optional, can be null
  "createdAt": 1704067200000      // Unix timestamp in milliseconds
}
```

**Required Fields:**
- `id` - Must be unique for each meet
- `name` - Meet name
- `date` - Date of the meet (Unix timestamp)
- `season` - Season identifier (e.g., "2023-2024")
- `createdAt` - Timestamp when meet was added

**Optional Fields:**
- `location` - Can be `null` if not specified

#### Score Object

```json
{
  "id": "unique-score-id",
  "meetId": "meet-id-1",          // Must match a meet's id
  "gymnastId": "unique-id-1",     // Must match a gymnast's id
  "level": "Level 7",             // Optional, can be null
  "scores": {
    "vault": 9.2,                 // Women's events
    "bars": 8.8,
    "beam": 9.1,
    "floor": 9.5,
    "pommelHorse": null,          // Men's events
    "rings": null,
    "parallelBars": null,
    "highBar": null,
    "allAround": 36.6             // REQUIRED - sum of event scores
  },
  "placements": {
    "vault": 2,                   // All placements are optional
    "bars": 5,
    "beam": 3,
    "floor": 1,
    "pommelHorse": null,
    "rings": null,
    "parallelBars": null,
    "highBar": null,
    "allAround": 2
  },
  "createdAt": 1704585600000      // Unix timestamp in milliseconds
}
```

**Required Fields:**
- `id` - Must be unique for each score
- `meetId` - Must reference an existing meet's `id`
- `gymnastId` - Must reference an existing gymnast's `id`
- `scores` - Object containing event scores
- `scores.allAround` - **Required** - Total all-around score
- `placements` - Object (can have all `null` values)
- `createdAt` - Timestamp when score was added

**Optional Fields:**
- `level` - Can be `null`
- All individual event scores - Use `null` for events not competed
- All placement values - Use `null` for unknown placements

**Event Fields by Discipline:**
- **Women's Gymnastics**: vault, bars, beam, floor
- **Men's Gymnastics**: floor, pommelHorse, rings, vault, parallelBars, highBar

### Important Notes

1. **Timestamps**: All date/time values must be Unix timestamps in **milliseconds** (not seconds)
   - Example: `1704067200000` = January 1, 2024, 00:00:00 UTC
   - You can convert dates to timestamps using JavaScript: `new Date("2024-01-01").getTime()`

2. **Relationships**:
   - Each score's `meetId` must match an existing meet's `id`
   - Each score's `gymnastId` must match an existing gymnast's `id`
   - Import meets before scores, and gymnasts before scores

3. **Discipline Values**: Must be exactly `"Womens"` or `"Mens"` (case-sensitive, note the spelling)

4. **Null vs Undefined**: Use `null` for optional/missing values, not `undefined`

5. **Data Replacement**: **WARNING** - Importing will **replace ALL existing data** in the app
   - Always export your current data before importing
   - There is no undo after import

## Using the Template

A sample template file is provided: `IMPORT_TEMPLATE.json`

To use it:
1. Copy the template file
2. Replace the example data with your own
3. Ensure all IDs are unique
4. Verify all timestamps are in milliseconds
5. Check that `meetId` and `gymnastId` references match
6. Import through Settings → Import Data

## Common Import Errors

### "Invalid backup file format"
- Missing one of the three required arrays: `gymnasts`, `meets`, or `scores`
- Solution: Ensure your JSON has all three arrays, even if some are empty `[]`

### "Failed to import data"
- Invalid JSON syntax (missing commas, quotes, brackets)
- Solution: Validate your JSON using a JSON validator (jsonlint.com)

### Foreign Key Errors
- A score references a `meetId` or `gymnastId` that doesn't exist
- Solution: Check all IDs match correctly

### Invalid Discipline
- Discipline is not exactly "Womens" or "Mens"
- Solution: Check spelling and capitalization

## Example Workflows

### Workflow 1: Full Backup and Restore
1. Go to Settings → Export Data
2. Tap "Export JSON"
3. Save the file somewhere safe (cloud storage, email to yourself)
4. To restore: Go to Settings → Import Data
5. Select the saved JSON file

### Workflow 2: Sharing with Coach (View Only)
1. Go to Settings → Export Data
2. Tap "Export Scores (CSV)"
3. Share the CSV file
4. Coach can open in Excel/Google Sheets

### Workflow 3: Migrating from Another System
1. Export data from your old system
2. Convert to ScoreVault JSON format using the template
3. Validate the JSON structure
4. Import into ScoreVault

## Need Help?

If you encounter issues with import/export:
1. Check this guide for proper formatting
2. Validate your JSON at jsonlint.com
3. Use the provided template as a reference
4. Contact support through Settings → Contact Support

---

**ScoreVault** - Track your gymnastics journey
