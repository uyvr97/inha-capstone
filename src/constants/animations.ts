export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  slideRight: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
  },
  popIn: {
    initial: { scale: 0 },
    animate: { scale: 1 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
};

export const TRANSITION_DEFAULTS = {
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  smooth: { duration: 0.5, ease: "easeOut" as const },
  fast: { duration: 0.3 },
};

export const TIMINGS = {
  AUTO_REDIRECT_MS: 10000,
  PAYMENT_DELAY_MS: 3000,
  NFC_TAG_TIMEOUT_MS: 10000,
  NFC_COMPLETE_TIMEOUT_MS: 3000,
} as const;
