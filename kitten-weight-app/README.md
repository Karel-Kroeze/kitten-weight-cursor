# 🐱 Foster Kitten Weight Monitor

A SvelteKit application for monitoring the weight and health of foster kittens. Track weight changes, manage kitten profiles, and keep detailed records to ensure healthy development.

## Features

- **Kitten Management**: Add, edit, and track multiple foster kittens
- **Weight Tracking**: Record and monitor weight measurements over time
- **Status Monitoring**: Track kitten status (Active, Adopted, Medical Hold, etc.)
- **Quick Entry Widget**: Fast weight entry for regular monitoring
- **Growth Analysis**: Automatically calculate weight changes and trends
- **Data Persistence**: SQLite database for reliable data storage

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Setting Up Sample Data

To get started quickly with sample data:

1. Open your browser's developer console
2. Run the following to add sample kittens and weights:
   ```javascript
   fetch('/api/sample-data', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ action: 'create' })
   })
   ```

To clear all data:
```javascript
fetch('/api/sample-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'clear' })
})
```

## Database Schema

### Kittens Table
- `id`: Primary key
- `name`: Kitten's name (required)
- `birth_date`: Date of birth
- `rescue_date`: Date rescued/found
- `color`: Coat color description
- `sex`: M/F/Unknown
- `status`: Active/Adopted/Medical Hold/Deceased
- `notes`: Additional notes
- `created_at`, `updated_at`: Timestamps

### Weight Measurements Table
- `id`: Primary key
- `kitten_id`: Foreign key to kittens table
- `weight_grams`: Weight in grams (required)
- `measurement_date`: When measurement was taken
- `notes`: Optional notes about measurement
- `created_at`: Timestamp

## API Endpoints

### Kittens
- `GET /api/kittens` - List all kittens with latest weights
- `POST /api/kittens` - Create new kitten
- `GET /api/kittens/[id]` - Get specific kitten
- `PUT /api/kittens/[id]` - Update kitten
- `DELETE /api/kittens/[id]` - Delete kitten

### Weight Measurements
- `GET /api/weights` - List recent weights (with optional kitten_id filter)
- `POST /api/weights` - Create new weight measurement
- `GET /api/weights/[id]` - Get specific measurement
- `PUT /api/weights/[id]` - Update measurement
- `DELETE /api/weights/[id]` - Delete measurement

### Utility
- `POST /api/sample-data` - Create or clear sample data

## Usage Guide

### Adding a New Kitten

1. Click "Add New Kitten" button
2. Fill in the kitten's information:
   - **Name** (required): The kitten's name
   - **Color**: Coat color/pattern description
   - **Sex**: Male/Female/Unknown
   - **Status**: Current status (usually "Active" for new rescues)
   - **Birth Date**: If known
   - **Rescue Date**: When you found/rescued the kitten
   - **Notes**: Any additional information
3. Click "Add Kitten"

### Recording Weight Measurements

#### Quick Entry (Sidebar)
1. Select the kitten from the dropdown
2. Enter weight in grams
3. Add optional notes
4. Click "Add Weight"

#### Tips for Weight Measurements
- Weigh kittens at the same time each day for consistency
- Use a kitchen scale that measures in grams for accuracy
- For very small kittens, you may need to weigh them in a small container and subtract the container weight

### Understanding Weight Changes

The application automatically calculates:
- **Weight Change**: Difference from previous measurement
- **Time Period**: Days between measurements
- **Growth Indicators**: Visual indicators (↗️ for gain, ↘️ for loss)

### Monitoring Growth

Healthy kittens should:
- Gain weight consistently (especially in first 8 weeks)
- Double their birth weight by 2 weeks
- Gain approximately 10-15g per day in early weeks

**Warning Signs** (consult a veterinarian):
- Weight loss or failure to gain weight
- Significant fluctuations
- Not doubling weight by 2 weeks of age

## Technical Details

### Built With
- **SvelteKit**: Frontend framework
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **SQLite**: Database (via better-sqlite3)
- **Server-Side Rendering**: Fast initial page loads

### Project Structure
```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   ├── database.ts         # Database connection and schema
│   ├── kittenService.ts    # Database service layer
│   └── sampleData.ts       # Sample data generation
├── routes/
│   ├── api/                # API endpoints
│   ├── +layout.svelte      # Global layout
│   └── +page.svelte        # Main application page
└── app.html                # HTML template
```

### Data Storage

The application uses SQLite for data storage, creating a `kitten_weights.db` file in the project root. This provides:
- Reliable data persistence
- ACID compliance
- No external database dependencies
- Easy backup (single file)

## Development

### Adding New Features

1. **Database Changes**: Modify `src/lib/database.ts`
2. **API Endpoints**: Add to `src/routes/api/`
3. **UI Components**: Create in `src/lib/components/`
4. **Business Logic**: Update `src/lib/kittenService.ts`

### Building for Production

```bash
npm run build
```

The built application will be in the `build/` directory.

## Support

This application is designed to help foster families and animal rescues monitor kitten health. For veterinary concerns, always consult with a qualified veterinarian.

## License

This project is open source and available under the MIT License.
