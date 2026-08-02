import { describe, expect, it } from "vitest";
import { fileName } from "./view";

describe("fileName", () => {
  it("returns the last path segment", () => {
    expect(fileName("backend/src/PaymentControllerTest.java")).toBe("PaymentControllerTest.java");
  });

  it("handles bare filenames", () => {
    expect(fileName("README.md")).toBe("README.md");
  });
});
