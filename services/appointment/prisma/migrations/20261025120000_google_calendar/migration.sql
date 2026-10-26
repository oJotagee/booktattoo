CREATE TABLE "GoogleCalendarConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "refreshTokenEncrypted" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    CONSTRAINT "GoogleCalendarConnection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "GoogleCalendarConnection_userId_key" ON "GoogleCalendarConnection"("userId");

CREATE TABLE "GoogleCalendarOAuthState" (
    "state" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoogleCalendarOAuthState_pkey" PRIMARY KEY ("state")
);
CREATE INDEX "GoogleCalendarOAuthState_expiresAt_idx" ON "GoogleCalendarOAuthState"("expiresAt");

CREATE TABLE "CalendarSync" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "operation" TEXT NOT NULL DEFAULT 'UPSERT',
    "eventId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "syncedAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CalendarSync_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CalendarSync_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CalendarSync_appointmentId_key" ON "CalendarSync"("appointmentId");
CREATE INDEX "CalendarSync_status_nextAttemptAt_idx" ON "CalendarSync"("status", "nextAttemptAt");
