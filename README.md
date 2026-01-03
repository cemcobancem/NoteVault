# Notes App

A modern, feature-rich note-taking application built with React, TypeScript, and IndexedDB. This app allows you to organize your thoughts, tasks, and ideas with a clean and intuitive interface.

## Features

- **Note Management**: Create, edit, and organize notes with rich text support
- **Voice Recording**: Record audio notes and automatically transcribe them to text
- **Task Tracking**: Manage tasks with priorities, due dates, and status tracking
- **Notebooks**: Organize notes into customizable notebooks with color coding
- **Search Functionality**: Quickly find notes and tasks with powerful search
- **Tagging System**: Categorize content with customizable tags
- **Pinning & Archiving**: Keep important notes easily accessible and archive completed items
- **Offline Support**: All data is stored locally using IndexedDB
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Eye-friendly dark theme option

## Tech Stack

- **Frontend**: React with TypeScript
- **State Management**: React Hooks, React Query
- **Database**: IndexedDB (via Dexie.js)
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router
- **Build Tool**: Vite
- **Voice Recording**: Web Audio API
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd notes-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Core application logic
├── pages/          # Page components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── App.tsx         # Main application component
```

## Key Components

### Notes
- Create and edit notes with rich text content
- Attach voice recordings that can be transcribed to text
- Organize notes into notebooks
- Pin important notes for quick access
- Archive completed notes
- Tag notes for better organization

### Tasks
- Create tasks with descriptions, due dates, and priorities
- Mark tasks as complete/incomplete
- Filter tasks by priority and status
- Add tags for categorization

### Notebooks
- Create custom notebooks to organize notes
- Assign colors to notebooks for visual distinction
- View all notes within a specific notebook

### Search
- Unified search across all notes and tasks
- Filter results by content, titles, and tags
- Tabbed interface for switching between notes and tasks

## Data Management

All data is stored locally in the browser using IndexedDB via Dexie.js. The app includes:

- **Export/Import**: Backup and restore your data as JSON
- **Data Seeding**: Demo data to help you get started
- **Clear Data**: Option to delete all data (with confirmation)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Dexie.js](https://dexie.org/) for IndexedDB wrapper
- [Lucide Icons](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.