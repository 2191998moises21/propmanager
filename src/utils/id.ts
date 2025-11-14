import { nanoid } from 'nanoid';

/**
 * Generates a unique ID with an optional prefix
 * @param prefix - Optional prefix for the ID (e.g., 'prop', 'ten', 'con')
 * @returns A unique identifier string
 */
export function generateId(prefix?: string): string {
  const id = nanoid(10);
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Validates if a string is a valid nanoid
 * @param id - The ID to validate
 * @returns boolean indicating if the ID is valid
 */
export function isValidId(id: string): boolean {
  // Basic validation: check if it's a non-empty string
  if (!id || typeof id !== 'string') return false;

  // Check if it matches the pattern prefix_nanoid or just nanoid
  const pattern = /^([a-z]+_)?[A-Za-z0-9_-]+$/;
  return pattern.test(id);
}
