import { Link } from "react-router-dom";
import { BadgeCheck, MessageSquareText, Briefcase } from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";

export const Avatar = ({ src, name, className = "w-14 h-14" }) => (
  <img
    src={src}
    alt={name}
    loading="lazy"
    className={`${className} rounded-full bg-[#f5f5f7] object-cover border border-black/[0.06] shrink-0`}
  />
);

export const InstructorCard = ({ instructor: i, extra, index = 0 }) => (
  <Link
    to={`/instructor/${i.id}`}
    className="bk-card bk-card-hover p-6 flex flex-col gap-4 fade-up focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
    style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    data-testid={`instructor-card-${i.id}`}
  >
    <div className="flex items-start gap-4">
      <Avatar src={i.avatar} name={i.name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-[#1d1d1f] truncate" data-testid="card-name">{i.name}</h3>
          {i.verified && <BadgeCheck className="w-4 h-4 text-[#0071e3] shrink-0" aria-label="Verified instructor" />}
        </div>
        <p className="text-sm text-[#86868b] leading-snug line-clamp-2">{i.headline}</p>
      </div>
      <ScoreBadge score={i.bodhak_score} testId={`card-score-${i.id}`} />
    </div>

    {extra}

    <div className="flex flex-wrap gap-1.5">
      {i.skills.slice(0, 3).map((s) => (
        <span key={s} className="bk-chip">{s}</span>
      ))}
    </div>

    <div className="flex items-center justify-between text-xs text-[#6e6e73] pt-1 border-t border-[#f0f0f2] mt-auto">
      <span className="inline-flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{i.years_experience} yrs experience</span>
      <span className="inline-flex items-center gap-1" data-testid={`card-stories-${i.id}`}>
        <MessageSquareText className="w-3.5 h-3.5" />{i.story_count} {i.story_count === 1 ? "story" : "stories"}
      </span>
    </div>
    <div className="flex flex-wrap gap-1">
      {i.platforms.map((p) => (
        <span key={p.name} className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#e5e5ea] text-[#6e6e73]">{p.name}</span>
      ))}
    </div>
  </Link>
);
