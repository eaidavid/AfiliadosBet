import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Premium Animation Variants
export const premiumAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  
  float: {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },
  
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity
      }
    }
  },
  
  hover: {
    whileHover: { 
      scale: 1.02, 
      y: -2,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },
  
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Premium Animated Container
interface PremiumAnimatedContainerProps {
  children: React.ReactNode;
  animation?: keyof typeof premiumAnimations;
  delay?: number;
  className?: string;
  stagger?: boolean;
}

export const PremiumAnimatedContainer = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  className,
  stagger = false
}: PremiumAnimatedContainerProps) => {
  const animationConfig = premiumAnimations[animation];
  
  // Filtrar apenas as propriedades válidas de motion
  const motionProps: any = {};
  
  if ('initial' in animationConfig) {
    motionProps.initial = animationConfig.initial;
  }
  
  if ('animate' in animationConfig) {
    motionProps.animate = stagger ? premiumAnimations.stagger.animate : animationConfig.animate;
  }
  
  if ('exit' in animationConfig) {
    motionProps.exit = animationConfig.exit;
  }
  
  if ('transition' in animationConfig) {
    motionProps.transition = { 
      ...animationConfig.transition, 
      delay 
    };
  }
  
  // Aplicar propriedades de hover se existirem
  if ('whileHover' in animationConfig) {
    motionProps.whileHover = animationConfig.whileHover;
  }
  
  if ('whileTap' in animationConfig) {
    motionProps.whileTap = animationConfig.whileTap;
  }
  
  return (
    <motion.div
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// Premium Stagger Container
interface PremiumStaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const PremiumStaggerContainer = ({
  children,
  className,
  staggerDelay = 0.1
}: PremiumStaggerContainerProps) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Premium Stagger Item
interface PremiumStaggerItemProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn';
}

export const PremiumStaggerItem = ({
  children,
  className,
  animation = 'fadeIn'
}: PremiumStaggerItemProps) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: animation === 'slideUp' ? 20 : 0,
      x: animation === 'slideLeft' ? -20 : animation === 'slideRight' ? 20 : 0,
      scale: animation === 'scaleIn' ? 0.9 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

// Premium Page Transition
interface PremiumPageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PremiumPageTransition = ({
  children,
  className
}: PremiumPageTransitionProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
};

// Premium Modal Animation
export const PremiumModalAnimation = ({ children }: { children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal Content */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Premium Hover Card
interface PremiumHoverCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export const PremiumHoverCard = ({
  children,
  className,
  intensity = 'medium'
}: PremiumHoverCardProps) => {
  const intensityConfig = {
    subtle: { scale: 1.01, y: -1 },
    medium: { scale: 1.02, y: -2 },
    strong: { scale: 1.05, y: -5 }
  };

  return (
    <motion.div
      className={cn("cursor-pointer", className)}
      whileHover={intensityConfig[intensity]}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

// Premium Loading Animation
export const PremiumLoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity
        }}
      />
    </div>
  );
};

// Premium Floating Action Button
interface PremiumFloatingButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const PremiumFloatingButton = ({
  children,
  onClick,
  className,
  position = 'bottom-right'
}: PremiumFloatingButtonProps) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      className={cn(
        "fixed z-40 w-14 h-14 glass-premium rounded-full shadow-2xl flex items-center justify-center text-white",
        positionClasses[position],
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {children}
    </motion.button>
  );
};

// Premium Notification Animation
export const PremiumNotificationAnimation = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
};