"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = "draft" | "invited" | "active" | "proof" | "complete";
type Speaker = "system" | "alex" | "jordan";

type Message = {
  id: number;
  speaker: Speaker;
  text: string;
  phone: "alex" | "jordan";
  label?: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    speaker: "system",
    phone: "alex",
    label: "PACT AI",
    text: "Ready to make a pact? Choose the terms, then send the invitation.",
  },
  {
    id: 2,
    speaker: "system",
    phone: "jordan",
    label: "PACT AI",
    text: "You’ll see the partner side of the conversation here.",
  },
];

const stageMeta: Record<Stage, { step: number; title: string; note: string }> = {
  draft: {
    step: 1,
    title: "Define the commitment",
    note: "The creator makes the goal, cadence, and consequence explicit before anyone agrees.",
  },
  invited: {
    step: 2,
    title: "Align on the terms",
    note: "The partner sees the same summary and must actively accept. Nothing starts by assumption.",
  },
  active: {
    step: 3,
    title: "Prompt action",
    note: "The reminder names what is due today. Proof is accepted only for the eligible obligation.",
  },
  proof: {
    step: 4,
    title: "Review the evidence",
    note: "The accountability partner—not an opaque model—makes the MVP approval decision.",
  },
  complete: {
    step: 5,
    title: "Explain the outcome",
    note: "The result is tied to a date and the next consequence is explicit and auditable.",
  },
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("draft");
  const [goal, setGoal] = useState("Walk for 30 minutes");
  const [schedule, setSchedule] = useState("Monday, Wednesday, Friday");
  const [stake, setStake] = useState("10");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("pact-prototype");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStage(parsed.stage ?? "draft");
        setGoal(parsed.goal ?? "Walk for 30 minutes");
        setSchedule(parsed.schedule ?? "Monday, Wednesday, Friday");
        setStake(parsed.stake ?? "10");
        setMessages(parsed.messages ?? initialMessages);
      } catch {
        window.localStorage.removeItem("pact-prototype");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      "pact-prototype",
      JSON.stringify({ stage, goal, schedule, stake, messages }),
    );
  }, [hydrated, goal, messages, schedule, stage, stake]);

  const progress = `${stageMeta[stage].step * 20}%`;
  const canInvite = goal.trim().length >= 3 && Number(stake) >= 0;

  const status = useMemo(() => {
    if (stage === "draft") return "Draft";
    if (stage === "invited") return "Waiting for partner";
    if (stage === "active") return "Proof due today";
    if (stage === "proof") return "Awaiting review";
    return "Passed";
  }, [stage]);

  function append(next: Omit<Message, "id">[]) {
    setMessages((current) => [
      ...current,
      ...next.map((message, index) => ({
        ...message,
        id: current.length + index + 1,
      })),
    ]);
  }

  function invitePartner() {
    if (!canInvite) return;
    append([
      { speaker: "alex", phone: "alex", text: "START A PACT" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: `Invitation sent. Goal: ${goal}. Schedule: ${schedule}. Stake: $${stake} per missed commitment.`,
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: `Alex invited you to review “${goal}” on ${schedule}. The stake is $${stake} per miss. Reply AGREE to accept these terms.`,
      },
    ]);
    setStage("invited");
  }

  function acceptPact() {
    append([
      { speaker: "jordan", phone: "jordan", text: "AGREE" },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Pact active. You’ll review Alex’s proof on scheduled days.",
      },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: `Pact active. Today: ${goal}. Send PROOF when you’re done.`,
      },
    ]);
    setStage("active");
  }

  function submitProof() {
    append([
      { speaker: "alex", phone: "alex", text: "PROOF — completed the walk before work. [synthetic photo]" },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Proof received for today. Waiting for Jordan’s review.",
      },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Alex submitted proof for today’s walk. Reply APPROVE or REJECT.",
      },
    ]);
    setStage("proof");
  }

  function approveProof() {
    append([
      { speaker: "jordan", phone: "jordan", text: "APPROVE" },
      {
        speaker: "system",
        phone: "jordan",
        label: "PACT AI",
        text: "Review recorded. Today’s commitment passed.",
      },
      {
        speaker: "system",
        phone: "alex",
        label: "PACT AI",
        text: "Today’s pact passed — proof approved by Jordan. No stake is due.",
      },
    ]);
    setStage("complete");
  }

  function resetDemo() {
    setStage("draft");
    setGoal("Walk for 30 minutes");
    setSchedule("Monday, Wednesday, Friday");
    setStake("10");
    setMessages(initialMessages);
    window.localStorage.removeItem("pact-prototype");
  }

  function messagesFor(phone: "alex" | "jordan") {
    return messages.filter((message) => message.phone === phone);
  }

  const nextAction = {
    draft: { label: "Send pact invitation", action: invitePartner, actor: "Alex · creator" },
    invited: { label: "Reply AGREE", action: acceptPact, actor: "Jordan · partner" },
    active: { label: "Submit synthetic proof", action: submitProof, actor: "Alex · creator" },
    proof: { label: "Approve proof", action: approveProof, actor: "Jordan · partner" },
    complete: { label: "Run the demo again", action: resetDemo, actor: "Prototype complete" },
  }[stage];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PACT AI prototype home">
          <span className="brand-mark">P</span>
          <span>PACT AI</span>
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
          Walk through a two-person pact from invitation to proof. This browser demo models the core product decisions without sending messages or collecting personal data.
        </p>
        <div className="hero-facts" aria-label="Prototype facts">
          <span>No signup</span><span>No live SMS</span><span>No payment processing</span>
        </div>
      </section>

      <section className="demo-shell" aria-labelledby="demo-title">
        <div className="demo-header">
          <div>
            <p className="section-kicker">Guided product walkthrough</p>
            <h2 id="demo-title">Try the accountability loop</h2>
          </div>
          <button className="reset-button" onClick={resetDemo}>Reset demo</button>
        </div>

        <div className="progress-track" aria-label={`Step ${stageMeta[stage].step} of 5`}>
          <div className="progress-fill" style={{ width: progress }} />
        </div>

        <div className="demo-grid">
          <aside className="control-panel">
            <div className="step-label">Step {stageMeta[stage].step} of 5</div>
            <h3>{stageMeta[stage].title}</h3>
            <p>{stageMeta[stage].note}</p>

            <div className="pact-card">
              <label>
                Goal
                <input value={goal} onChange={(event) => setGoal(event.target.value)} disabled={stage !== "draft"} />
              </label>
              <label>
                Schedule
                <select value={schedule} onChange={(event) => setSchedule(event.target.value)} disabled={stage !== "draft"}>
                  <option>Monday, Wednesday, Friday</option>
                  <option>Every weekday</option>
                  <option>Saturday and Sunday</option>
                </select>
              </label>
              <label>
                Stake per miss
                <span className="money-input"><span>$</span><input type="number" min="0" max="100" value={stake} onChange={(event) => setStake(event.target.value)} disabled={stage !== "draft"} /></span>
              </label>
              <div className="status-row"><span>Status</span><strong>{status}</strong></div>
            </div>

            <div className="actor-label">Next action · {nextAction.actor}</div>
            <button className="primary-button" onClick={nextAction.action} disabled={stage === "draft" && !canInvite}>
              {nextAction.label}<span aria-hidden="true">→</span>
            </button>
          </aside>

          <div className="phones" aria-live="polite">
            <Phone name="Alex" role="Creator" messages={messagesFor("alex")} />
            <Phone name="Jordan" role="Partner" messages={messagesFor("jordan")} />
          </div>
        </div>
      </section>

      <section className="thinking" id="product-thinking">
        <div>
          <p className="section-kicker">The product judgment behind the prototype</p>
          <h2>Designed around trust, not feature count.</h2>
        </div>
        <div className="decision-grid">
          <article><span>01</span><h3>Correctness before convenience</h3><p>Proof must map to one eligible person and obligation. Ambiguous input is rejected instead of guessed.</p></article>
          <article><span>02</span><h3>Consent before automation</h3><p>Both people see the same final terms and explicitly agree before reminders or consequences begin.</p></article>
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
  return (
    <section className="phone" aria-label={`${name}'s simulated phone`}>
      <div className="phone-top"><span className="phone-time">9:41</span><span className="phone-notch" /><span className="phone-signal">●●●</span></div>
      <div className="contact">
        <div className="avatar">{name[0]}</div>
        <div><strong>{name}</strong><span>{role}</span></div>
      </div>
      <div className="thread">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.speaker === "system" ? "incoming" : "outgoing"}`}>
            {message.label && <span className="message-label">{message.label}</span>}
            {message.text}
          </div>
        ))}
      </div>
      <div className="composer"><span>Message</span><button aria-label="Send disabled in prototype">↑</button></div>
    </section>
  );
}
