-- DropForeignKey
ALTER TABLE "public"."programs" DROP CONSTRAINT "programs_programTypeId_fkey";

-- DropIndex
DROP INDEX "public"."programs_yearId_programTypeId_key";

-- AlterTable
ALTER TABLE "public"."programs" ADD COLUMN     "is_monthly" BOOLEAN DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "session_duration" DOUBLE PRECISION,
ADD COLUMN     "venue_split_percent_new" DOUBLE PRECISION DEFAULT 50.0,
ALTER COLUMN "programTypeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."program_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "program_name" TEXT NOT NULL,
    "session_duration" DOUBLE PRECISION NOT NULL,
    "is_monthly" BOOLEAN NOT NULL DEFAULT false,
    "venue_split_percent" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    "program_type_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_templates" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_options" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registration_entries" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "pricing_option_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_entries_registration_id_pricing_option_id_key" ON "public"."registration_entries"("registration_id", "pricing_option_id");

-- AddForeignKey
ALTER TABLE "public"."program_templates" ADD CONSTRAINT "program_templates_program_type_id_fkey" FOREIGN KEY ("program_type_id") REFERENCES "public"."program_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_templates" ADD CONSTRAINT "pricing_templates_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."programs" ADD CONSTRAINT "programs_programTypeId_fkey" FOREIGN KEY ("programTypeId") REFERENCES "public"."program_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_options" ADD CONSTRAINT "pricing_options_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration_entries" ADD CONSTRAINT "registration_entries_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration_entries" ADD CONSTRAINT "registration_entries_pricing_option_id_fkey" FOREIGN KEY ("pricing_option_id") REFERENCES "public"."pricing_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
