# 🔍 WHO-KNOW: Real-time Game Controller

**"Who knows the secret? Who's acting sus?"** โปรเจกต์เว็บแอปสำหรับคุมเกม Insider (Board Game) ที่เน้นความ Minimalist และ Real-time Experience สูงสุด พัฒนาด้วยสถาปัตยกรรม Monorepo

**Live Demo:** [who-know-web.vercel.app](https://who-know-web.vercel.app/)

## 🛠 Tech Stack

- **Monorepo:** `Turborepo` + `pnpm`
- **Backend:** `NestJS` + `Socket.io`
- **Frontend:** `Next.js 14+ (App Router)` + `Zustand`
- **ORM:** `Prisma` + `PostgreSQL`
- **UI:** `Shadcn/UI` + `Tailwind CSS` + `Framer Motion`

---

## 🏗 Project Structure

```text
who-know/
├── apps/
│   ├── web/                # Next.js Frontend (The Player's Screen)
│   │   ├── src/app/
│   │   └── src/store/      # Zustand store for real-time game state
│   └── api/                # NestJS Backend (The Brain)
│       ├── src/games/      # Game Logic & Socket.io Gateway
│       └── src/rooms/      # Room & Player Management
├── packages/
│   ├── database/           # Shared Prisma Client & Schema
│   ├── types/              # Shared TS Interfaces & Game Constants
│   └── config/             # Shared ESLint, Prettier, TSConfig
├── docker-compose.yml
└── pnpm-workspace.yaml
```

---

## 💾 Database Schema (Prisma)

วางไฟล์นี้ไว้ที่ `packages/database/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RoomStatus {
  LOBBY
  WORD_SETTING
  PLAYING
  VOTING
  RESULT
}

enum Role {
  MASTER
  INSIDER
  COMMONER
}

model Room {
  id        String     @id @default(uuid())
  code      String     @unique // Room code for friends to join
  status    RoomStatus @default(LOBBY)
  players   User[]
  createdAt DateTime   @default(now())
}

model User {
  id       String  @id @default(uuid())
  name     String
  socketId String  @unique
  role     Role?
  score    Int     @default(0)
  roomId   String
  room     Room    @relation(fields: [roomId], references: [id])
}
```

---

## 🎮 Game Logic: The "Who Know" Protocol

### 1. Secret Dispatcher

ใช้ NestJS Gateway ในการแยกส่งข้อมูลบทบาทและคำลับ (Secret Word)

```typescript
// apps/api/src/games/games.gateway.ts
@SubscribeMessage('start_game')
async handleStartGame(@MessageBody() data: { roomId: string }) {
  const { master, insider, commoners } = await this.gameService.shuffle(data.roomId);

  // ส่งบทบาทแบบ Private
  this.server.to(master.socketId).emit('assign_role', { role: 'MASTER' });
  this.server.to(insider.socketId).emit('assign_role', { role: 'INSIDER' });

  commoners.forEach(p => {
    this.server.to(p.socketId).emit('assign_role', { role: 'COMMONER' });
  });
}
```

### 2. Live Voting

ระบบจะรวบรวมคะแนนโหวตและโชว์ผลลัพธ์แบบ Real-time เพื่อสร้างความตื่นเต้นระหว่างดีเบต

---

## 🚀 Future Roadmap

- [ ] **Custom Game Rules:** ปรับเวลาถาม หรือจำนวน Insider ได้
- [ ] **Global Leaderboard:** เก็บสถิตินักเนียนมือทอง

## 📌 Getting Started

1. `pnpm install`
2. `pnpm db:push`
3. `pnpm dev`
