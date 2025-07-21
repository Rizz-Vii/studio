/**
 * Interface for performance metrics collected during testing
 */
export interface PerformanceMetrics {
  /**
   * Time from navigation start to navigation complete in milliseconds
   */
  navigationTime: number;

  /**
   * First Paint (FP) in milliseconds
   * The time when the browser first renders any pixel to the screen
   */
  firstPaint: number;

  /**
   * First Contentful Paint (FCP) in milliseconds
   * The time when the browser first renders any text, image, non-white canvas, or SVG
   */
  firstContentfulPaint: number;

  /**
   * Largest Contentful Paint (LCP) in milliseconds
   * The time when the largest text or image is painted
   * This is a Core Web Vital
   */
  largestContentfulPaint: number;

  /**
   * DOM Content Loaded event time in milliseconds
   */
  domContentLoaded: number;

  /**
   * Load event time in milliseconds
   */
  load: number;

  /**
   * Total Blocking Time (TBT) in milliseconds
   * Sum of all time periods between FCP and TTI where the main thread was blocked for long enough
   * to prevent input responsiveness
   * Used as a proxy for First Input Delay (FID) in lab testing
   */
  totalBlockingTime: number;

  /**
   * Speed Index in milliseconds
   * How quickly the contents of a page are visibly populated
   */
  speedIndex: number;

  /**
   * Cumulative Layout Shift (CLS)
   * Measures visual stability - how much the page layout shifts during loading
   * This is a Core Web Vital
   */
  cumulativeLayoutShift: number;

  /**
   * Time to Interactive (TTI) in milliseconds
   * The time when the page is fully interactive
   */
  timeToInteractive: number;
}

/**
 * Interface for performance testing configuration
 */
export interface PerformanceTestConfig {
  /**
   * Whether to test on mobile devices
   */
  includeMobile: boolean;

  /**
   * Whether to run in throttled mode to simulate slower connections
   */
  useThrottling: boolean;

  /**
   * Which metrics to assert on
   */
  assertOn: Array<keyof PerformanceMetrics>;

  /**
   * Custom thresholds for metrics (overrides defaults)
   */
  thresholds?: Partial<Record<keyof PerformanceMetrics, number>>;
}
