-- AlterTable
ALTER TABLE "rooms" ADD COLUMN "documentState" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topics" TEXT,
    "notes" TEXT,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "bookmarkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bookmarks" ("bookmarkedAt", "difficulty", "id", "isSolved", "notes", "problemSlug", "title", "topics", "updatedAt", "userId") SELECT "bookmarkedAt", "difficulty", "id", "isSolved", "notes", "problemSlug", "title", "topics", "updatedAt", "userId" FROM "bookmarks";
DROP TABLE "bookmarks";
ALTER TABLE "new_bookmarks" RENAME TO "bookmarks";
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");
CREATE INDEX "bookmarks_difficulty_idx" ON "bookmarks"("difficulty");
CREATE UNIQUE INDEX "bookmarks_userId_problemSlug_key" ON "bookmarks"("userId", "problemSlug");
CREATE TABLE "new_session_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "languagesPracticed" TEXT,
    "totalCollaborationTime" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthYear" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_session_stats" ("createdAt", "id", "languagesPracticed", "lastActivityAt", "monthYear", "problemsSolved", "totalCollaborationTime", "userId") SELECT "createdAt", "id", "languagesPracticed", "lastActivityAt", "monthYear", "problemsSolved", "totalCollaborationTime", "userId" FROM "session_stats";
DROP TABLE "session_stats";
ALTER TABLE "new_session_stats" RENAME TO "session_stats";
CREATE UNIQUE INDEX "session_stats_userId_key" ON "session_stats"("userId");
CREATE INDEX "session_stats_monthYear_idx" ON "session_stats"("monthYear");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
