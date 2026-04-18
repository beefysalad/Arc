-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "posterPath" TEXT,
    "genres" TEXT[],
    "runtime" INTEGER,
    "tmdbRating" DOUBLE PRECISION,
    "userRating" INTEGER,
    "note" TEXT,
    "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramUser" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingLink" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TasteProfile" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "topGenres" JSONB NOT NULL,
    "avgRating" DOUBLE PRECISION,
    "totalWatched" INTEGER NOT NULL DEFAULT 0,
    "lastInsight" JSONB,
    "lastInsightAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TasteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Movie_userId_watchedAt_idx" ON "Movie"("userId", "watchedAt" DESC);

-- CreateIndex
CREATE INDEX "Movie_userId_tmdbId_idx" ON "Movie"("userId", "tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_clerkUserId_key" ON "TelegramUser"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUser_telegramId_key" ON "TelegramUser"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "PendingLink_code_key" ON "PendingLink"("code");

-- CreateIndex
CREATE INDEX "PendingLink_telegramId_expiresAt_idx" ON "PendingLink"("telegramId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TasteProfile_clerkUserId_key" ON "TasteProfile"("clerkUserId");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TelegramUser"("clerkUserId") ON DELETE RESTRICT ON UPDATE CASCADE;
