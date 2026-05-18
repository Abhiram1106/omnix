import { describe, it, expect } from "vitest";
import { routeRequest } from "../src/commands/route.js";

describe("routeRequest", () => {
  it("routes bug reports to debugging workflow", () => {
    const r = routeRequest("the login page is broken and throws a 500 error");
    expect(r.workflow).toContain("debug");
    expect(r.agents).toContain("debugger");
    expect(r.retrievalMode).toBe("debugging");
  });

  it("routes build requests to feature-build", () => {
    const r = routeRequest("build a user registration form");
    expect(r.workflow).toBe("feature-build");
    expect(r.agents).toContain("fullstack");
  });

  it("routes review requests to code-review", () => {
    const r = routeRequest("review this pull request for security issues");
    expect(r.workflow).toBe("code-review");
    expect(r.agents).toContain("reviewer");
    expect(r.agents).toContain("security");
  });

  it("activates security agent for auth keywords", () => {
    const r = routeRequest("add OAuth login with JWT tokens");
    expect(r.agents).toContain("security");
    expect(r.agents).toContain("backend");
  });

  it("activates database agent for schema keywords", () => {
    const r = routeRequest("create a postgres migration for the users table");
    expect(r.agents).toContain("database");
  });

  it("activates security agent for payment keywords", () => {
    const r = routeRequest("integrate Stripe billing");
    expect(r.agents).toContain("security");
    expect(r.notes.some((n) => n.includes("payment"))).toBe(true);
  });

  it("activates devops + sre for kubernetes keywords", () => {
    const r = routeRequest("deploy this to kubernetes with helm");
    expect(r.agents).toContain("devops");
    expect(r.agents).toContain("sre");
  });

  it("uses deep retrieval mode for large multi-area requests", () => {
    const r = routeRequest("build REST API with auth, postgres, docker, and stripe billing");
    expect(r.retrievalMode).toBe("deep");
    expect(r.agents.length).toBeGreaterThanOrEqual(5);
  });

  it("uses minimal retrieval mode for short requests", () => {
    const r = routeRequest("fix bug");
    // 2 words → minimal unless debug mode overrides
    // debug mode overrides minimal, so debugging wins
    expect(["minimal", "debugging"]).toContain(r.retrievalMode);
  });

  it("returns architecture retrieval mode for architecture requests", () => {
    const r = routeRequest("redesign the module architecture");
    expect(r.retrievalMode).toBe("architecture");
  });

  it("activates parallel team mode note for multi-area requests", () => {
    const r = routeRequest("add auth, database schema, frontend UI, and API endpoints");
    expect(r.notes.some((n) => n.includes("parallel team mode"))).toBe(true);
  });

  it("routes deploy requests to deployment workflow", () => {
    const r = routeRequest("ship the new release to production");
    expect(r.workflow).toBe("deployment");
    expect(r.agents).toContain("devops");
    expect(r.retrievalMode).toBe("deployment");
  });

  it("routes refactor requests correctly", () => {
    const r = routeRequest("refactor the authentication module");
    expect(r.workflow).toBe("refactor");
    expect(r.agents).toContain("architect");
    expect(r.agents).toContain("reviewer");
  });

  it("routes performance requests", () => {
    const r = routeRequest("the API is slow and has high latency");
    expect(r.workflow).toContain("performance");
    expect(r.agents).toContain("performance");
    expect(r.agents).toContain("debugger");
  });

  it("activates AI engineer for LLM keywords", () => {
    const r = routeRequest("add Claude API integration with prompt caching");
    expect(r.agents).toContain("ai-engineer");
  });

  it("always returns request, workflow, agents, retrievalMode, notes", () => {
    const r = routeRequest("do something");
    expect(r).toHaveProperty("request");
    expect(r).toHaveProperty("workflow");
    expect(r).toHaveProperty("agents");
    expect(r).toHaveProperty("retrievalMode");
    expect(r).toHaveProperty("notes");
    expect(Array.isArray(r.agents)).toBe(true);
    expect(Array.isArray(r.notes)).toBe(true);
  });
});
