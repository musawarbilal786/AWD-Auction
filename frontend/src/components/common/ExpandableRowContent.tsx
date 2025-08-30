import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface ExpandableRowContentProps {
  expanded: boolean;
  children: React.ReactNode;
}

export default function ExpandableRowContent({ expanded, children }: ExpandableRowContentProps) {
  const [shouldRender, setShouldRender] = React.useState(expanded);
  React.useEffect(() => {
    if (expanded) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [expanded]);
  if (!shouldRender) return null;
  return (
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
          animate={{ height: "auto", opacity: 1, paddingTop: 24, paddingBottom: 24 }}
          exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 