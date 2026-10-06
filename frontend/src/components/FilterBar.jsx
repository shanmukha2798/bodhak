import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1 min-w-[150px] flex-1">
    <span className="bk-label mb-0">{label}</span>
    {children}
  </div>
);

const Pick = ({ value, onChange, options, allLabel, testId }) => (
  <Select value={value || "__all"} onValueChange={(v) => onChange(v === "__all" ? "" : v)}>
    <SelectTrigger className="rounded-full h-10 bg-white border-[#d2d2d7]" data-testid={testId}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="max-h-72">
      <SelectItem value="__all">{allLabel}</SelectItem>
      {options.map((o) => (
        <SelectItem key={o.value ?? o} value={String(o.value ?? o)}>{o.label ?? o}</SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const FilterBar = ({ filters, setFilters, meta, resultCount }) => {
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  const hasFilters = filters.domain || filters.skill || filters.platform || filters.min_rating || filters.min_years;
  const domains = ["All", ...(meta?.domains || [])];
  return (
    <div className="bk-card p-5 sm:p-6 flex flex-col gap-4" data-testid="filter-bar">
      <div>
        <span className="bk-label">Domain</span>
        <div className="flex flex-wrap gap-2" data-testid="domain-filter">
          {domains.map((d) => {
            const active = d === "All" ? !filters.domain : filters.domain === d;
            return (
              <button key={d} type="button" onClick={() => set("domain")(d === "All" ? "" : d)} aria-pressed={active}
                data-testid={`domain-pill-${d.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className={`${active ? "bk-btn-primary" : "bk-btn-outline"} px-4 py-2 text-sm`}>
                {d}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Field label="Skill"><Pick value={filters.skill} onChange={set("skill")} options={meta?.skills || []} allLabel="Any skill" testId="filter-skill" /></Field>
        <Field label="Platform"><Pick value={filters.platform} onChange={set("platform")} options={meta?.platforms || []} allLabel="Any platform" testId="filter-platform" /></Field>
        <Field label="Minimum rating">
          <Pick value={filters.min_rating} onChange={set("min_rating")} allLabel="Any rating" testId="filter-min-rating"
            options={[{ value: "4.5", label: "4.5 and above" }, { value: "4", label: "4.0 and above" }, { value: "3.5", label: "3.5 and above" }]} />
        </Field>
        <Field label="Experience">
          <Pick value={filters.min_years} onChange={set("min_years")} allLabel="Any experience" testId="filter-min-years"
            options={[{ value: "5", label: "5+ years" }, { value: "10", label: "10+ years" }, { value: "15", label: "15+ years" }]} />
        </Field>
        <Field label="Sort by">
          <Select value={filters.sort} onValueChange={set("sort")}>
            <SelectTrigger className="rounded-full h-10 bg-white border-[#d2d2d7]" data-testid="sort-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Bodhak Score, highest first</SelectItem>
              <SelectItem value="stories">Most learner stories</SelectItem>
              <SelectItem value="years">Most experience</SelectItem>
              <SelectItem value="name">Name, A to Z</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="flex items-center justify-between text-sm text-[#6e6e73]">
        <span data-testid="result-count">{resultCount == null ? "Loading instructors…" : `Showing ${resultCount} instructor${resultCount === 1 ? "" : "s"}`}</span>
        {hasFilters && (
          <button className="bk-btn-link" onClick={() => setFilters((f) => ({ sort: f.sort }))} data-testid="clear-filters-button">Clear all filters</button>
        )}
      </div>
    </div>
  );
};
