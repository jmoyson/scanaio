/**
 * Domain Validation Utilities
 *
 * Shared validation logic for domain format checking.
 * Used by both client-side (form validation) and server-side (route protection).
 */

/**
 * Validate domain format
 *
 * Rules:
 * - Must look like a valid domain (e.g., example.com, sub.example.co.uk)
 * - Rejects file extensions that browsers/crawlers request
 * - Rejects obviously invalid patterns
 */
export function isValidDomain(domain: string): boolean {
  // Must be a non-empty string
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Reject common file extensions that browsers/crawlers request
  if (/\.(png|ico|svg|jpg|jpeg|gif|webp|txt|xml|json|js|css|map|woff|woff2|ttf|eot)$/i.test(domain)) {
    return false;
  }

  // Reject paths (anything with a slash)
  if (domain.includes('/')) {
    return false;
  }

  // Must have at least one dot (domain.tld)
  if (!domain.includes('.')) {
    return false;
  }

  // Basic domain format: alphanumeric, hyphens, dots
  // More permissive than strict RFC but catches obvious junk
  return /^[a-zA-Z0-9][a-zA-Z0-9.-]{0,253}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);
}

/**
 * Clean and normalize a domain input
 *
 * Removes common prefixes and trailing slashes:
 * - https://www.example.com/ -> example.com
 * - http://example.com -> example.com
 * - www.example.com -> example.com
 */
export function cleanDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, ''); // Remove path and everything after
}
