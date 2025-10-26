# WebBuilder - Project Management Dashboard

A comprehensive project management dashboard for building and managing Next.js applications. Each project runs in its own E2B sandbox with live preview, Monaco code editor, and file management.

## Features

- **User Authentication**: Secure sign-in/sign-up with Better Auth and Cloudflare D1
- **Project Management**: Create, edit, and delete Next.js projects
- **E2B Sandboxes**: Each project runs in an isolated E2B sandbox
- **Monaco Editor**: VS Code-like editing experience in the browser
- **Live Preview**: Real-time preview of your Next.js app
- **File Management**: Full file system access - create, edit, delete files and folders
- **Auto-save**: Automatic file saving with debounce
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Authentication**: Better Auth with D1 adapter
- **ORM**: Drizzle ORM
- **Sandboxes**: E2B (Code Interpreter)
- **Editor**: Monaco Editor (@monaco-editor/react)

## Architecture

```
User → Next.js App → Cloudflare Workers → E2B API
                  ↓
              Cloudflare D1 (Database)
                  ↓
              Cloudflare R2 (File Storage)
```

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Cloudflare account
3. E2B account and API key
4. Wrangler CLI installed (`npm install -g wrangler`)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd webbuilder1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file from the example:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
E2B_API_KEY=your-e2b-api-key-here
AUTH_SECRET=your-random-secret-key-min-32-chars
```

### Cloudflare Setup

1. Create a D1 database:
```bash
wrangler d1 create webbuilder-db
```

2. Update `wrangler.jsonc` with your database ID:
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "webbuilder-db",
    "database_id": "YOUR_DATABASE_ID_FROM_STEP_1"
  }
]
```

3. Run database migrations:
```bash
wrangler d1 execute webbuilder-db --local --file=./drizzle/0000_initial.sql
wrangler d1 execute webbuilder-db --remote --file=./drizzle/0000_initial.sql
```

4. Create an R2 bucket:
```bash
wrangler r2 bucket create webbuilder-files
```

5. Add your E2B API key to Cloudflare secrets:
```bash
wrangler secret put E2B_API_KEY
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Cloudflare:
```bash
npm run deploy
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/page.tsx          # Projects dashboard
│   ├── project/[id]/page.tsx       # Project editor
│   ├── auth/
│   │   ├── signin/page.tsx         # Sign in page
│   │   └── signup/page.tsx         # Sign up page
│   └── api/
│       ├── auth/[...all]/route.ts  # Better Auth routes
│       ├── projects/route.ts       # Project CRUD
│       └── files/[...path]/route.ts # File operations
├── components/
│   ├── AuthGuard.tsx               # Protected route wrapper
│   ├── CodeEditor.tsx              # Monaco editor wrapper
│   ├── FileTree.tsx                # File browser
│   ├── LivePreview.tsx             # iframe preview
│   └── ProjectCard.tsx             # Project card component
├── lib/
│   ├── db/
│   │   ├── schema.ts               # Drizzle schema
│   │   └── index.ts                # Database client
│   ├── auth/index.ts               # Better Auth config
│   └── e2b.ts                      # E2B client wrapper
└── types/index.ts                  # TypeScript types
```

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### Projects
- `GET /api/projects` - List all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PATCH /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Files
- `GET /api/files/[projectId]` - List project files
- `GET /api/files/[projectId]/[...path]` - Read file
- `PUT /api/files/[projectId]/[...path]` - Update file
- `POST /api/files/[projectId]/[...path]` - Create file/directory
- `DELETE /api/files/[projectId]/[...path]` - Delete file

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `E2B_API_KEY` | E2B API key for sandbox management | Yes |
| `AUTH_SECRET` | Secret key for Better Auth (min 32 chars) | Yes |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Dev only |
| `CLOUDFLARE_DATABASE_ID` | D1 database ID | Dev only |
| `CLOUDFLARE_D1_TOKEN` | D1 API token | Dev only |

## Usage

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Sign In**: Log in at `/auth/signin`
3. **Create Project**: Click "New Project" on the dashboard
4. **Edit Project**: Click on a project card to open the editor
5. **Edit Files**: Select files from the file tree, edit in Monaco Editor
6. **Live Preview**: See changes in real-time in the preview pane
7. **Auto-save**: Files are automatically saved after 500ms of inactivity

## Known Limitations

- E2B sandboxes have a 24-hour timeout (Pro tier) or 1-hour timeout (Hobby tier)
- Monaco Editor requires client-side rendering
- File tree is simplified and may not show all directories in complex projects
- Live preview refresh may be needed for some changes

## Troubleshooting

### Sandbox creation fails
- Verify your E2B API key is correct
- Check E2B account limits and quota
- Ensure E2B service is operational

### Database errors
- Run migrations: `wrangler d1 execute webbuilder-db --file=./drizzle/0000_initial.sql`
- Verify D1 database ID in `wrangler.jsonc`
- Check Cloudflare D1 dashboard for errors

### Authentication issues
- Verify `AUTH_SECRET` is set and has minimum 32 characters
- Clear browser cookies and try again
- Check Better Auth configuration in `src/lib/auth/index.ts`

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
