/**
 * Redact secrets from text before writing to vault or disk.
 * Patterns cover the most common accidental leaks.
 */

const REDACTION = "[REDACTED]";

/**
 * Simple patterns: match the whole secret, replace with REDACTION.
 * No capture groups — the entire match is replaced.
 */
const SIMPLE_PATTERNS: RegExp[] = [
  // OpenAI / Anthropic / generic sk- keys
  /sk-[A-Za-z0-9_\-]{20,}/g,
  // Stripe publishable + secret keys
  /pk_(live|test)_[A-Za-z0-9]{20,}/g,
  /sk_(live|test)_[A-Za-z0-9]{20,}/g,
  // GitHub tokens (classic + fine-grained)
  /ghp_[A-Za-z0-9]{36,}/g,
  /github_pat_[A-Za-z0-9_]{80,}/g,
  // AWS access key IDs
  /AKIA[0-9A-Z]{16}/g,
  // Slack tokens
  /xox[baprs]-[A-Za-z0-9\-]{10,}/g,
  // JWTs (three base64url segments starting with ey)
  /ey[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/g,
  // Database connection strings with passwords (postgres/mysql/mongodb/redis)
  /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/[^:]+:[^@\s]+@[^\s"']+/gi,
];

/**
 * PEM private keys — must be handled per-block to avoid over-redaction when
 * multiple keys appear in the same text. Uses a targeted non-greedy match
 * anchored to each BEGIN/END pair.
 */
const PEM_PATTERN = /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----(?:[\r\n]|.)*?-----END (?:[A-Z]+ )*PRIVATE KEY-----/g;

/**
 * .env secret lines: KEY=value → KEY=[REDACTED]
 * Group 1 captures the key name so we preserve it.
 */
const ENV_PATTERN = /^([A-Z_]{4,}(?:_KEY|_SECRET|_TOKEN|_PASSWORD|_PASS|_PWD|_API_KEY|_PRIVATE))\s*=\s*.+$/gm;

/**
 * Redact known secret patterns from `text`.
 * Returns sanitized string safe to write to the vault.
 */
export function sanitize(text: string): string {
  let out = text;

  // Simple full-match redactions
  for (const pattern of SIMPLE_PATTERNS) {
    pattern.lastIndex = 0;
    out = out.replace(pattern, REDACTION);
  }

  // PEM key blocks — redact entire block but leave surrounding text intact
  PEM_PATTERN.lastIndex = 0;
  out = out.replace(PEM_PATTERN, `-----BEGIN PRIVATE KEY-----\n${REDACTION}\n-----END PRIVATE KEY-----`);

  // .env lines — keep key name, redact value
  ENV_PATTERN.lastIndex = 0;
  out = out.replace(ENV_PATTERN, (_, key: string) => `${key}=${REDACTION}`);

  return out;
}
