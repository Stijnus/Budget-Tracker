# Budget Tracker

A simple budget tracking application built with React, TypeScript, and Supabase. This project is a fresh start with a clean codebase.

## Features (Planned)

- User authentication
- Expense tracking
- Budget management
- Financial insights
- Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/budget-tracker.git
   cd budget-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your project URL and anon key from the API settings

4. Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── api/        # API related code
├── components/ # Reusable components
├── contexts/   # React contexts
├── lib/        # Library code (Supabase client, etc.)
├── pages/      # Page components
└── utils/      # Utility functions
```

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## License

This project is licensed under the MIT License.
