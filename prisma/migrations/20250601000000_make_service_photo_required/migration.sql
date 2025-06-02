-- First update any existing null photos to a default value
UPDATE "RepairOrderService"
SET "photo" = 'default-service-photo.jpg'
WHERE "photo" IS NULL AND "deletedAt" IS NULL;

-- Then make the column required
ALTER TABLE "RepairOrderService" ALTER COLUMN "photo" SET NOT NULL;
