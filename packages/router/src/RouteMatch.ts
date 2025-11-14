/**
 * Route matching utilities
 * Handles pattern parsing, regex matching, and parameter extraction
 */

export interface MatchResult {
  matched: boolean;
  params: Record<string, string>;
  score: number;
}

/**
 * Parse a route pattern and convert to regex
 * Example: "/user/:id" -> /^\/user\/([^\/]+)$/
 * @param pattern Route pattern with :param syntax
 */
export function parsePattern(pattern: string): {
  regex: RegExp;
  paramNames: string[];
} {
  const paramNames: string[] = [];

  // Escape special regex characters except :
  let regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Replace :param with capture groups
  regexPattern = regexPattern.replace(
    /:([a-zA-Z_][a-zA-Z0-9_]*)/g,
    (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    }
  );

  // Add leading and trailing slashes
  regexPattern = regexPattern.replace(/^\/|\/$/g, "/*?");

  // Ensure exact match (start and end)
  const regex = new RegExp(`^${regexPattern}/*?`);

  return { regex, paramNames };
}

/**
 * Match a path against a pattern and extract params
 * @param path Current path to match
 * @param pattern Route pattern
 */
export function matchPath(path: string, pattern: string): MatchResult {
  const { regex, paramNames } = parsePattern(pattern);
  const match = path.match(regex);

  if (!match) {
    return {
      matched: false,
      params: {},
      score: 0,
    };
  }

  // Extract params from capture groups
  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = decodeURIComponent(match[index + 1]);
  });

  // Calculate score for best match selection
  // Higher score = more specific route
  // Static segments have higher priority than dynamic ones
  const score = calculateScore(pattern);

  return {
    matched: true,
    params,
    score,
  };
}

/**
 * Calculate match score for route priority
 * Static segments = 100 points each
 * Dynamic segments = 1 point each
 * More specific routes get higher scores
 */
function calculateScore(pattern: string): number {
  const segments = pattern.split("/").filter((s) => s.length > 0);
  let score = 0;

  for (const segment of segments) {
    if (segment.startsWith(":")) {
      // Dynamic segment
      score += 1;
    } else {
      // Static segment (more specific)
      score += 100;
    }
  }

  return score;
}

/**
 * Find best matching route from a list of patterns
 * Returns the pattern with highest score
 */
export function findBestMatch(
  path: string,
  patterns: string[]
): { pattern: string; result: MatchResult } | null {
  const matches = patterns
    .map((pattern) => ({
      pattern,
      result: matchPath(path, pattern),
    }))
    .filter((m) => m.result.matched)
    .sort((a, b) => b.result.score - a.result.score);

  return matches.length > 0 ? matches[0] : null;
}
