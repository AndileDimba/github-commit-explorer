# GitHub Commit Explorer

A Vue 3 application for exploring GitHub repositories and commits with favorites management.

Live site: [github-commit-explorer-b16blv9un-andile-dimbas-projects.vercel.app]

## Features

- 🔍 Search GitHub users and view their repositories
- 📝 Browse commits with pagination
- ⭐ Mark commits as favorites
- 📊 View detailed commit information including file changes and diffs
- 🔄 Sort commits by date (newest/oldest)
- ✅ Full TypeScript support
- 🧪 Comprehensive unit tests

## Tech Stack

- **Vue 3** - Composition API
- **TypeScript** - Type safety
- **Pinia** - State management
- **Vue Router** - Navigation
- **Vite** - Build tool
- **Vitest** - Unit testing

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install

2. **Run development server:**
   ```bash
   npm run dev
3. **Run tests:**
   ```bash
   npm run test
4. **Build for production:**
   ```bash
   npm run build

## Usage
1. Enter a GitHub username (e.g., "octocat")
2. Browse the user's repositories
3. Click on a repository to view its commits
4. Add commits to favorites using the star button
5. Click "View Details" to see file changes and diffs
6. Sort commits using the dropdown menu

## Project Structure
- src/
  - ├── components/          # Reusable components
  - ├── views/              # Page components
    - │   ├── HomeView.vue    # Search page
    - │     └── RepoView.vue    # Repository and commits page
  - ├── stores/             # Pinia stores
    - │   ├── github.ts       # Main store
    - │   └── __tests__/      # Store tests
  - ├── types/              # TypeScript interfaces
     - │   └── github.ts       # GitHub API types
   - ├── router/             # Vue Router configuration
      - │   └── index.ts
  - ├── App.vue             # Root component
  - └── main.ts             # Application entry point

## API Endpoints Used
- GET /users/:username/repos - Fetch user repositories
- GET /repos/:username/:repo/commits - Fetch repository commits
- GET /repos/:username/:repo/commits/:sha - Fetch commit details

## Design
**Clean black and white design with:**

- High contrast for readability
- Clear visual hierarchy
- Responsive layout
- Accessible UI elements

## Notes
- GitHub API has a rate limit of 60 requests/hour for unauthenticated requests
- The app handles common errors (404, 403, network issues)
- Favorites are stored in Pinia state (not persisted to localStorage)
- Pagination shows 10 commits per page


## Testing
  **Run the test suite:**

    npm run test

**Tests cover:**

- API calls and error handling
- Favorites management
- Commit sorting
- Edge cases
