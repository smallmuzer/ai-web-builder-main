import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          style={{ width: 64, height: 64 }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-muted border-t-secondary" />
        </motion.div>
        <img src={logo} alt="" className="w-8 h-8 absolute" />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm font-medium"
      >
        {message}
      </motion.p>
    </div>
  );
};

export default LoadingSpinner;
