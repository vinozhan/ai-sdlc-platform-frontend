import { describe, expect, it } from "vitest";
import { asRisk } from "./risk";

describe("asRisk", () => {
  it("marks low scores as auto-apply", () => {
    expect(asRisk(0).label).toBe("auto-apply");
    expect(asRisk(29).badge).toBe("success");
  });

  it("marks mid scores as review", () => {
    expect(asRisk(30).label).toBe("review");
    expect(asRisk(70).badge).toBe("warning");
  });

  it("marks high scores as held", () => {
    expect(asRisk(71).label).toBe("held");
    expect(asRisk(100).badge).toBe("error");
  });
});
