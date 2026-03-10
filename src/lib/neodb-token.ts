// NeoDB Token helper
// Gets token from environment variable only

/**
 * Get NeoDB API token from environment variable
 */
export const getNeoDBToken = (): string => {
  return process.env.NEODB_TOKEN?.trim() || "";
};

/**
 * Check if NeoDB is configured (has token)
 */
export const isNeoDBConfigured = (): boolean => {
  return !!(process.env.NEODB_TOKEN?.trim());
};
