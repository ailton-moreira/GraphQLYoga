/*
  Warnings:

  - Added the required column `published` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true;
