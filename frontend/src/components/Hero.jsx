export const Hero = ({ icon: Icon, badge, title, description, children, bottomPad = "pb-12", testId }) => (
  <section className="bk-hero" data-testid={testId}>
    <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 ${bottomPad}`}>
      <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 mb-6">
        <Icon className="w-3.5 h-3.5 text-[#6cb4ff]" />{badge}
      </p>
      <h1 className="bk-h1 !text-white max-w-3xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">{description}</p>
      {children}
    </div>
  </section>
);
