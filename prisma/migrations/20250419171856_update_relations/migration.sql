/*
  Warnings:

  - Added the required column `published` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;
