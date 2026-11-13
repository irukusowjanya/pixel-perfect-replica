import { describe, expect, it } from "vitest";
import { hasEmergencySymptoms } from "@/lib/health-safety";

describe("Emergency symptom precautions", () => {
  for (const symptom of [
    "chest pain",
    "difficulty breathing",
    "sudden weakness",
    "paralysis",
    "severe bleeding",
    "loss of consciousness",
    "face droop",
    "slurred speech",
  ]) {
    it(`alerts for ${symptom}`, () => expect(hasEmergencySymptoms(`I have ${symptom}`)).toBe(true));
  }
  it("does not mark an ordinary mild cold as an emergency", () =>
    expect(hasEmergencySymptoms("I have a mild cold and runny nose")).toBe(false));
});
