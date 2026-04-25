# ChatOff - Real-time Chat Application

A modern real-time chat application built with Next.js and Supabase.

## Features

- **Real-time messaging** - Messages appear instantly for all users
- **Username system** - Auto-generated usernames with option to customize
- **Persistent sessions** - Username saved in localStorage
- **Modern UI** - Dark theme with coral accents and smooth animations

## Tech Stack

| Technology    | Purpose                                    |
| ------------- | ------------------------------------------ |
| Next.js 14    | React framework with App Router            |
| Supabase      | Backend: Database + Realtime subscriptions |
| CSS Variables | Custom styling with dark theme             |

## Project Structure

```
src/
├── app/
│   ├── chat/
│   │   └── page.jsx      # Main chat page (entry point)
│   ├── globals.css       # Global styles & theme
│   ├── layout.js         # Root layout
│   └── page.js           # Home page redirect
├── components/
│   ├── chatWindow.jsx    # Message display area
│   ├── MessageBubble.jsx # Individual message component
│   ├── MessageInput.jsx  # Message input form
│   └── UsernameModal.jsx # Username prompt modal
└── lib/
    └── supabase.js       # Supabase client initialization
```

## How It Works

### 1. User Identity

- On first visit, a **username modal** appears
- Auto-generates random username (e.g., "SwiftPanda42")
- Username is **saved to localStorage** for persistence
- User can change username anytime by clicking the chip in header

### 2. Message Flow

```
User types message
       ↓
MessageInput.onSend() called
       ↓
Supabase insert to "messages" table
       ↓
Realtime subscription triggers
       ↓
All connected clients receive new message
       ↓
ChatWindow updates with new message
```

### 3. Data Model

**messages table:**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (auto-generated) |
| username | text | Sender's username |
| content | text | Message text |
| created_at | timestamp | When message was sent |

### 4. Realtime Subscription

The app subscribes to Supabase's `postgres_changes` channel:

- Listens for `INSERT` events on the `messages` table
- When a new message is added, it automatically appends to the local state
- Subscription is cleaned up when component unmounts

### 5. Key Components

| Component       | Responsibility                                         |
| --------------- | ------------------------------------------------------ |
| `chat/page.jsx` | Main container, state management, Supabase integration |
| `ChatWindow`    | Renders list of messages, auto-scrolls to bottom       |
| `MessageBubble` | Displays single message with timestamp                 |
| `MessageInput`  | Text input with Enter-to-send functionality            |
| `UsernameModal` | Prompts for username on first visit                    |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### 3. Set up database

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000/chat](http://localhost:3000/chat) to use the chat.

## Environment Variables

| Variable                               | Required | Description              |
| -------------------------------------- | -------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | Supabase project URL     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Supabase anon/public key |

## Customization

### Changing Colors

Edit CSS variables in `src/app/globals.css`:

```css
:root {
  --accent: #e94560; /* Main accent color */
  --bg: #0f0f23; /* Background */
  --surface: #1a1a2e; /* Card/surface color */
  --text: #eaeaea; /* Text color */
}
```

### Adding Features

- **Emoji support**: Add an emoji picker to `MessageInput`
- **Typing indicators**: Add presence tracking via Supabase
- **Message reactions**: Add a reactions table linked to messages
- **File uploads**: Use Supabase Storage for images/files
