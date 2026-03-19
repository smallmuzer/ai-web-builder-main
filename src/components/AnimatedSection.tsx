import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection = ({ children, className = "", delay = 0 }: Props) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  // NOTE: Keep the observer ref on a plain DOM element to avoid ref warnings/crashes
  // when attaching callback refs to certain component wrappers.
  return (
    <div ref={ref} className={className}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AnimatedSection;
