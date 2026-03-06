/*
  Warnings:

  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeviceToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Swipe` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_matchId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Swipe" DROP CONSTRAINT "Swipe_swipedId_fkey";

-- DropForeignKey
ALTER TABLE "Swipe" DROP CONSTRAINT "Swipe_swiperId_fkey";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "DeviceToken";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Swipe";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "SwipeAction";
