"use client";

import { Instagram, Mail, MoveRight } from "lucide-react";
import { offerings, testimonials, workshops } from "@/lib/data";
import { FadeUp, MotionDiv, MotionSection, Parallax } from "@/components/MotionPrimitives";
import { Navbar } from "@/components/Navbar";
import { OrganicVisual } from "@/components/OrganicVisual";
import { SectionHeading } from "@/components/SectionHeading";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Home() {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="relative overflow-hidden">
        <Hero />
        <About />
        <Services />
        <Philosophy />
        <Workshops />
        <Testimonials />
        <OnlineCoaching />
        <Contact />
      </main>
      <Footer />
    </ThemeProvider>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden px-4 pb-16 pt-32 md:pt-40">
      <div className="absolute inset-0 -z-10">
        <MotionDiv
          className="absolute left-[8%] top-[14%] h-72 w-72 organic-radius bg-sage/50 blur-2xl"
          animate={{ y: [0, -24, 0], x: [0, 16, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <MotionDiv
          className="absolute right-[5%] top-[20%] h-96 w-96 organic-radius bg-blush/35 blur-2xl"
          animate={{ y: [0, 30, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <MotionDiv
          className="absolute bottom-[8%] left-[38%] h-80 w-80 organic-radius bg-terracotta/20 blur-2xl"
          animate={{ x: [0, -22, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="section-shell grid min-h-[calc(100vh-8rem)] items-center gap-12 lg:grid-cols-[1fr_0.78fr]">
        <div>
          <FadeUp>
            <p className="mb-5 inline-flex rounded-full border border-coffee_bean-500/15 bg-linen/55 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.32em] text-moss shadow-innerGlow backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-sage">
              Yoga | Strength | Mobility
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-balance font-serif text-[clamp(4.4rem,12vw,10.5rem)] font-medium leading-[0.78] text-forest dark:text-linen">
              Strength that feels like coming home.
            </h1>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="mt-8 max-w-2xl text-lg leading-9 text-[color:var(--muted)] md:text-xl">
              Grounded coaching for real transformation: yoga, strength training,
              mobility, prehab and rehab-informed movement, and sustainable fitness
              that does not ask you to punish your body into change.
            </p>
          </FadeUp>
          <FadeUp delay={0.24} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#services"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-bark px-7 text-sm font-extrabold text-linen shadow-earthy transition hover:-translate-y-0.5 hover:bg-walnut"
            >
              Start Coaching
              <MoveRight className="transition group-hover:translate-x-1" size={18} />
            </a>
            <a
              href="#workshops"
              className="inline-flex h-14 items-center justify-center rounded-full border border-coffee_bean-500/20 bg-linen/50 px-7 text-sm font-extrabold text-bark backdrop-blur transition hover:-translate-y-0.5 hover:bg-blush/45 dark:border-white/10 dark:bg-white/5 dark:text-linen"
            >
              Explore Classes
            </a>
          </FadeUp>
        </div>

        <FadeUp delay={0.18}>
          <OrganicVisual />
        </FadeUp>
      </div>

      <div className="section-shell mt-6 flex items-center justify-between border-t border-forest/10 pt-6 text-xs uppercase tracking-[0.28em] text-moss/80 dark:border-white/10 dark:text-sage/75">
        <span>Grounded strength</span>
        <span className="hidden md:inline">Emotional safety</span>
        <span>Real consistency</span>
      </div>
    </section>
  );
}

function About() {
  const credentials = [
    "Certified yoga teacher",
    "Strength and personal training",
    "Prehab and rehab-informed",
    "PCOS-aware movement coaching"
  ];

  return (
    <MotionSection id="about" className="relative py-24 md:py-32">
      <Parallax offset={-85} className="pointer-events-none absolute right-0 top-16 -z-10 h-96 w-96 organic-radius bg-sage/18 blur-3xl" />
      <div className="section-shell grid gap-12 lg:grid-cols-[0.82fr_1fr]">
        <FadeUp className="glass-panel rounded-[34px] p-7 md:p-10">
          <div className="wood-panel mb-8 min-h-72 rounded-[28px] p-6 text-linen">
            <p className="font-serif text-5xl leading-[0.95]">I know what it means to rebuild trust from the inside.</p>
          </div>
          <div className="grid gap-3">
            {credentials.map((item) => (
              <div key={item} className="rounded-full border border-coffee_bean-500/12 bg-linen/52 px-4 py-3 text-sm font-bold text-bark dark:border-white/10 dark:bg-white/5 dark:text-linen">
                {item}
              </div>
            ))}
          </div>
        </FadeUp>

        <div>
          <SectionHeading
            eyebrow="About me"
            title="A coaching practice shaped by lived transformation."
            copy="Before coaching, I moved through obesity, bullying, PCOS, low confidence, toxic fitness spaces, and corporate burnout. Movement became the place where I reclaimed strength without losing softness."
          />
          <FadeUp className="space-y-6 text-lg leading-9 text-[color:var(--muted)]">
            <p>
              This work is personal. I do not teach from the fantasy that discipline means
              ignoring your body. I teach from the belief that strength becomes sustainable
              when the body feels respected, informed, and safe enough to keep showing up.
            </p>
            <p>
              My sessions blend yoga, functional strength, mobility, recovery, prehab principles,
              and nervous-system friendly pacing. The goal is not a perfect body. The goal is
              a more capable, confident, resilient relationship with movement.
            </p>
          </FadeUp>
        </div>
      </div>
    </MotionSection>
  );
}

function Services() {
  return (
    <section id="services" className="relative bg-gradient-to-b from-linen/42 via-almond_cream-600/36 to-cream/48 py-24 dark:from-white/[0.03] dark:via-white/[0.02] dark:to-white/[0.03] md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Services"
          title="Coaching for strength, recovery, confidence, and consistency."
          copy="A practical movement ecosystem for people who want intelligent training, emotional safety, and real progress without toxic fitness culture."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {offerings.map((offering, index) => {
            const Icon = offering.icon;
            return (
              <FadeUp key={offering.title} delay={index * 0.04}>
                <article className={`group min-h-72 rounded-[30px] border border-coffee_bean-500/12 bg-gradient-to-br ${offering.tone} p-7 shadow-soft transition duration-500 hover:-translate-y-2 hover:shadow-earthy dark:border-white/10 dark:from-white/8 dark:to-white/[0.03]`}>
                  <div className="mb-8 grid h-14 w-14 place-items-center rounded-full bg-linen/62 text-bark shadow-innerGlow transition group-hover:rotate-6 group-hover:scale-105 dark:bg-white/10 dark:text-sage">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-serif text-4xl leading-none text-forest dark:text-linen">{offering.title}</h3>
                  <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">{offering.description}</p>
                </article>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  const principles = [
    {
      label: "Movement without punishment",
      copy: "Fitness should not depend on shame, exhaustion, comparison, or fear."
    },
    {
      label: "Strong does not mean harsh",
      copy: "Progress can be structured, challenging, feminine, grounded, and kind at the same time."
    },
    {
      label: "The nervous system matters",
      copy: "Breath, recovery, stress, and energy are part of the training plan, not an afterthought."
    }
  ];

  return (
    <section className="relative py-24 md:py-32">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <FadeUp className="sticky top-28 h-fit">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.32em] text-terracotta">
            Philosophy
          </p>
          <h2 className="text-balance font-serif text-5xl leading-[0.95] text-forest dark:text-linen md:text-7xl">
            Fitness can be honest, intelligent, and emotionally safe.
          </h2>
        </FadeUp>
        <div className="space-y-5">
          {principles.map((principle, index) => (
            <FadeUp key={principle.label} delay={index * 0.06}>
              <article className="glass-panel rounded-[30px] p-7 md:p-9">
                <span className="text-xs font-extrabold uppercase tracking-[0.28em] text-sage dark:text-clay">
                  0{index + 1}
                </span>
                <h3 className="mt-5 font-serif text-4xl leading-none text-bark dark:text-linen">
                  {principle.label}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  {principle.copy}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Workshops() {
  return (
    <section id="workshops" className="py-24 md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Workshops"
          title="Workshops for real bodies, real stress, and real life."
          copy="Intimate learning spaces for strength, mobility, recovery, PCOS-aware training, and rebuilding body trust."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {workshops.map((workshop, index) => (
            <FadeUp key={workshop.title} delay={index * 0.06}>
              <article className="glass-panel flex min-h-80 flex-col rounded-[30px] p-7 transition duration-500 hover:-translate-y-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.32em] text-clay">{workshop.date}</p>
                <h3 className="mt-8 font-serif text-4xl leading-none text-forest dark:text-linen">{workshop.title}</h3>
                <p className="mt-5 flex-1 text-sm leading-7 text-[color:var(--muted)]">{workshop.description}</p>
                <a href="#contact" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-forest dark:text-sage">
                  Reserve interest <MoveRight size={16} />
                </a>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="bg-gradient-to-br from-bark via-walnut to-coffee_bean-300 py-24 text-linen md:py-32">
      <div className="section-shell">
        <SectionHeading
          eyebrow="Testimonials"
          title="Community proof that feels human, warm, and real."
          copy="A space for WhatsApp notes, online class screenshots, and honest coaching moments that show trust, not perfection."
          inverse
        />
        <div className="grid items-start gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeUp key={testimonial.name} delay={index * 0.06}>
              <article className={`screenshot-grain rounded-[30px] border border-white/10 bg-linen p-4 text-bark shadow-earthy transition duration-500 hover:-translate-y-2 ${index === 1 ? "md:mt-12" : ""}`}>
                <div className="rounded-[24px] bg-dusty_olive-900 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-sage">
                    {testimonial.type}
                  </p>
                  <div className="mt-5 rounded-[20px] bg-linen/86 p-5 shadow-innerGlow">
                    <p className="font-serif text-3xl leading-tight">"{testimonial.quote}"</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-bark/10 px-2 pt-5">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-bark/62">{testimonial.detail}</p>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
        <FadeUp className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="screenshot-grain rounded-[30px] border border-white/10 bg-white/[0.07] p-5 shadow-soft">
            <div className="grid min-h-64 place-items-center rounded-[24px] border border-dashed border-linen/22 bg-gradient-to-br from-sage/42 via-walnut/34 to-bark">
              <div className="text-center">
                <p className="font-serif text-4xl">Online class screenshot</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-linen/62">
                  Replace this with a real group class moment when ready.
                </p>
              </div>
            </div>
          </div>
          <div className="screenshot-grain rounded-[30px] border border-white/10 bg-white/[0.07] p-5 shadow-soft">
            <div className="min-h-64 rounded-[24px] bg-linen p-5 text-bark">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-terracotta">
                Community moment
              </p>
              <div className="mt-6 space-y-3">
                <div className="ml-auto max-w-[82%] rounded-2xl bg-dusty_olive-900 p-4 text-sm">
                  Today was the first time I did not feel judged in a class.
                </div>
                <div className="max-w-[82%] rounded-2xl bg-white p-4 text-sm">
                  That matters. We build from safety first, then strength.
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function OnlineCoaching() {
  return (
    <section className="py-24 md:py-32">
      <div className="section-shell grid items-center gap-8 rounded-[38px] border border-coffee_bean-500/10 bg-gradient-to-br from-sage/42 via-blush/38 to-almond_cream-600/62 p-6 shadow-earthy dark:border-white/10 dark:from-white/[0.06] dark:via-white/[0.03] dark:to-white/[0.04] md:grid-cols-[1fr_0.72fr] md:p-10">
        <FadeUp>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.32em] text-sage dark:text-clay">
            Online coaching and classes
          </p>
          <h2 className="font-serif text-5xl leading-none text-forest dark:text-linen md:text-6xl">
            Structured support when life is full, stressful, and imperfect.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
            Online coaching includes movement plans, strength progressions, yoga and mobility
            sessions, form feedback, recovery notes, and compassionate accountability for
            sustainable change.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {["Form feedback", "Weekly structure", "PCOS-aware pacing", "Community support"].map((item) => (
              <span key={item} className="rounded-full border border-coffee_bean-500/12 bg-linen/56 px-4 py-2 text-sm font-bold text-bark dark:border-white/10 dark:bg-white/5 dark:text-linen">
                {item}
              </span>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={0.08}>
          <div className="wood-panel rounded-[30px] p-6 text-linen">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-clay">Weekly rhythm</p>
            <div className="mt-8 space-y-5">
              {["Train", "Recover", "Reflect", "Repeat"].map((item) => (
                <div key={item} className="flex items-center justify-between border-b border-linen/14 pb-4">
                  <span className="font-serif text-4xl">{item}</span>
                  <span className="h-3 w-3 rounded-full bg-moss" />
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Begin with your real starting point."
            copy="Send a note about your body, your goals, your history with fitness, or the kind of support you are looking for. You do not need to arrive confident."
          />
          <FadeUp className="flex flex-col gap-3 sm:flex-row">
            <a href="https://instagram.com/yourhandle" className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-forest px-7 text-sm font-extrabold text-linen shadow-soft transition hover:-translate-y-0.5">
              <Instagram size={18} /> Message on Instagram
            </a>
            <a href="mailto:hello@yinforyoga.com" className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-forest/18 bg-white/36 px-7 text-sm font-extrabold text-forest backdrop-blur transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-linen">
              <Mail size={18} /> Email
            </a>
          </FadeUp>
        </div>
        <FadeUp delay={0.08}>
          <form className="glass-panel grid gap-4 rounded-[34px] p-5 md:p-7">
            <input className="rounded-2xl border border-forest/10 bg-white/52 px-5 py-4 text-sm outline-none transition placeholder:text-walnut/45 focus:border-moss dark:border-white/10 dark:bg-white/5 dark:placeholder:text-linen/38" placeholder="Your name" />
            <input className="rounded-2xl border border-forest/10 bg-white/52 px-5 py-4 text-sm outline-none transition placeholder:text-walnut/45 focus:border-moss dark:border-white/10 dark:bg-white/5 dark:placeholder:text-linen/38" placeholder="Email or Instagram handle" />
            <textarea className="min-h-40 resize-none rounded-2xl border border-forest/10 bg-white/52 px-5 py-4 text-sm outline-none transition placeholder:text-walnut/45 focus:border-moss dark:border-white/10 dark:bg-white/5 dark:placeholder:text-linen/38" placeholder="Tell me your goal, injury history, PCOS concerns, or what has felt hard about fitness before" />
            <button type="button" className="h-14 rounded-full bg-walnut px-7 text-sm font-extrabold text-linen transition hover:-translate-y-0.5 hover:bg-forest">
              Send Inquiry
            </button>
          </form>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-bark px-4 py-12 text-linen">
      <div className="section-shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-4xl">Strong enough to stay gentle.</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-linen/62">
            Yoga, strength, mobility, recovery, PCOS-aware training, workshops, and mindful coaching rooted in real life.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-bold text-linen/75">
          <a href="https://instagram.com/yourhandle">Instagram</a>
          <a href="mailto:hello@yinforyoga.com">Email</a>
          <a href="#services">Services</a>
          <a href="#workshops">Workshops</a>
        </div>
      </div>
    </footer>
  );
}
