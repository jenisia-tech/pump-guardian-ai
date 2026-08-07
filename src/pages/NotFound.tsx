import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center text-center"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <Compass className="size-7" />
        </div>
        <p className="numeric mt-6 text-6xl font-bold tracking-tight text-foreground">404</p>
        <h1 className="mt-2 text-lg font-semibold">Telemetry channel not found</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          This route does not exist in the control room. Return to the asset overview to resume monitoring.
        </p>
        <Link to="/dashboard" className="mt-6">
          <Button className="gap-2">
            Back to dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
