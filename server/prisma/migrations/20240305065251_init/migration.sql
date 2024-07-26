/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - The `id` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Mute` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `avatar` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nickName` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomPrivacy" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- DropForeignKey
ALTER TABLE "Mute" DROP CONSTRAINT "Mute_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Mute" DROP CONSTRAINT "Mute_userId_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "muted" TEXT[];

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "channelId",
DROP COLUMN "content",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "nickName" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Mute";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
