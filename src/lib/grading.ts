export type Grade = "A" | "B" | "C";

export const GRADE_LABEL: Record<Grade, string> = {
  A: "Looks new",
  B: "Light wear",
  C: "Well used",
};

export const GRADE_DESC: Record<Grade, string> = {
  A: "No visible scratches beyond 30cm. Screen and body like new.",
  B: "Minor scuffs on the body, screen is clean. Works perfectly.",
  C: "Visible wear and scratches. Fully functional, priced for it.",
};
