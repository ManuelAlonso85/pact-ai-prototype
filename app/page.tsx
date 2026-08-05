"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Stage =
  | "draft"
  | "partner_days"
  | "consent"
  | "alex_proof"
  | "jordan_review"
  | "jordan_proof"
  | "alex_review"
  | "outcome";
type Speaker = "system" | "alex" | "jordan";
type PhoneId = "alex" | "jordan";

type Message = {
  id: number;
  speaker: Speaker;
  text: string;
  phone: PhoneId;
  label?: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    speaker: "system",
    phone: "alex",
    label: "PACT AI",
    text: "Ready to create a Mutual Pact? Define your terms to begin.",
  },
  {
    id: 2,
    speaker: "system",
    phone: "jordan",
    label: "PACT AI",
    text: "Jordan will receive the invitation and choose separate commitment days.",
  },
];

const stageMeta: Record<Stage, { step: number; title: string; note: string }> = {
  draft: {
    step: 1,
    title: "Define the Mutual Pact",
    note: "Alex chooses the shared goal, Alex's commitment days, and the stake for each missed commitment.",
  },
  partner_days: {
    step: 2,
    title: "Jordan chooses separate days",
    note: "A Mutual Pact supports different schedules. Each participant should know exactly when they owe proof.",
  },
  consent: {
    step: 3,
    title: "Both people consent",
    note: "PACT AI sends personalized final terms. The pact stays inactive until both participants reply AGREE.",
  },
  alex_proof: {
    step: 4,
    title: "Alex submits proof",
    note: "On Alex's scheduled day, Alex receives the reminder and sends proof for that specific obligation.",
  },
  jordan_review: {
    step: 5,
    title: "Jordan reviews Alex",
    note: "Jordan—not an automated model—decides whether Alex's proof satisfies the pact.",
  },
  jordan_proof: {
    step: 6,
    title: "The roles reverse",
    note: "On Jordan's scheduled day, Jordan becomes the proof owner and Alex becomes the reviewer.",
  },
  alex_review: {
    step: 7,
    title: "Alex reviews Jordan",
    note: "The same proof and review rules apply to both participants in a Mutual Pact.",
  },
  outcome: {
    step: 8,
    title: "Explain a missed day",
    note: "A failure message identifies the date, amount, and unsettled balance. PACT AI records the consequence but does not move money.",
  },
};

const formatCards = [
  {
    pact: "One-Way",
    schedule: "Specific days",
    title: "One person proves on set days",
    detail: "The creator submits proof on named weekdays; the partner reviews.",
  },
  {
    pact: "One-Way",
    schedule: "Flexible weekly",
    title: "One person reaches a weekly target",
    detail: "The creator completes a target on any eligible days Monday through Sunday.",
  },
  {
    pact: "Two-Way",
    schedule: "Specific days",
    title: "Both prove on their own days",
    detail: "Each participant can choose different weekdays and reviews the other person's proof.",
    featured: true,
  },
  {
    pact: "Two-Way",
    schedule: "Flexible weekly",
    title: "Both reach the same weekly target",
    detail: "Both participants submit and review proof across a shared Monday–Sunday target.",
  },
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("draft");
  const [goal, setGoal] = useState("Exercise for at least 30 minutes");
  const [alexDays, setAlexDays] = useState("Monday, Wednesday, Friday");
  const [jordanDays, setJordanDays] = useState("Tuesday, Thursday, Saturday");
  const [stake, setStake] = useState("15");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("pact-mutual-fixed-prototype");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStage(parsed.stage ?? "draft");
        setGoal(parsed.goal ?? "Exercise for at least 30 minutes");
        setAlexDays(parsed.alexDays ?? "Monday, Wednesday, Friday");
        setJordanDays(parsed.jordanDays ?? "Tuesday, Thursday, Saturday");
        setStake(parsed.stake ?? "15");
        setMessages(parsed.messages ?? initialMessages);
      } catch {
        window.localStorage.removeItem("pact-mutual-fixed-prototype");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      "pact-mutual-fixed-prototype",
      JSON.stringify({ stage, goal, alexDays, jordanDays, stake, messages }),
    );
  }, [alexDays, goal, hydrated, jordanDays, messages, stage, stake]);

  const progress = `${stageMeta[stage].step * 12.5}%`;
  const canInvite = goal.trim().length >= 3 && Number(stake) >= 0;
  const missedDayShown = messages.some((message) => message.label?.includes("example later"));

  const status = useMemo(() => {
    if (stage === "draft") return "Draft";
    if (stage === "partner_days") return "Choosing partner days";
    if (stage === "consent") return "Awaiting consent";
    if (stage === "alex_proof") return "Active · Alex due";
    if (stage === "jordan_review") return "Alex awaiting review";
    if (stage === "jordan_proof") return "Active · Jordan due";
    if (stage === "alex_review") return "Jordan awaiting review";
    return "Active · outcome recorded";
  }, [stage]);

  function append(next: Omit<Message, "id">[]) {
    setMessages((current) => [
      ...current,
      ...next.map((message, index) => ({ ...message, id: current.length + index + 1 })),
    ]);
  }

  function inviteJordan() {
    if (!canInvite) return;
    append([
      { speaker: "alex", phone: "alex", text: "START A PACT" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Mutual Pact saved. Your partner must choose their days before both of you receive the final terms.",
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: `You were invited to a Mutual Pact. Goal: ${goal}. Stake: $${stake}. Reply CONTINUE to choose your days, or DECLINE.`,
      },
    ]);
    setStage("partner_days");
  }

  function chooseJordanDays() {
    append([
      { speaker: "jordan", phone: "jordan", text: "CONTINUE" },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Which days are YOU committing to? Reply like Mon,Wed,Fri or DAILY.",
      },
      { speaker: "jordan", phone: "jordan", text: jordanDays },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: `PACT AI Mutual Pact terms. Goal: ${goal}. Your days: ${alexDays}. Jordan's days: ${jordanDays}. Stake: $${stake} per miss. Commitment: 30 days. Reply AGREE or DECLINE.`,
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: `PACT AI Mutual Pact terms. Goal: ${goal}. Your days: ${jordanDays}. Alex's days: ${alexDays}. Stake: $${stake} per miss. Commitment: 30 days. Reply AGREE or DECLINE.`,
      },
    ]);
    setStage("consent");
  }

  function recordConsent() {
    append([
      { speaker: "alex", phone: "alex", text: "AGREE" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Agreement recorded. Waiting for Jordan to reply AGREE.",
      },
      { speaker: "jordan", phone: "jordan", text: "AGREE" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Both participants agreed. Your 30-day Mutual Pact is now active.",
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Both participants agreed. Your 30-day Mutual Pact is now active.",
      },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Morning reminder: Today is your pact day. Complete your goal and submit proof.",
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Heads up: Alex has a pact today. Expect a proof submission later.",
      },
    ]);
    setStage("alex_proof");
  }

  function submitAlexProof() {
    append([
      { speaker: "alex", phone: "alex", text: "PROOF Completed my workout" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Got it. Now send the photo (MMS) to complete your proof.",
      },
      { speaker: "alex", phone: "alex", text: "[Sends synthetic workout photo]" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Proof submitted. Jordan will review it.",
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "New proof received from Alex. Reply APPROVE or REJECT.",
      },
    ]);
    setStage("jordan_review");
  }

  function jordanApproves() {
    append([
      { speaker: "jordan", phone: "jordan", text: "APPROVE" },
      { speaker: "system", phone: "jordan", label: "PACT AI", text: "Proof approved." },
      { speaker: "system", phone: "alex", label: "PACT AI", text: "Your proof was approved." },
      { speaker: "system", phone: "alex", label: "PACT AI", text: "8/10/26: you succeeded." },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Morning reminder: Today is your pact day. Complete your goal and submit proof.",
      },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Heads up: Jordan has a pact today. Expect a proof submission later.",
      },
    ]);
    setStage("jordan_proof");
  }

  function submitJordanProof() {
    append([
      { speaker: "jordan", phone: "jordan", text: "PROOF Completed my workout" },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Got it. Now send the photo (MMS) to complete your proof.",
      },
      { speaker: "jordan", phone: "jordan", text: "[Sends synthetic workout photo]" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "New proof received from Jordan. Reply APPROVE or REJECT.",
      },
    ]);
    setStage("alex_review");
  }

  function alexApproves() {
    append([
      { speaker: "alex", phone: "alex", text: "APPROVE" },
      { speaker: "system", phone: "alex", label: "PACT AI", text: "Proof approved." },
      { speaker: "system", phone: "jordan", label: "PACT AI", text: "Your proof was approved." },
      { speaker: "system", phone: "jordan", label: "PACT AI", text: "8/11/26: you succeeded." },
    ]);
    setStage("outcome");
  }

  function showMissedDay() {
    append([
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI · example later in the pact",
        text: `8/14/26 pact failed. $${stake} was added to your unsettled balance. You will receive one payment total after this pact week closes.`,
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI · example later in the pact",
        text: `8/14/26: Alex failed. $${stake} was added to their unsettled balance. Same-date Mutual Pact failures offset; otherwise the weekly payment flow begins.`,
      },
    ]);
  }

  function resetDemo() {
    setStage("draft");
    setGoal("Exercise for at least 30 minutes");
    setAlexDays("Monday, Wednesday, Friday");
    setJordanDays("Tuesday, Thursday, Saturday");
    setStake("15");
    setMessages(initialMessages);
    window.localStorage.removeItem("pact-mutual-fixed-prototype");
  }

  function messagesFor(phone: PhoneId) {
    return messages.filter((message) => message.phone === phone);
  }

  const nextAction = {
    draft: { label: "Invite Jordan", action: inviteJordan, actor: "Alex · creator" },
    partner_days: { label: "Choose Jordan's days", action: chooseJordanDays, actor: "Jordan · participant" },
    consent: { label: "Record both agreements", action: recordConsent, actor: "Alex + Jordan" },
    alex_proof: { label: "Submit Alex's proof", action: submitAlexProof, actor: "Alex · proof owner" },
    jordan_review: { label: "Jordan replies APPROVE", action: jordanApproves, actor: "Jordan · reviewer" },
    jordan_proof: { label: "Submit Jordan's proof", action: submitJordanProof, actor: "Jordan · proof owner" },
    alex_review: { label: "Alex replies APPROVE", action: alexApproves, actor: "Alex · reviewer" },
    outcome: { label: missedDayShown ? "Missed-day example shown" : "Show a missed-day example", action: showMissedDay, actor: "PACT AI · evaluation" },
  }[stage];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PACT AI prototype home">
          <span className="brand-mark">P</span><span>PACT AI</span>
        </a>
        <div className="prototype-chip"><span /> Interactive prototype · synthetic data</div>
        <nav className="header-actions" aria-label="Primary navigation">
          <a className="text-link" href="#product-thinking">Product thinking</a>
          <a className="repository-link" href="https://github.com/ManuelAlonso85/pact-ai-prototype" target="_blank" rel="noreferrer">
            View repository <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow">SMS accountability, made concrete</div>
        <h1>A promise is easier to keep when the rules are clear.</h1>
        <p className="hero-copy">
          Walk through a Mutual Pact where both people commit on their own days, submit proof, and review each other through SMS.
        </p>
        <div className="hero-facts" aria-label="Prototype facts">
          <span>Two-Way Pact</span><span>Specific days</span><span>No payment processing</span>
        </div>
      </section>

      <section className="demo-shell" aria-labelledby="demo-title">
        <div className="demo-header">
          <div>
            <p className="section-kicker">Featured product walkthrough</p>
            <h2 id="demo-title">Try a Two-Way + Fixed Days pact</h2>
          </div>
          <button className="reset-button" onClick={resetDemo}>Reset demo</button>
        </div>

        <div className="progress-track" aria-label={`Step ${stageMeta[stage].step} of 8`}>
          <div className="progress-fill" style={{ width: progress }} />
        </div>

        <div className="demo-grid">
          <aside className="control-panel">
            <div className="step-label">Step {stageMeta[stage].step} of 8</div>
            <h3>{stageMeta[stage].title}</h3>
            <p>{stageMeta[stage].note}</p>

            <div className="pact-card">
              <label>Goal<input value={goal} onChange={(event) => setGoal(event.target.value)} disabled={stage !== "draft"} /></label>
              <label>
                Alex's days
                <select value={alexDays} onChange={(event) => setAlexDays(event.target.value)} disabled={stage !== "draft"}>
                  <option>Monday, Wednesday, Friday</option>
                  <option>Every weekday</option>
                  <option>Saturday and Sunday</option>
                </select>
              </label>
              <label>
                Jordan's days
                <select value={jordanDays} onChange={(event) => setJordanDays(event.target.value)} disabled={stage !== "partner_days"}>
                  <option>Tuesday, Thursday, Saturday</option>
                  <option>Monday, Wednesday, Friday</option>
                  <option>Every weekday</option>
                </select>
              </label>
              <label>
                Stake per miss
                <span className="money-input"><span>$</span><input type="number" min="0" max="100" value={stake} onChange={(event) => setStake(event.target.value)} disabled={stage !== "draft"} /></span>
              </label>
              <div className="status-row"><span>Status</span><strong>{status}</strong></div>
            </div>

            <div className="actor-label">Next action · {nextAction.actor}</div>
            <button className="primary-button" onClick={nextAction.action} disabled={(stage === "draft" && !canInvite) || (stage === "outcome" && missedDayShown)}>
              {nextAction.label}<span aria-hidden="true">→</span>
            </button>
            {stage === "outcome" && <button className="secondary-button" onClick={resetDemo}>Run the demo again</button>}
          </aside>

          <div className="phones" aria-live="polite">
            <Phone name="Alex" role={`Creator · ${shortDays(alexDays)}`} messages={messagesFor("alex")} />
            <Phone name="Jordan" role={`Partner · ${shortDays(jordanDays)}`} messages={messagesFor("jordan")} />
          </div>
        </div>
      </section>

      <section className="formats" aria-labelledby="formats-title">
        <div className="formats-heading">
          <p className="section-kicker">One product, four pact formats</p>
          <h2 id="formats-title">Choose who commits and how time is structured.</h2>
          <p>The walkthrough focuses on the clearest Mutual Pact scenario. The product model supports all four combinations.</p>
        </div>
        <div className="format-grid">
          {formatCards.map((format) => (
            <article className={`format-card ${format.featured ? "featured" : ""}`} key={`${format.pact}-${format.schedule}`}>
              <div className="format-tags"><span>{format.pact}</span><span>{format.schedule}</span></div>
              <h3>{format.title}</h3>
              <p>{format.detail}</p>
              {format.featured && <strong>Featured in the demo</strong>}
            </article>
          ))}
        </div>
      </section>

      <section className="thinking" id="product-thinking">
        <div>
          <p className="section-kicker">The product judgment behind the prototype</p>
          <h2>Designed around trust, not feature count.</h2>
        </div>
        <div className="decision-grid">
          <article><span>01</span><h3>Correctness before convenience</h3><p>Proof must map to one eligible person and obligation. Ambiguous input is rejected instead of guessed.</p></article>
          <article><span>02</span><h3>Consent before automation</h3><p>Both people see personalized final terms and explicitly agree before reminders or consequences begin.</p></article>
          <article><span>03</span><h3>A narrow financial boundary</h3><p>The MVP can explain a stake, but it never moves money or claims an external payment was verified.</p></article>
        </div>
      </section>

      <footer>
        <p>PACT AI Prototype</p>
        <a href="https://github.com/ManuelAlonso85/pact-ai-prototype" target="_blank" rel="noreferrer">View repository</a>
      </footer>
    </main>
  );
}

function Phone({ name, role, messages }: { name: string; role: string; messages: Message[] }) {
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <section className="phone" aria-label={`${name}'s simulated phone`}>
      <div className="phone-top"><span className="phone-time">9:41</span><span className="phone-notch" /><span className="phone-signal">●●●</span></div>
      <div className="contact"><div className="avatar">{name[0]}</div><div><strong>{name}</strong><span>{role}</span></div></div>
      <div className="thread" ref={threadRef}>
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.speaker === "system" ? "incoming" : "outgoing"}`}>
            {message.label && <span className="message-label">{message.label}</span>}{message.text}
          </div>
        ))}
      </div>
      <div className="composer"><span>Message</span><button aria-label="Send disabled in prototype">↑</button></div>
    </section>
  );
}

function shortDays(days: string) {
  return days
    .replace("Monday", "Mon")
    .replace("Tuesday", "Tue")
    .replace("Wednesday", "Wed")
    .replace("Thursday", "Thu")
    .replace("Friday", "Fri")
    .replace("Saturday", "Sat")
    .replace("Sunday", "Sun");
}
