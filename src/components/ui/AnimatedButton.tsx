import { motion, useAnimation } from "framer-motion";
import { Loader2 } from "lucide-react";
import React from "react";

interface Props {
  isPending: boolean;
  onClick?: () => void;
}

const AnimatedButton = ({ isPending = true, onClick }: Props) => {
  // Use framer-motion's useAnimation hook
  const controls = useAnimation();

  // Effect to trigger the animation based on isPending state
  React.useEffect(() => {
    if (isPending) {
      controls.start({
        width: "120px",
        transition: { duration: 0.3, ease: "backOut" },
      });
    } else {
      controls.start({ width: "auto", transition: { duration: 0.3 } });
    }
  }, [isPending, controls]);

  return (
    <motion.button
      className="mb-2 md:mb-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      onClick={onClick}
      disabled={isPending}
      animate={controls} // Apply animations
      initial={{ width: "auto" }} // Initial width state
      transition={{ duration: 0.3, ease: "easeInOut" }} // Smooth transition duration
    >
      {!isPending && "Create"}
      {isPending && (
        <span className="flex items-center gap-x-3">
          <Loader2 className="animate-spin h-4 w-4" />
          Saving
        </span>
      )}
    </motion.button>
  );
};

export default AnimatedButton;
