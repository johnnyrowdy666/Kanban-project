/*
  Warnings:

  - A unique constraint covering the columns `[name,boardId]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."tags_name_key";

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "boardId" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "task_members" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACCEPTED';

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_boardId_key" ON "tags"("name", "boardId");

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
