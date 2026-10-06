import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createInstructor, updateInstructor } from "@/lib/api";

const blank = { name: "", headline: "", bio: "", years_experience: "", industry_role: "", category: "", domain: "Software & Data", skills: "", platforms: [{ name: "Udemy", courses: "" }], batches: [] };

const toForm = (i) => i ? {
  name: i.name, headline: i.headline, bio: i.bio || "", years_experience: i.years_experience, industry_role: i.industry_role || "", category: i.category || "", domain: i.domain || "Software & Data",
  skills: i.skills.join(", "), platforms: i.platforms.map((p) => ({ name: p.name, courses: p.courses.join(", ") })),
  batches: i.batches.map((b) => ({ ...b })),
} : blank;

const split = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);

const Row = ({ label, htmlFor, children }) => (
  <div><label className="bk-label" htmlFor={htmlFor}>{label}</label>{children}</div>
);

export const ProfileForm = ({ instructor, meta, onSaved }) => {
  const [form, setForm] = useState(toForm(instructor));
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(toForm(instructor)), [instructor]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setList = (key, idx, field, value) => setForm((f) => ({ ...f, [key]: f[key].map((r, n) => (n === idx ? { ...r, [field]: value } : r)) }));
  const removeAt = (key, idx) => setForm((f) => ({ ...f, [key]: f[key].filter((_, n) => n !== idx) }));
  const platformNames = meta?.platforms || [];

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter your name.");
    const body = {
      ...form, years_experience: Number(form.years_experience) || 0, skills: split(form.skills),
      platforms: form.platforms.filter((p) => p.name.trim()).map((p) => ({ name: p.name.trim(), courses: split(p.courses) })),
      batches: form.batches.filter((b) => b.course.trim()),
    };
    setSaving(true);
    try {
      const saved = instructor ? await updateInstructor(instructor.id, body) : await createInstructor(body);
      toast.success(instructor ? "Your public profile is updated." : "Your profile is live. Learners can now find you.");
      onSaved(saved);
    } catch {
      toast.error("We couldn't save your profile. Please check the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bk-card p-6 sm:p-8 space-y-6" data-testid="profile-form">
      <div>
        <h2 className="text-lg font-semibold">{instructor ? "Edit your public profile" : "Create your public profile"}</h2>
        <p className="text-sm text-[#86868b]">This is exactly what learners see. Saving updates it immediately.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Row label="Full name" htmlFor="pf-name"><input id="pf-name" className="bk-input" value={form.name} onChange={set("name")} placeholder="e.g. Rohan Mehta" data-testid="profile-name-input" /></Row>
        <Row label="Headline (one line about how you teach)" htmlFor="pf-headline"><input id="pf-headline" className="bk-input" value={form.headline} onChange={set("headline")} placeholder="e.g. Builds data pipelines by day, teaches them by night" data-testid="profile-headline-input" /></Row>
        <Row label="Years of experience" htmlFor="pf-years"><input id="pf-years" type="number" min="0" className="bk-input" value={form.years_experience} onChange={set("years_experience")} data-testid="profile-years-input" /></Row>
        <Row label="Current or past industry role" htmlFor="pf-role"><input id="pf-role" className="bk-input" value={form.industry_role} onChange={set("industry_role")} placeholder="e.g. Staff Engineer, Razorpay" data-testid="profile-role-input" /></Row>
        <Row label="Domain" htmlFor="pf-domain">
          <select id="pf-domain" className="bk-input" value={form.domain} onChange={set("domain")} data-testid="profile-domain-select">
            {(meta?.domains || ["Software & Data"]).map((d) => <option key={d}>{d}</option>)}
          </select>
        </Row>
        <Row label="Main area you teach" htmlFor="pf-category">
          <input id="pf-category" list="pf-categories" className="bk-input" value={form.category} onChange={set("category")} placeholder="e.g. Data Engineering" data-testid="profile-category-input" />
          <datalist id="pf-categories">{(meta?.categories || []).map((c) => <option key={c} value={c} />)}</datalist>
        </Row>
        <Row label="Skills (comma separated)" htmlFor="pf-skills"><input id="pf-skills" className="bk-input" value={form.skills} onChange={set("skills")} placeholder="e.g. Apache Spark, Airflow, SQL" data-testid="profile-skills-input" /></Row>
      </div>
      <Row label="Short bio" htmlFor="pf-bio"><textarea id="pf-bio" rows={3} className="bk-input resize-none" value={form.bio} onChange={set("bio")} placeholder="Two or three sentences about your background and teaching style." data-testid="profile-bio-input" /></Row>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="bk-label mb-0">Platforms and the courses you teach there</span>
          <button type="button" className="bk-btn-link" onClick={() => setForm((f) => ({ ...f, platforms: [...f.platforms, { name: "", courses: "" }] }))} data-testid="add-platform-button"><Plus className="w-4 h-4" />Add a platform</button>
        </div>
        <div className="space-y-2">
          {form.platforms.map((p, n) => (
            <div key={n} className="grid sm:grid-cols-[180px_1fr_auto] gap-2 items-center">
              <input list="pf-platforms" className="bk-input" value={p.name} onChange={(e) => setList("platforms", n, "name", e.target.value)} placeholder="Platform" data-testid={`platform-name-${n}`} />
              <input className="bk-input" value={p.courses} onChange={(e) => setList("platforms", n, "courses", e.target.value)} placeholder="Courses, comma separated" data-testid={`platform-courses-${n}`} />
              <button type="button" aria-label="Remove platform" className="p-2 text-[#86868b] hover:text-red-500 transition-colors" onClick={() => removeAt("platforms", n)} data-testid={`remove-platform-${n}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <datalist id="pf-platforms">{platformNames.map((p) => <option key={p} value={p} />)}</datalist>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="bk-label mb-0">Upcoming batches</span>
          <button type="button" className="bk-btn-link" onClick={() => setForm((f) => ({ ...f, batches: [...f.batches, { course: "", platform: f.platforms[0]?.name || "", start_date: "", mode: "Online" }] }))} data-testid="add-batch-button"><Plus className="w-4 h-4" />Add a batch</button>
        </div>
        {form.batches.length === 0 && <p className="text-sm text-[#86868b]">No upcoming batches yet. Add one so learners know when they can join.</p>}
        <div className="space-y-2">
          {form.batches.map((b, n) => (
            <div key={n} className="grid sm:grid-cols-[1fr_160px_150px_130px_auto] gap-2 items-center">
              <input className="bk-input" value={b.course} onChange={(e) => setList("batches", n, "course", e.target.value)} placeholder="Course" data-testid={`batch-course-${n}`} />
              <input list="pf-platforms" className="bk-input" value={b.platform} onChange={(e) => setList("batches", n, "platform", e.target.value)} placeholder="Platform" data-testid={`batch-platform-${n}`} />
              <input type="date" className="bk-input" value={b.start_date} onChange={(e) => setList("batches", n, "start_date", e.target.value)} data-testid={`batch-date-${n}`} />
              <select className="bk-input" value={b.mode} onChange={(e) => setList("batches", n, "mode", e.target.value)} data-testid={`batch-mode-${n}`}>
                {["Online", "Offline", "Weekend"].map((m) => <option key={m}>{m}</option>)}
              </select>
              <button type="button" aria-label="Remove batch" className="p-2 text-[#86868b] hover:text-red-500 transition-colors" onClick={() => removeAt("batches", n)} data-testid={`remove-batch-${n}`}><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bk-btn-primary px-6 py-3" disabled={saving} data-testid="profile-save-button">
          {saving ? "Saving…" : instructor ? "Save and update my public profile" : "Create my public profile"}
        </button>
      </div>
    </form>
  );
};
