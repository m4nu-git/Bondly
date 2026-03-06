-- AlterTable
ALTER TABLE "Preference" ALTER COLUMN "maxDistance" SET DEFAULT 100;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bloomFilter" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "geohash" TEXT;

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "likedById" TEXT NOT NULL,
    "likedToId" TEXT NOT NULL,
    "photoId" TEXT,
    "promptId" TEXT,
    "comment" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_likedById_likedToId_key" ON "Like"("likedById", "likedToId");

-- CreateIndex
CREATE INDEX "Profile_geohash_idx" ON "Profile"("geohash");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_likedToId_fkey" FOREIGN KEY ("likedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
