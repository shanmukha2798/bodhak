import { Link, useLocation, useNavigate } from "react-router-dom";

const SEGMENTS = [
  { key: "learn", label: "I want to learn", path: "/" },
  { key: "teach", label: "I teach", path: "/teach" },
  { key: "platform", label: "I'm an edtech platform", path: "/platforms" },
];

export const Nav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = pathname.startsWith("/teach") ? "teach" : pathname.startsWith("/platforms") ? "platform" : "learn";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#e5e5ea]" data-testid="top-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link to="/" className="text-[26px] font-bold tracking-tight text-[#0A2540] leading-none" data-testid="bodhak-wordmark">
          Bodhak
        </Link>
        <div
          role="tablist"
          aria-label="Who are you?"
          className="bg-[#e8e8ed]/80 p-1 rounded-full inline-flex items-center gap-1 border border-black/[0.04] self-start sm:self-auto overflow-x-auto max-w-full"
          data-testid="role-segmented-control"
        >
          {SEGMENTS.map((s) => {
            const isActive = active === s.key;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => navigate(s.path)}
                data-testid={`segment-${s.key}`}
                className={`whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-[background-color,color,box-shadow] duration-200 ${
                  isActive ? "bg-white text-[#1d1d1f] font-semibold shadow-sm" : "text-[#6e6e73] hover:text-[#1d1d1f] font-medium"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
