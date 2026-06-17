import { useState } from "react";
import * as Sentry from "@sentry/react";

// TEMPORARY - remove this page and its route once a test event is confirmed in the Sentry dashboard.
const SentryTest = () => {
  const [sent, setSent] = useState(false);

  const trigger = () => {
    Sentry.captureException(new Error("Frontend Sentry wiring test - triggered manually from /admin/sentry-test"));
    setSent(true);
  };

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold">Sentry wiring test</p>
      <button
        onClick={trigger}
        className="rounded-md border border-border bg-primary px-4 py-2 text-primary-foreground"
      >
        Send test event
      </button>
      {sent && <p className="text-sm text-muted-foreground">Sent — check the frontend project in Sentry.</p>}
    </div>
  );
};

export default SentryTest;
