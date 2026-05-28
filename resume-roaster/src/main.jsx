import React from 'react'
import { createRoot } from 'react-dom/client'

import { useState, useRef } from "react";

const STEPS = ["upload", "roast", "rewrite"];

const systemPromptRoast = `You are a brutally honest, witty career coach who reviews resumes. Your job is to give a sharp, entertaining but genuinely useful roast of the resume. Be specific — call out weak action verbs, generic buzzwords, missing metrics, formatting issues, and missed opportunities. Use a mix of humor and real insight. Structure your response as:

🔥 OVERALL VERDICT (1-2 punchy sentences)

❌ THE BAD STUFF (4-6 specific bullets, be ruthless)

⚠️ MISSED OPPORTUNITIES (2-3 bullets)

💡 THE ONE THING THAT COULD SAVE YOU (1 actionable tip)

Keep it under 350 words. Be memorable, not mean.`;

const systemPromptRewrite = `You are an elite resume writer who transforms weak resumes into powerful ones. Given the resume text, rewrite the professional summary and improve 3-4 of the weakest bullet points you can identify. 

Format your response as:

✨ REWRITTEN PROFESSIONAL SUMMARY
[Write a punchy 3-sentence summary]

💪 UPGRADED BULLET POINTS
[Show: BEFORE → AFTER for 3-4 bullets, with a brief note on why each is stronger]

🎯 3 MORE QUICK WINS
[3 additional specific improvements they should make]

Be concrete, use strong action verbs, add metrics where plausible, remove fluff.`;

export default function ResumeRoaster() {
  const [step, setStep] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [roastResult, setRoastResult] = useState("");
  const [rewriteResult, setRewriteResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const textareaRef = useRef(null);

  async function callClaude(systemPrompt, userContent) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    const data = await response.json();
    return data.content.map((b) => b.text || "").join("");
  }

  async function handleRoast() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setLoadingMsg("Reading your resume... bracing for impact 👀");
    setTimeout(() => setLoadingMsg("Identifying the cringe... 🔍"), 1500);
    setTimeout(() => setLoadingMsg("Sharpening the knives... 🔪"), 3000);
    try {
      const result = await callClaude(systemPromptRoast, `Here is my resume:\n\n${resumeText}`);
      setRoastResult(result);
      setStep("roast");
    } catch (e) {
      setRoastResult("Something went wrong. Please try again.");
      setStep("roast");
    }
    setLoading(false);
  }

  async function handleRewrite() {
    if (!unlocked) { setShowPaywall(true); return; }
    setLoading(true);
    setLoadingMsg("Transforming your resume... ✨");
    setTimeout(() => setLoadingMsg("Injecting power verbs... 💪"), 2000);
    try {
      const result = await callClaude(systemPromptRewrite, `Here is my resume:\n\n${resumeText}`);
      setRewriteResult(result);
      setStep("rewrite");
    } catch (e) {
      setRewriteResult("Something went wrong. Please try again.");
      setStep("rewrite");
    }
    setLoading(false);
  }

  function handleUnlock() {
  window.open('https://buy.stripe.com/test_6oU5kw5Lq9d7fZ85vlb7y00', '_blank');
}

  function reset() {
    setStep("upload");
    setResumeText("");
    setRoastResult("");
    setRewriteResult("");
    setUnlocked(false);
    setShowPaywall(false);
  }

  function formatResult(text) {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="spacer" />;
      const isHeader = /^[🔥❌⚠️💡✨💪🎯]/.test(line);
      if (isHeader) return <div key={i} className="result-header">{line}</div>;
      if (line.startsWith("•") || line.startsWith("-") || line.match(/^\d\./)) {
        return <div key={i} className="result-bullet">{line}</div>;
      }
      return <div key={i} className="result-line">{line}</div>;
    });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0a0a0a; }

        .app {
          min-height: 100vh;
          background: #0a0a0a;
          color: #f0ece4;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .bg-grid {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,80,30,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,80,30,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .bg-glow {
          position: fixed;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 500px;
          background: radial-gradient(ellipse, rgba(255,60,0,0.12) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        .header {
          text-align: center;
          margin-bottom: 56px;
        }

        .badge {
          display: inline-block;
          background: rgba(255,60,0,0.15);
          border: 1px solid rgba(255,60,0,0.3);
          color: #ff5c1a;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 2px;
          margin-bottom: 20px;
        }

        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(64px, 12vw, 110px);
          line-height: 0.9;
          letter-spacing: -1px;
          background: linear-gradient(135deg, #f0ece4 0%, #ff5c1a 60%, #ff2200 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
        }

        .subtitle {
          font-size: 16px;
          color: #7a7268;
          font-weight: 300;
          letter-spacing: 0.3px;
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .subtitle strong { color: #c0b8ac; font-weight: 500; }

        .card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 4px;
          padding: 36px;
          margin-bottom: 24px;
          backdrop-filter: blur(8px);
        }

        .card-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #ff5c1a;
          margin-bottom: 16px;
        }

        textarea {
          width: 100%;
          min-height: 260px;
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          color: #d4cfc8;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          line-height: 1.7;
          padding: 18px;
          resize: vertical;
          outline: none;
          transition: border-color 0.2s;
        }

        textarea:focus { border-color: rgba(255,92,26,0.4); }
        textarea::placeholder { color: #3a3830; }

        .char-count {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #3a3830;
          text-align: right;
          margin-top: 8px;
        }

        .btn-primary {
          width: 100%;
          padding: 18px 32px;
          background: linear-gradient(135deg, #ff5c1a, #ff2200);
          border: none;
          border-radius: 3px;
          color: white;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }

        .btn-primary:hover::after { background: rgba(255,255,255,0.08); }
        .btn-primary:active { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-secondary {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 3px;
          color: #7a7268;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover { border-color: rgba(255,255,255,0.3); color: #c0b8ac; }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 2px solid rgba(255,92,26,0.2);
          border-top-color: #ff5c1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 24px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          color: #7a7268;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

        .result-content {
          font-size: 14px;
          line-height: 1.8;
          color: #c0b8ac;
        }

        .result-header {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          color: #f0ece4;
          margin-top: 24px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .result-header:first-child { margin-top: 0; }

        .result-bullet {
          padding: 4px 0 4px 16px;
          border-left: 2px solid rgba(255,92,26,0.3);
          margin: 6px 0;
          color: #b0a89e;
        }

        .result-line { margin: 3px 0; }
        .spacer { height: 8px; }

        .action-row {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 28px;
        }

        .action-row .btn-primary { flex: 1; }

        .paywall-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .paywall-card {
          background: #111;
          border: 1px solid rgba(255,92,26,0.3);
          border-radius: 6px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 0 80px rgba(255,60,0,0.15);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .paywall-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .paywall-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px;
          letter-spacing: 1px;
          color: #f0ece4;
          margin-bottom: 12px;
          line-height: 1;
        }

        .paywall-sub {
          font-size: 14px;
          color: #7a7268;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .paywall-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px;
          color: #ff5c1a;
          line-height: 1;
          margin-bottom: 4px;
        }

        .paywall-price-note {
          font-size: 12px;
          color: #3a3830;
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 28px;
        }

        .paywall-features {
          list-style: none;
          text-align: left;
          margin-bottom: 32px;
        }

        .paywall-features li {
          font-size: 13px;
          color: #7a7268;
          padding: 6px 0;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .paywall-features li::before {
          content: '✓';
          color: #ff5c1a;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .btn-pay {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #ff5c1a, #ff2200);
          border: none;
          border-radius: 3px;
          color: white;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          cursor: pointer;
          margin-bottom: 12px;
          transition: opacity 0.2s;
        }

        .btn-pay:hover { opacity: 0.9; }

        .btn-dismiss {
          background: none;
          border: none;
          color: #3a3830;
          font-size: 12px;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .btn-dismiss:hover { color: #7a7268; }

        .steps-indicator {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 48px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          transition: all 0.3s;
        }

        .step-dot.active { background: #ff5c1a; width: 24px; border-radius: 4px; }
        .step-dot.done { background: rgba(255,92,26,0.4); }

        .social-proof {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }

        .proof-item {
          text-align: center;
        }

        .proof-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          color: #ff5c1a;
          line-height: 1;
        }

        .proof-label {
          font-size: 11px;
          color: #3a3830;
          font-family: 'DM Mono', monospace;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.06);
          align-self: center;
        }

        @media (max-width: 480px) {
          .card { padding: 24px 20px; }
          .paywall-card { padding: 36px 24px; }
        }
      `}</style>

      <div className="app">
        <div className="bg-grid" />
        <div className="bg-glow" />

        <div className="container">
          <header className="header">
            <div className="badge">AI-Powered · Instant Results</div>
            <div className="title">RESUME<br />ROASTER</div>
            <p className="subtitle">
              Get your resume <strong>brutally critiqued</strong> by AI — then watch it get rewritten into something that actually gets interviews.
            </p>
          </header>

          <div className="steps-indicator">
            {["upload","roast","rewrite"].map((s, i) => (
              <div key={s} className={`step-dot ${step === s ? "active" : STEPS.indexOf(step) > i ? "done" : ""}`} />
            ))}
          </div>

          {step === "upload" && (
            <>
              <div className="social-proof">
                <div className="proof-item">
                  <div className="proof-num">4.2K</div>
                  <div className="proof-label">Resumes Roasted</div>
                </div>
                <div className="divider" />
                <div className="proof-item">
                  <div className="proof-num">89%</div>
                  <div className="proof-label">Got More Interviews</div>
                </div>
                <div className="divider" />
                <div className="proof-item">
                  <div className="proof-num">30s</div>
                  <div className="proof-label">To Get Results</div>
                </div>
              </div>

              <div className="card">
                <div className="card-label">Step 1 — Paste Your Resume</div>
                <textarea
                  ref={textareaRef}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full resume text here — work experience, skills, summary, everything...

Don't worry. We've seen worse. Probably."
                />
                <div className="char-count">{resumeText.length} characters</div>
              </div>

              <button
                className="btn-primary"
                onClick={handleRoast}
                disabled={resumeText.trim().length < 50 || loading}
              >
                {loading ? "ANALYZING..." : "🔥 ROAST MY RESUME — FREE"}
              </button>
            </>
          )}

          {step === "upload" && loading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <div className="loading-text">{loadingMsg}</div>
            </div>
          )}

          {step === "roast" && !loading && (
            <>
              <div className="card">
                <div className="card-label">🔥 Your Roast Is Ready</div>
                <div className="result-content">
                  {formatResult(roastResult)}
                </div>
              </div>

              <div className="card" style={{border: "1px solid rgba(255,92,26,0.25)", background: "rgba(255,60,0,0.04)"}}>
                <div className="card-label">✨ Step 2 — Get It Rewritten</div>
                <p style={{fontSize: "14px", color: "#7a7268", lineHeight: "1.7", marginBottom: "0"}}>
                  Now that you know what's broken — let AI <strong style={{color:"#c0b8ac"}}>fix it</strong>. Get a rewritten professional summary, upgraded bullet points with metrics, and a personalized action plan. One-time unlock, instant results.
                </p>
                <div className="action-row">
                  <button className="btn-primary" onClick={handleRewrite} disabled={loading}>
                    {loading ? "REWRITING..." : "✨ REWRITE MY RESUME — $4.99"}
                  </button>
                  <button className="btn-secondary" onClick={reset}>Start Over</button>
                </div>
              </div>
            </>
          )}

          {step === "roast" && loading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <div className="loading-text">{loadingMsg}</div>
            </div>
          )}

          {step === "rewrite" && !loading && (
            <>
              <div className="card" style={{border: "1px solid rgba(255,92,26,0.2)"}}>
                <div className="card-label">✨ Your Rewritten Resume Sections</div>
                <div className="result-content">
                  {formatResult(rewriteResult)}
                </div>
              </div>
              <div style={{display:"flex", gap:"12px", marginTop:"4px"}}>
                <button className="btn-primary" onClick={reset} style={{background:"rgba(255,255,255,0.08)", flex:1}}>
                  ROAST ANOTHER RESUME
                </button>
              </div>
            </>
          )}
        </div>

        {showPaywall && (
          <div className="paywall-overlay">
            <div className="paywall-card">
              <div className="paywall-icon">✨</div>
              <div className="paywall-title">UNLOCK THE REWRITE</div>
              <p className="paywall-sub">
                Your free roast is done. Now let's actually fix it.
              </p>
              <div className="paywall-price">$4.99</div>
              <div className="paywall-price-note">one-time · instant access</div>
              <ul className="paywall-features">
                <li>Rewritten professional summary that grabs attention</li>
                <li>3–4 upgraded bullet points with stronger verbs & metrics</li>
                <li>Personalized action plan for the rest of your resume</li>
                <li>Delivered in under 30 seconds</li>
              </ul>
              <button className="btn-pay" onClick={handleUnlock}>
                💳 UNLOCK NOW — $4.99
              </button>
              <br />
              <button className="btn-dismiss" onClick={() => setShowPaywall(false)}>
                No thanks, I'll keep my weak resume
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
const root = createRoot(document.getElementById('root'))
root.render(<ResumeRoaster />)
