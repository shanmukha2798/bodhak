import { Info, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const HowCalculated = ({ testId = "score-how-calculated" }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label="How is this calculated?"
        className="inline-flex items-center gap-1 text-xs text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        data-testid={testId}
      >
        <Info className="w-3.5 h-3.5" /> How is this calculated?
      </button>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs text-xs leading-relaxed">
      The Bodhak Score is the average of all learner story ratings for this instructor across every platform, out of 5.
    </TooltipContent>
  </Tooltip>
);

export const ScoreBadge = ({ score, size = "sm", testId = "bodhak-score" }) => {
  const big = size === "lg";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold bg-[#e8f2ff] text-[#0071e3] ${big ? "px-4 py-1.5 text-lg" : "px-2.5 py-1 text-sm"}`}
      data-testid={testId}
      title="Bodhak Score"
    >
      <Star className={`${big ? "w-5 h-5" : "w-3.5 h-3.5"} fill-current`} />
      {score == null ? "New" : score.toFixed(1)}
    </span>
  );
};

export const Stars = ({ value, onChange, size = "w-4 h-4", testIdPrefix = "star" }) => (
  <span className="inline-flex items-center gap-0.5" data-testid={`${testIdPrefix}-rating`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange && onChange(n)}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        data-testid={`${testIdPrefix}-${n}`}
        className={`${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
      >
        <Star className={`${size} ${n <= value ? "fill-[#ff9500] text-[#ff9500]" : "text-[#d2d2d7]"}`} />
      </button>
    ))}
  </span>
);
