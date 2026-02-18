# Notes Collab — Frontend Client

Real-time collaborative note-taking app built with React Router v7, Tiptap, Yjs, and Socket.io.

---

## 🎯 Overview

This is a **standalone SPA (Single Page Application)** that connects to the Express backend via Socket.io for real-time collaboration. The frontend is completely decoupled from the server — it can be deployed separately and just needs the backend URL configured.

### Tech Stack

- **React 19** - UI framework
- **React Router v7** - File-based routing in framework mode (`ssr: false` for SPA)
- **Tiptap v3** - Rich text editor (ProseMirror-based)
- **Yjs** - CRDT for conflict-free collaborative editing
- **Socket.io Client** - WebSocket communication with backend
- **shadcn/ui** - UI component library (Radix UI + Tailwind CSS)
- **Tailwind CSS v4** - Styling with CSS variables
- **TypeScript** - Type safety
- **Vite** - Build tool

---

## 📁 Project Structure

```
client/
├── app/
│   ├── root.tsx                  # Root layout + error boundary
│   ├── routes.ts                 # Route definitions
│   ├── app.css                   # Global styles (Tailwind + shadcn vars)
│   │
│   ├── routes/
│   │   ├── home.tsx              # Landing page (create/join note)
│   │   └── note.tsx              # Collaborative editor page
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   │
│   │   ├── UserAvatar.tsx        # Colored user avatar component
│   │   ├── ConnectionStatus.tsx  # Live/Syncing/Disconnected badge
│   │   ├── ShareButton.tsx       # Copy link to clipboard
│   │   └── EditorToolbar.tsx     # Tiptap formatting toolbar
│   │
│   ├── hooks/
│   │   ├── useSocket.ts          # Socket connection + room management
│   │   └── useCollabEditor.ts    # Tiptap + Yjs + Socket.io integration
│   │
│   └── lib/
│       ├── socket.ts             # Socket.io singleton
│       └── utils.ts              # shadcn cn() helper
│
├── public/                       # Static assets
├── vite.config.ts                # Vite configuration
├── react-router.config.ts        # React Router config (ssr: false)
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn config
├── package.json
└── .env                          # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm, yarn, or pnpm
- Backend server https://github.com/peterwambua-1998/note-collab-backend

### Installation

```bash
cd client
npm install
```

### Environment Setup

Create a `.env` file (or copy from `.env.example`):

```bash
VITE_SERVER_URL=http://localhost:3000
```

> **Important:** Vite requires the `VITE_` prefix for environment variables to be exposed to the browser.

### Development

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

> **Note:** Make sure the backend server is also running on port 3000 (or whatever `VITE_SERVER_URL` points to).

### Build for Production

```bash
npm run build
```

This creates a production build in `build/client/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## 🎨 Features

### Implemented

✅ **Real-time collaboration** — Multiple users editing the same note  
✅ **Rich text editing** — Bold, italic, headings, lists, blockquotes, code  
✅ **Collaborative cursors** — See where others are typing with colored carets  
✅ **User presence** — Avatar list showing who's in the room  
✅ **Connection status** — Live indicator (connected/syncing/disconnected)  
✅ **Share links** — Copy link to share with collaborators  
✅ **Persistent usernames** — Saved to localStorage  
✅ **Offline tolerance** — Reconnects automatically with exponential backoff  
✅ **Undo/redo** — Yjs-powered history that works across all clients  
✅ **Responsive design** — Works on mobile and desktop  
✅ **Dark mode ready** — shadcn CSS variables support light/dark themes  

### Not Implemented (Intentionally)

❌ **Server-side rendering** — This is a client-only SPA (`ssr: false`)  
❌ **Persistent storage** — Notes disappear when everyone leaves (P2P design)  
❌ **Authentication** — No login required, just enter your name  
❌ **File uploads** — Text-only collaboration  

## 📡 How It Works

### Connection Flow

1. User opens `/` (home page)
2. User enters name and clicks "Create new note"
3. App generates random room ID (e.g., `abc123xyz456`)
4. App navigates to `/note/abc123xyz456?username=Alice`
5. `useSocket` hook connects to backend via Socket.io
6. Socket emits `join-room` event with `{ roomId, username }`
7. Backend assigns user a color and broadcasts to room
8. `useCollabEditor` creates Yjs document and Tiptap editor
9. Editor syncs changes via `yjs-update` Socket.io events
10. Other users receive updates and apply them to their Yjs doc

### Collaboration Architecture

```
┌─────────────────────────────────────────────────────┐
│ User A (Browser)                                    │
│                                                     │
│  Tiptap Editor ──► Yjs Doc ──► Socket.io ──┐      │
│       ▲                              │       │      │
│       └──────────────────────────────┘       │      │
└──────────────────────────────────────────────┼──────┘
                                               │
                   ┌───────────────────────────┘
                   │
            ┌──────▼──────┐
            │   Express   │
            │   Server    │
            │  Socket.io  │
            └──────┬──────┘
                   │
                   └───────────────────────────┐
                                               │
┌──────────────────────────────────────────────▼──────┐
│ User B (Browser)                             │      │
│                                              │      │
│  Tiptap Editor ◄── Yjs Doc ◄── Socket.io ───┘      │
│       │                              ▲              │
│       └──────────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

### Data Flow

**Local edit:**
1. User types "Hello" in Tiptap
2. Tiptap updates ProseMirror state
3. Yjs Collaboration extension creates a Yjs update
4. `useCollabEditor` emits `yjs-update` event to Socket.io
5. Server broadcasts update to all other users in room

**Remote edit:**
1. Socket receives `yjs-update` event from server
2. `useCollabEditor` applies update to Yjs doc with `Y.applyUpdate()`
3. Yjs updates Tiptap's ProseMirror document
4. User sees "Hello" appear in their editor

---

## 🧩 Key Hooks

### `useSocket({ roomId, username })`

Manages Socket.io connection, room membership, and user presence.

**Returns:**
```ts
{
  socket: Socket | null;        // Socket.io instance
  isConnected: boolean;          // Connected to server
  isJoined: boolean;             // Joined the room
  users: UserData[];             // All users in room
  myUserData: UserData | null;   // Current user's info
  error: string | null;          // Connection error
}
```

**What it does:**
- Connects to server when component mounts
- Emits `join-room` event
- Listens for `user-joined`, `user-left`, `room-users`
- Handles reconnection automatically
- Cleans up on unmount

---

### `useCollabEditor({ socket, roomId, myUserData, isJoined })`

Creates Tiptap editor with Yjs collaboration and syncs via Socket.io.

**Returns:**
```ts
{
  editor: Editor | null;   // Tiptap editor instance
  ydoc: Y.Doc;             // Yjs document
  isSynced: boolean;       // Has received initial sync
}
```

**What it does:**
- Creates Tiptap editor with extensions:
  - `StarterKit` (paragraphs, headings, bold, etc.)
  - `Collaboration` (Yjs binding)
  - `CollaborationCaret` (cursor positions)
  - `Placeholder` ("Start writing...")
- Pipes Yjs updates through Socket.io
- Requests sync from existing peers when joining
- Updates user color/name when `myUserData` arrives

---

## 🎨 Styling

### Tailwind CSS v4 + shadcn

The app uses **Tailwind CSS v4** with shadcn's CSS variable system for theming.

**CSS Variables** (in `app/app.css`):

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... etc */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... etc */
}
```

**Using colors:**

```tsx
<div className="bg-background text-foreground">
  <Button variant="default">Primary button</Button>
  <Badge variant="outline">Outline badge</Badge>
</div>
```

### Adding Dark Mode

The CSS variables are already set up. To enable dark mode:

1. Add a theme toggle button
2. Add/remove `.dark` class on `<html>` element

```tsx
// Example theme toggle
const toggleDark = () => {
  document.documentElement.classList.toggle('dark');
};
```

---

## 🧪 Testing

### Manual Testing

1. **Single user:**
   ```bash
   npm run dev
   # Open http://localhost:5173
   # Create a note, type some text
   # Verify toolbar works, undo/redo works
   ```

2. **Multiple users:**
   ```bash
   npm run dev
   # Open http://localhost:5173 in 2+ browser windows
   # Create a note in first window
   # Copy the link, paste in second window
   # Type in both windows — should sync in real-time
   # Verify you see each other's cursors
   ```

3. **Reconnection:**
   ```bash
   # With 2 users connected:
   # Stop the backend server
   # Verify "Disconnected" badge appears
   # Start backend again
   # Verify "Live" badge reappears
   # Edits should sync again
   ```

## 🔒 Security Considerations

### Current Setup

- ✅ No sensitive data in localStorage
- ✅ Usernames are sanitized on backend
- ✅ Room IDs are random and unguessable
- ⚠️ **Anyone with the link can join and edit**
- ⚠️ **No rate limiting on client side**
- ⚠️ **No input validation beyond backend**

### For Production

Consider adding:

1. **Room passwords** — Optional password protection
2. **Read-only mode** — View-only links
3. **Rate limiting** — Prevent spam
4. **Content moderation** — Block offensive content
5. **Authentication** — Require login for certain features
6. **Room expiration** — Auto-delete after X days
7. **Analytics** — Track usage (privacy-friendly)

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** "Disconnected" badge, can't connect to server

**Solutions:**
- ✅ Check backend is running: `curl http://localhost:3000/api/health`
- ✅ Verify `VITE_SERVER_URL` in `.env` is correct
- ✅ Restart dev server after changing `.env`
- ✅ Check browser console for CORS errors
- ✅ Ensure backend's `CLIENT_URL` matches frontend URL

## 📚 Learn More

### React Router v7
- [Docs](https://reactrouter.com/start/framework/installation)
- [SPA Mode](https://reactrouter.com/how-to/spa)

### Tiptap
- [Installation](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Collaboration](https://tiptap.dev/docs/editor/extensions/functionality/collaboration)
- [Collaboration Caret](https://tiptap.dev/docs/editor/extensions/functionality/collaboration-caret)

### Yjs
- [Docs](https://docs.yjs.dev/)
- [CRDT Explained](https://josephg.com/blog/crdts-go-brrr/)

### Socket.io
- [Client Docs](https://socket.io/docs/v4/client-api/)
- [Emit Cheatsheet](https://socket.io/docs/v4/emit-cheatsheet/)

### shadcn/ui
- [Docs](https://ui.shadcn.com/docs)
- [Theming](https://ui.shadcn.com/docs/theming)

---

## 🤝 Contributing

This is a learning project! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Fork and customize

---

## 📄 License

MIT — Use freely for learning and experimentation!
