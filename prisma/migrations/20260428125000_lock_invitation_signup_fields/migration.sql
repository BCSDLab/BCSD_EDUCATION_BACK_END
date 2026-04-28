-- AlterTable
ALTER TABLE "invitations"
ADD COLUMN "name" TEXT,
ADD COLUMN "semesterTrackId" INTEGER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "invitations") THEN
    RAISE EXCEPTION 'Existing invitations require name and semesterTrackId backfill before this migration can be applied.';
  END IF;
END $$;

-- AlterTable
ALTER TABLE "invitations"
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "semesterTrackId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "invitations"
ADD CONSTRAINT "invitations_semesterTrackId_fkey"
FOREIGN KEY ("semesterTrackId") REFERENCES "semester_tracks"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
