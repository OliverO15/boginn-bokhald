-- CreateTable
CREATE TABLE "public"."venue_payments" (
    "id" TEXT NOT NULL,
    "yearId" TEXT NOT NULL,
    "seasonId" TEXT,
    "month" INTEGER,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "paidDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "venue_payments_yearId_seasonId_month_key" ON "public"."venue_payments"("yearId", "seasonId", "month");

-- AddForeignKey
ALTER TABLE "public"."venue_payments" ADD CONSTRAINT "venue_payments_yearId_fkey" FOREIGN KEY ("yearId") REFERENCES "public"."years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."venue_payments" ADD CONSTRAINT "venue_payments_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
