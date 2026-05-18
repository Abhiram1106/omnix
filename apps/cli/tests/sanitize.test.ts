import { describe, it, expect } from "vitest";
import { sanitize } from "../src/utils/sanitize.js";

// NOTE: Test values below are deliberately constructed by concatenation so that
// GitHub push-protection does not flag them as real secrets. They are fake.

describe("sanitize()", () => {
  it("redacts OpenAI-style sk- keys", () => {
    // Concatenated so the raw string is never a real secret pattern in source
    const prefix = "sk-";
    const input = "key=" + prefix + "abcdefghijklmnopqrstuvwxyz1234567890";
    expect(sanitize(input)).not.toContain(prefix + "abc");
    expect(sanitize(input)).toContain("[REDACTED]");
  });

  it("redacts GitHub personal access tokens", () => {
    const token = "ghp_" + "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";
    const input = "token: " + token;
    expect(sanitize(input)).toContain("[REDACTED]");
    expect(sanitize(input)).not.toContain("ghp_");
  });

  it("redacts AWS access key IDs", () => {
    // Real pattern is AKIA + 16 uppercase chars; split at prefix
    const input = ["AKI", "AIOSFODNN7EXAMPLE is the key"].join("A");
    expect(sanitize(input)).toContain("[REDACTED]");
    expect(sanitize(input)).not.toContain("AKIA");
  });

  it("redacts Slack bot tokens", () => {
    const input = "token=" + "xoxb-12345-67890-abcdefghijklmno";
    expect(sanitize(input)).toContain("[REDACTED]");
  });

  it("redacts JWTs", () => {
    // Build from parts so no single string literal triggers scanner
    const h = "eyJhbGciOiJIUzI1NiJ9";
    const p = "eyJzdWIiOiJ1c2VyIn0";
    const s = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const jwt = [h, p, s].join(".");
    expect(sanitize(jwt)).toContain("[REDACTED]");
    expect(sanitize(jwt)).not.toContain("eyJ");
  });

  it("redacts postgres connection strings with passwords", () => {
    const input = "postgres://user:supersecret@localhost:5432/mydb";
    expect(sanitize(input)).toContain("[REDACTED]");
    expect(sanitize(input)).not.toContain("supersecret");
  });

  it("redacts .env secret values but keeps key names", () => {
    const input = "DATABASE_PASSWORD=hunter2\nNOT_A_SECRET=topsecret";
    const out = sanitize(input);
    expect(out).toContain("DATABASE_PASSWORD=[REDACTED]");
    expect(out).toContain("NOT_A_SECRET=[REDACTED]");
    expect(out).not.toContain("hunter2");
    expect(out).not.toContain("topsecret");
  });

  it("does not redact non-secret .env values", () => {
    const input = "APP_NAME=myapp\nPORT=3000";
    expect(sanitize(input)).toBe(input);
  });

  it("passes through normal text unchanged", () => {
    const input = "This is a normal commit message with no secrets.";
    expect(sanitize(input)).toBe(input);
  });

  it("redacts Stripe secret keys", () => {
    // sk_(live|test)_ + 20+ chars — built from parts
    const input = "sk_" + "live_" + "4eC39HqLyjWDarjtT1zdp7dc";
    expect(sanitize(input)).toContain("[REDACTED]");
  });
});
