import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  xs: 320,   // Small phones
  sm: 375,   // iPhone SE, iPhone 6/7/8
  md: 414,   // iPhone 6/7/8 Plus, iPhone X/11/12
  lg: 768,   // Tablets (portrait)
  xl: 1024,  // Tablets (landscape), small desktops
};

// Screen size helpers
export const isSmallScreen = SCREEN_WIDTH < BREAKPOINTS.sm;
export const isMediumScreen = SCREEN_WIDTH >= BREAKPOINTS.sm && SCREEN_WIDTH < BREAKPOINTS.md;
export const isLargeScreen = SCREEN_WIDTH >= BREAKPOINTS.md && SCREEN_WIDTH < BREAKPOINTS.lg;
export const isXLargeScreen = SCREEN_WIDTH >= BREAKPOINTS.lg;

// Responsive spacing (smaller screens get less padding)
export const getResponsiveSpacing = (base: number): number => {
  if (isSmallScreen) {
    return Math.max(base * 0.75, 4); // Min 4px
  }
  if (isMediumScreen) {
    return Math.max(base * 0.875, 6); // Min 6px
  }
  return base;
};

// Responsive font size (smaller screens get smaller fonts)
export const getResponsiveFontSize = (base: number): number => {
  if (isSmallScreen) {
    return Math.max(base * 0.875, 10); // Min 10px
  }
  if (isMediumScreen) {
    return Math.max(base * 0.9375, 11); // Min 11px
  }
  return base;
};

// Responsive padding for containers
export const getContainerPadding = () => {
  if (isSmallScreen) {
    return 12; // spacing.md
  }
  if (isMediumScreen) {
    return 16; // spacing.lg
  }
  return 20; // spacing.xl
};

// Max width for content (prevents stretching on large screens)
export const getMaxContentWidth = () => {
  if (isXLargeScreen) {
    return 600; // Max width for readability
  }
  return SCREEN_WIDTH;
};

// Card padding (responsive)
export const getCardPadding = () => {
  if (isSmallScreen) {
    return 12; // spacing.md
  }
  return 16; // spacing.lg
};

// Export screen dimensions
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallScreen,
  isMedium: isMediumScreen,
  isLarge: isLargeScreen,
  isXLarge: isXLargeScreen,
};

