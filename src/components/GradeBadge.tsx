import { Grade, GRADE_LABEL } from "@/lib/products";

const GRADE_COLOR: Record<Grade, string> = {
  A: "text-circuit",
  B: "text-signal",
  C: "text-rust",
};

export default function GradeBadge({
  grade,
  size = "md",
}: {
  grade: Grade;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={`grade-tag inline-flex items-center ${sizes[size]} ${GRADE_COLOR[grade]}`}
    >
      <span className="font-bold">GRADE {grade}</span>
      <span className="opacity-60 font-normal hidden sm:inline">
        · {GRADE_LABEL[grade]}
      </span>
    </span>
  );
}
