import { useState, useEffect } from "react";

const Y = "#FFD845";
const BG = "#0B0B0B";
const CARD = "#131313";
const BD = "#1C1C1C";
const FG = "#FFFFFF";
const FG2 = "#999999";
const MUT = "#444444";
const DIM = "#222222";
const BLU = "#60A5FA";
const PUR = "#C084FC";
const ORG = "#FB923C";
const GRN = "#4ADE80";
const F = "'Inter','Helvetica Neue',system-ui,sans-serif";

const s = (obj) => obj;

const Eyebrow = ({ children, color = MUT }) => (
  <div style={{ color, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 28 }}>
    knock. · {children}
  </div>
);

const Tag = ({ children, c = Y }) => (
  <span style={{ background: c + "18", border: `1px solid ${c}33`, color: c, borderRadius: 4, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", display: "inline-block", marginRight: 8, marginBottom: 8 }}>
    {children}
  </span>
);

const Card = ({ children, accent, color = Y, style = {} }) => (
  <div style={{ background: accent ? color + "0C" : CARD, border: `1px solid ${accent ? color + "30" : BD}`, borderRadius: 10, padding: "20px 22px", ...style }}>
    {children}
  </div>
);

const Row = ({ label, color = MUT, children }) => (
  <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{label}
    <div style={{ marginTop: 10, color: FG2, fontSize: 14, fontWeight: 400, letterSpacing: 0, textTransform: "none", lineHeight: 1.6 }}>{children}</div>
  </div>
);

const Check = ({ children, done = true, color = Y }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
    <span style={{ color: done ? color : MUT, fontSize: 15, marginTop: 1, flexShrink: 0, fontWeight: 700 }}>{done ? "✓" : "○"}</span>
    <span style={{ fontSize: 14, color: done ? FG : MUT, lineHeight: 1.5 }}>{children}</span>
  </div>
);

const Strip = ({ color = Y, label, children }) => (
  <div style={{ borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0", background: CARD, border: `1px solid ${BD}`, borderLeft: `3px solid ${color}`, padding: "14px 18px", marginBottom: 10 }}>
    {label && <div style={{ fontSize: 10, color, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>}
    <div style={{ fontSize: 14, color: FG2, lineHeight: 1.65 }}>{children}</div>
  </div>
);

const Stat = ({ n, label, sub, color = Y }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 58, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-2px" }}>{n}</div>
    <div style={{ fontSize: 12, color: FG, marginTop: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: FG2, marginTop: 5, lineHeight: 1.5 }}>{sub}</div>}
  </div>
);

const SW = ({ children, label }) => (
  <div style={{ width: "100%", maxWidth: 880, margin: "0 auto" }}>
    {label && <Eyebrow>{label}</Eyebrow>}
    {children}
  </div>
);

const G2 = ({ left, right, gap = 40, ratio = "1fr 1fr" }) => (
  <div style={{ display: "grid", gridTemplateColumns: ratio, gap, alignItems: "start" }}>
    <div>{left}</div>
    <div>{right}</div>
  </div>
);

const G3 = ({ cols = [], gap = 18 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap }}>
    {cols.map((c, i) => <div key={i}>{c}</div>)}
  </div>
);

const BigHead = ({ children, accent }) => (
  <div style={{ fontSize: 38, fontWeight: 900, color: FG, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
    {children}
  </div>
);

const Sub = ({ children }) => (
  <div style={{ fontSize: 15, color: FG2, lineHeight: 1.75, marginBottom: 28 }}>{children}</div>
);


const S01 = () => (
  <SW>
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontSize: 11, color: MUT, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 56 }}>
        EDHE Absa InnoVarsity 2026 · Category 5: Innovative Industries
      </div>

      <div style={{ fontSize: 96, fontWeight: 900, color: FG, letterSpacing: "-5px", lineHeight: 0.88, marginBottom: 28 }}>
        knock.
      </div>

      <div style={{ fontSize: 17, color: Y, fontWeight: 700, letterSpacing: "0.36em", textTransform: "uppercase", marginBottom: 52 }}>
        opportunity infrastructure
      </div>

      <div style={{ width: 48, height: 2, background: Y, marginBottom: 44 }} />

      <div style={{ fontSize: 20, color: FG2, lineHeight: 1.7, maxWidth: 560, marginBottom: 52 }}>
        The permanent network between South Africa's student talent and the industries that need them.
      </div>

      <div>
        <Tag>EdTech</Tag>
        <Tag>RecruitmentTech</Tag>
        <Tag>Technology for Social Good</Tag>
        <Tag>SDG 4 · 8 · 10</Tag>
      </div>
    </div>
  </SW>
);


const S02 = () => (
  <SW label="The Crisis">
    <BigHead>South Africa has a talent market<br /><span style={{ color: Y }}>broken in both directions.</span></BigHead>
    <Sub>Not a shortage of jobs. Not a shortage of talent. A broken matching layer.</Sub>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 28 }}>
      <Card accent color={Y}>
        <Stat n="57%" label="Youth Unemployment" sub="The national crisis Knock operates inside" color={Y} />
      </Card>
      <Card>
        <Stat n="5,000+" label="Fewer STEM graduates than target" sub="2023/24 — not enough supply reaching demand" color={FG} />
      </Card>
      <Card>
        <Stat n="3,500" label="Applications per vacancy" sub="Median employer receives per graduate role" color={ORG} />
      </Card>
    </div>

    <Card accent color={Y} style={{ textAlign: "center", padding: "20px 28px" }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: FG, lineHeight: 1.45 }}>
        The problem isn't supply. It isn't demand.<br />
        <span style={{ color: Y }}>It's the broken layer in between.</span>
      </div>
    </Card>
  </SW>
);


const S03 = () => (
  <SW label="Problem — Three Sides">
    <BigHead>The system fails every participant simultaneously.</BigHead>

    <G3 cols={[
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>For students</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 14 }}>Invisible in a flooded market</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>
          Opportunities exist. Getting to the right ones requires navigating disconnected platforms, irrelevant content, systems not built for them. A 64% GPA can trigger an automatic rejection before a human reads the application.
        </div>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 10, color: ORG, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>For industry</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 14 }}>Budget spent. Signal lost.</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>
          R40,000 on a career fair stand. 3,500 CVs to filter. And when the fair closes — no data. No way to know who was the right fit, what they did next, whether any of it produced a hire.
        </div>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 10, color: BLU, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>For the market</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: FG, marginBottom: 14 }}>Access follows brand budget</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>
          Companies with large marketing teams and dedicated graduate functions consistently reach top talent. Smaller companies compete at a structural disadvantage that has nothing to do with the quality of their opportunity.
        </div>
      </Card>
    ]} />

    <div style={{ marginTop: 20, padding: "14px 20px", background: DIM, borderRadius: 8, fontSize: 13, color: FG2 }}>
      <span style={{ color: FG, fontWeight: 700 }}>Root cause: </span>Students are not on LinkedIn the way companies assume. The channel that actually reaches them is the one Knock is built on — WhatsApp.
    </div>
  </SW>
);


const S04 = () => (
  <SW label="The Solution">
    <G2
      ratio="1.1fr 1fr"
      left={
        <div>
          <BigHead>
            Every platform is <span style={{ color: MUT, textDecoration: "line-through" }}>reactive</span>.<br />
            <span style={{ color: Y }}>Knock is proactive.</span>
          </BigHead>
          <Sub>Students don't search and wait. Knock delivers verified, matched opportunities directly — on WhatsApp, the platform they already live on.</Sub>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["💬", BLU, "WhatsApp-native — 26 million South Africans"],
              ["🎓", Y, "Transcript-verified, not self-reported"],
              ["🎯", GRN, "Intent signals, not CV noise"],
            ].map(([icon, color, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, background: CARD, border: `1px solid ${BD}`, borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0", padding: "12px 16px", fontSize: 14, color: FG }}>
                <span>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
      }
      right={
        <Card accent color={Y}>
          <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>The core inversion</div>

          {[
            { label: "Old model", desc: "Student searches, applies, waits", color: MUT, strike: true },
            { label: "Knock model", desc: "Opportunity finds the student", color: Y, strike: false },
          ].map((item, i) => (
            <div key={i} style={{ padding: "14px 0", borderBottom: i === 0 ? `1px solid ${BD}` : "none" }}>
              <div style={{ fontSize: 11, color: item.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: item.strike ? "line-through" : "none", marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 15, color: item.strike ? FG2 : FG, fontWeight: item.strike ? 400 : 700 }}>{item.desc}</div>
            </div>
          ))}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BD}`, fontSize: 13, color: FG2, fontStyle: "italic", lineHeight: 1.65 }}>
            "Instead of broadcasting CVs into the void, Knock delivers matched opportunities to verified students — and gives employers a shortlist of candidates who have actively signalled interest."
          </div>
        </Card>
      }
    />
  </SW>
);


const S05 = () => (
  <SW label="Innovation & Originality">
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontSize: 38, fontWeight: 900, color: FG, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 10 }}>
        LinkedIn is a <span style={{ color: MUT }}>rearview mirror</span>.<br />
        <span style={{ color: Y }}>Knock is a GPS.</span>
      </div>
      <Sub>Three things make Knock genuinely new in the South African graduate market.</Sub>
    </div>

    <G3 gap={16} cols={[
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>📋</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>01 — Transcript verification</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7, marginBottom: 14 }}>We verify actual academic records, not self-reported skills. A trust layer no job board, career fair, or LinkedIn has ever built.</div>
        <Tag c={Y}>No competitor has this</Tag>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>02 — Intent signal stack</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7, marginBottom: 14 }}>Escalating signals of genuine interest — a student liking a role, tailoring their CV, uploading their transcript. Employers see measured intent, not an application pile.</div>
        <Tag c={BLU}>Active, not passive</Tag>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>💬</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 10 }}>03 — WhatsApp-native delivery</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7, marginBottom: 14 }}>Meeting students where 26 million South Africans already are. Near-100% daily attention and penetration. Not asking them to check yet another portal.</div>
        <Tag c={GRN}>Channel no one else uses</Tag>
      </Card>
    ]} />

    <Card accent color={Y} style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", flexWrap: "wrap", gap: 12 }}>
      <div style={{ fontSize: 14, color: FG }}><span style={{ fontWeight: 700 }}>LinkedIn</span> sells <span style={{ color: MUT }}>historical signal</span> — where you've been.</div>
      <div style={{ width: 1, height: 32, background: BD }} />
      <div style={{ fontSize: 14, color: FG }}><span style={{ fontWeight: 700, color: Y }}>Knock</span> sells <span style={{ color: Y }}>forward intent</span> — what you're doing right now.</div>
    </Card>
  </SW>
);


const S06 = () => (
  <SW label="The Product">
    <G2
      ratio="1fr 1.1fr"
      left={
        <div>
          <BigHead>Three layers.<br /><span style={{ color: Y }}>One infrastructure.</span></BigHead>
          <Sub>Not a job board. The infrastructure that sits underneath every graduate hiring interaction in the country.</Sub>

          <div style={{ fontFamily: "monospace", fontSize: 12, color: FG2, lineHeight: 2.2, padding: "18px 20px", background: DIM, borderRadius: 8 }}>
            <div style={{ color: Y }}>[ WhatsApp · Digital Campus ]</div>
            <div style={{ paddingLeft: 16 }}>↓ Layer 1 — Access · <span style={{ color: GRN }}>live</span></div>
            <div style={{ color: BLU }}>[ Headless Auth Bridge ]</div>
            <div style={{ paddingLeft: 16 }}>↓ Layer 2 — Intelligence · building</div>
            <div style={{ color: PUR }}>[ Web App + Profile Layer ]</div>
            <div style={{ paddingLeft: 16 }}>↓ Layer 3 — Compliance · roadmap</div>
            <div style={{ color: MUT }}>[ B-BBEE / SDL / SETA ]</div>
          </div>
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            [Y, "Layer 1 — Access · Live now", "Year-round, always-on reach to verified STEM graduates. Opportunities distributed directly — they find students, not the other way around. Playing field equal for every company regardless of marketing budget."],
            [BLU, "Layer 2 — Intelligence · Building", "Profile-level, consented engagement data. Degree · University · GPA band tied to every click, reaction, and intent signal. The CRM for graduate hiring — the data no career fair has ever produced."],
            [PUR, "Layer 3 — Compliance · Roadmap", "Student-consented demographic data feeding B-BBEE scorecards, SDL claims, and employment equity reports. Turns a recruitment tool into compliance infrastructure — a different budget line entirely."],
          ].map(([color, label, text]) => (
            <Card key={label} style={{ borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>{label}</div>
              <div style={{ fontSize: 13, color: FG2, lineHeight: 1.65 }}>{text}</div>
            </Card>
          ))}
        </div>
      }
    />
  </SW>
);


const S07 = () => (
  <SW label="Market Opportunity">
    <BigHead>A market that grows by statute, every year.</BigHead>

    <G2
      ratio="1.4fr 1fr"
      left={
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            [FG2, "Total addressable market", "1.2M+ SA University Students", "All South African student talent · All disciplines · All companies hiring graduates at any level"],
            [BLU, "Serviceable market", "All Major SA Universities + Graduate-hiring Corporates", "Final-year and recent STEM graduates · All companies with structured graduate recruitment programmes"],
            [Y, "Beachhead — where we start", "UCT · Wits · Stellenbosch · UP", "Final-year STEM graduates + financial services, tech, engineering, consulting companies running annual graduate intakes"],
          ].map(([color, label, headline, desc]) => (
            <Card key={label} accent={color === Y} color={Y} style={{ borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0" }}>
              <div style={{ fontSize: 10, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: FG, marginBottom: 6 }}>{headline}</div>
              <div style={{ fontSize: 12, color: FG2, lineHeight: 1.6 }}>{desc}</div>
            </Card>
          ))}
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: Y, letterSpacing: "-2px", lineHeight: 1 }}>26</div>
            <div style={{ fontSize: 13, color: FG, marginTop: 10, fontWeight: 700 }}>South African Universities</div>
            <div style={{ fontSize: 12, color: FG2, marginTop: 6 }}>Architecture replicates per institution at near-zero marginal cost</div>
          </Card>
          <Card style={{ textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: FG, letterSpacing: "-1.5px", lineHeight: 1 }}>~R3M</div>
            <div style={{ fontSize: 13, color: FG, marginTop: 10, fontWeight: 700 }}>Conservative Year-1 ARR potential</div>
            <div style={{ fontSize: 12, color: FG2, marginTop: 6 }}>50 companies × R10k avg campaign</div>
          </Card>
          <Card accent color={Y} style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13, color: FG2, fontStyle: "italic", lineHeight: 1.7 }}>
              "A market that resets and grows annually — new graduates cycle through every 12 months, creating perpetual institutionalised demand."
            </div>
          </Card>
        </div>
      }
    />
  </SW>
);


const S08 = () => (
  <SW label="Execution Status">
    <G2
      left={
        <div>
          <BigHead>Infrastructure built.<br /><span style={{ color: Y }}>Pilot running.</span></BigHead>
          <Sub>Deliberately sequenced. Built before the first student joined. Not rushed — structured.</Sub>

          <Check color={Y}>CIPC registered & legally compliant</Check>
          <Check color={Y}>Founders' agreement signed — 65/25/10 ESOP structure</Check>
          <Check color={Y}>1-year cliff + 4-year vesting confirmed</Check>
          <Check color={Y}>POPIA compliance framework underway</Check>
          <Check color={Y}>WhatsApp community infrastructure built & live</Check>
          <Check color={Y}>Technical team: 4 IS developers building the MVP</Check>
          <Check color={Y}>Student intake opened: 22 June 2026 (Day 1)</Check>
          <Check done={false}>Industry outreach begins: 29 June 2026</Check>
          <Check done={false}>First paying campaign: Week 1, July 2026</Check>
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card accent color={Y}>
            <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>Pilot Targets — End of July</div>
            {[
              ["400", "verified students", "UCT, Wits, Stellenbosch, UP, UWC"],
              ["120+", "monthly active users", "≥50% engagement rate target"],
              ["8", "paying corporate pilots", "R3,500–R10,000 per campaign"],
              ["20+", "outreach conversations", "targeting 25% conversion to paid"],
            ].map(([n, l, s]) => (
              <div key={l} style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: 14, borderBottom: `1px solid ${BD}`, marginBottom: 14 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: Y, minWidth: 56, letterSpacing: "-1px" }}>{n}</div>
                <div>
                  <div style={{ fontSize: 14, color: FG, fontWeight: 700 }}>{l}</div>
                  <div style={{ fontSize: 11, color: FG2 }}>{s}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>TRL Assessment</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["TRL 1 ✓", "TRL 2 ✓", "TRL 3 ✓"].map(t => (
                <span key={t} style={{ background: Y + "18", color: Y, border: `1px solid ${Y}33`, borderRadius: 4, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>{t}</span>
              ))}
              <span style={{ background: BLU + "18", color: BLU, border: `1px solid ${BLU}33`, borderRadius: 4, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>TRL 4 → Active</span>
            </div>
            <div style={{ fontSize: 12, color: FG2, marginTop: 12 }}>Technology concept validated. Pilot = real-environment proof of concept.</div>
          </Card>
        </div>
      }
    />
  </SW>
);


const S09 = () => (
  <SW label="SDG Alignment">
    <div style={{ fontSize: 36, fontWeight: 900, color: FG, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 10 }}>
      Not tagged onto the pitch.<br /><span style={{ color: Y }}>Built into the reason we exist.</span>
    </div>
    <Sub>Knock's core mechanics directly hit three SDGs — not as a framework imposed on an idea, but as the natural consequence of what we're building.</Sub>

    <G3 gap={16} cols={[
      <Card accent color={Y} style={{ height: "100%" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: Y, marginBottom: 14, letterSpacing: "-1px" }}>SDG 4</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 12 }}>Quality Education</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>Knock closes the gap between degree and career — the exact point where education is meant to convert into economic participation, and currently doesn't for most graduates.</div>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: BLU, marginBottom: 14, letterSpacing: "-1px" }}>SDG 8</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 12 }}>Decent Work & Economic Growth</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>57% youth unemployment. Knock directly attacks the structural mismatch keeping qualified graduates out of the workforce. Every verified match is one fewer graduate in the unemployment queue.</div>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: PUR, marginBottom: 14, letterSpacing: "-1px" }}>SDG 10</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: FG, marginBottom: 12 }}>Reduced Inequalities</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>Access to top graduates has always followed marketing budget and brand. Knock removes that structural advantage — every company gets the same direct access to the same verified pool.</div>
      </Card>
    ]} />

    <Card style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, padding: "14px 20px" }}>
      <span style={{ fontSize: 12, color: FG2 }}>Primary classification:</span>
      <Tag c={BLU}>Technology for Social Good</Tag>
      <Tag c={PUR}>Education & Learning Innovation</Tag>
      <Tag c={ORG}>Financial & Economic Inclusion</Tag>
    </Card>
  </SW>
);


const S10 = () => (
  <SW label="Business Model">
    <G2
      left={
        <div>
          <BigHead>Two-sided.<br /><span style={{ color: Y }}>One side always free.</span></BigHead>
          <Sub>Students are the network. The network is the product. You don't charge the network to exist.</Sub>

          <Card accent color={Y} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Students — always free</div>
            <div style={{ fontSize: 13, color: FG2, lineHeight: 1.65 }}>Permanent supply-side access, free by design. Not a freemium trade-off. Students are the inventory. Charging them would destroy the product.</div>
          </Card>

          <Card>
            <div style={{ fontSize: 10, color: ORG, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Industry — tiered access</div>
            {[
              ["R 3,500", "Network broadcast — all groups"],
              ["R 5,000", "Segmented distribution"],
              ["R 10,000", "Full campaign — 2 drops"],
              ["+ R 500", "Analytics add-on (any tier)"],
            ].map(([price, label]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${BD}`, fontSize: 13 }}>
                <span style={{ color: FG2 }}>{label}</span>
                <span style={{ fontWeight: 700, color: FG }}>{price}</span>
              </div>
            ))}
          </Card>
        </div>
      }
      right={
        <div>
          <div style={{ fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Revenue Progression</div>
          {[
            [Y, "Pilot — now", "R3,500–R10,000 per talent drop. Non-binding. Access layer only. Proves demand before building the full product."],
            [BLU, "Near-term", "Tiered subscriptions. Featured placements. Segmented distributions. Analytics packages. Annual contracts."],
            [PUR, "At scale", "Platform SaaS. Talent intelligence reports. B-BBEE compliance reporting as a service. SDL data infrastructure for SETA-registered entities."],
          ].map(([color, phase, desc]) => (
            <Strip key={phase} color={color} label={phase}>{desc}</Strip>
          ))}

          <Card accent color={Y} style={{ marginTop: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 13, color: Y, fontStyle: "italic", lineHeight: 1.65 }}>
              "The pilot is not the business. The pilot proves the network. The network is the business."
            </div>
          </Card>
        </div>
      }
    />
  </SW>
);


const S11 = () => (
  <SW label="Financial Feasibility">
    <BigHead>Capital-efficient by design.<br /><span style={{ color: Y }}>R500,000 · 12 months · full runway.</span></BigHead>

    <G2
      left={
        <div>
          <div style={{ fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Use of funds</div>
          {[
            [Y, "R 20,000", "Months 1–6 operations", "Pre-revenue burn · serves up to 250 students"],
            [BLU, "R 240,000", "Living stipend · 12 months", "Full-time founder commitment · Cape Town"],
            [PUR, "R 190,000", "Months 6–12 operations", "Post-revenue scale · up to 1,500 users"],
            [MUT, "R 50,000", "Contingency (~17%)", "Legal, accounting, unforeseen"],
          ].map(([color, amt, label, sub]) => (
            <div key={label} style={{ display: "flex", gap: 14, padding: "12px 14px", background: CARD, border: `1px solid ${BD}`, borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0", marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color, minWidth: 90 }}>{amt}</div>
              <div>
                <div style={{ fontSize: 13, color: FG, fontWeight: 700 }}>{label}</div>
                <div style={{ fontSize: 11, color: FG2 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      }
      right={
        <div>
          <div style={{ fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Revenue model</div>

          <Card accent color={Y} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: Y, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Pilot phase · Month 1–3</div>
            {[
              ["8 companies × avg R5,000", "R 40,000"],
              ["Cost per high-intent candidate", "R 50"],
              ["vs. recruiter cost (10–15% salary)", "R 8k–12k"],
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${BD}`, fontSize: 13 }}>
                <span style={{ color: FG2 }}>{l}</span>
                <span style={{ fontWeight: 700, color: FG }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: BLU, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>12-month conservative target</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: FG2 }}>50 companies × R10k avg</span>
              <span style={{ fontWeight: 900, color: FG }}>R 500,000 ARR</span>
            </div>
            <div style={{ fontSize: 11, color: FG2, marginTop: 8 }}>Breakeven on operations at 20 monthly campaigns</div>
          </Card>

          <div style={{ padding: "12px 14px", background: DIM, borderRadius: 8, fontSize: 12, color: FG2, lineHeight: 1.6 }}>
            <span style={{ color: FG, fontWeight: 700 }}>Existing proof: </span>~$41,000 (R680k) in hackathon prizes demonstrates execution under resource constraints. R35k grant receipt in progress.
          </div>
        </div>
      }
    />
  </SW>
);


const S12 = () => (
  <SW label="Scalability & Impact">
    <BigHead>Three axes of scale.<br /><span style={{ color: Y }}>One structural flywheel.</span></BigHead>

    <G3 gap={16} cols={[
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Axis 1 — Universities</div>
        <div style={{ fontSize: 14, color: FG, fontWeight: 700, marginBottom: 10 }}>4 → 26 universities</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>Architecture replicates per institution at near-zero marginal cost. University sub-communities, segmented matching. Start: UCT, Wits, Stellenbosch, UP. Expand: all 26 South African universities.</div>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 10, color: BLU, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Axis 2 — Faculties</div>
        <div style={{ fontSize: 14, color: FG, fontWeight: 700, marginBottom: 10 }}>STEM → all disciplines</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>STEM is the trust-building wedge. The same engine and architecture extends to Commerce, Law, Health Sciences. Every faculty follows the same data model, same intent signals.</div>
      </Card>,
      <Card style={{ height: "100%" }}>
        <div style={{ fontSize: 10, color: PUR, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Axis 3 — Student lifecycle</div>
        <div style={{ fontSize: 14, color: FG, fontWeight: 700, marginBottom: 10 }}>Recruitment → financial inclusion</div>
        <div style={{ fontSize: 13, color: FG2, lineHeight: 1.7 }}>A graduate acquired for recruitment becomes addressable for financial services at the exact moment they enter the economy — medical aid, insurance, banking, investment. One acquisition, multiple monetisation points.</div>
      </Card>
    ]} />

    <Card accent color={Y} style={{ marginTop: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: FG, marginBottom: 14 }}>The zero-CAC campus flywheel</div>
      <G2 ratio="1.5fr 1fr" gap={24}
        left={<div style={{ fontSize: 13, color: FG2, lineHeight: 1.75 }}>Knock embeds in campus culture. Each graduating cohort inherits the platform from the cohort before — through reputation, peer word-of-mouth, visible placement success. As Knock deepens in campus life, the cost to acquire the next cohort trends toward zero. <span style={{ color: Y }}>The infrastructure stays. The students cycle through it.</span></div>}
        right={<div>{["Year 1: Beachhead (4 unis)", "Year 2: 8 universities", "Year 3: 15 universities", "Year 5: All 26"].map((t, i) => (
          <div key={t} style={{ padding: "7px 12px", background: i === 0 ? Y + "1A" : CARD, border: `1px solid ${i === 0 ? Y + "40" : BD}`, borderRadius: 6, fontSize: 12, color: i === 0 ? Y : FG2, marginBottom: 8 }}>{t}</div>
        ))}</div>}
      />
    </Card>
  </SW>
);


const S13 = () => (
  <SW label="Transformative Impact">
    <G2
      ratio="1fr 1.1fr"
      gap={44}
      left={
        <div>
          <div style={{ fontSize: 38, fontWeight: 900, color: FG, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 20 }}>
            Not incremental.<br /><span style={{ color: Y }}>Structural.</span>
          </div>
          <Sub>Youth unemployment is South Africa's defining socio-economic crisis. Graduate underemployment is its most wasteful expression — the country educates its most capable young people, then loses their productivity to a broken matching system.</Sub>
          <Sub>Knock attacks that waste directly.</Sub>
        </div>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            [Y, "Individual", "A verified graduate gets found by the right employer and launches a career instead of joining the unemployment queue."],
            [BLU, "Systemic", "Verification, intent, and proactive matching become the norm. The lottery of mass applications becomes a structured, data-driven process."],
            [PUR, "Economic", "By owning the graduate-to-earner transition, Knock extends financial inclusion to a generation at the exact moment they enter the economy."],
            [ORG, "B-BBEE & SDL", "Student-consented data feeds directly into SDL refund claims and B-BBEE scorecard submissions — compliance infrastructure, not just recruitment."],
          ].map(([color, level, desc]) => (
            <Strip key={level} color={color} label={level}>{desc}</Strip>
          ))}
        </div>
      }
    />
  </SW>
);


const S14 = () => (
  <SW label="Team">
    <div style={{ fontSize: 36, fontWeight: 900, color: FG, letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 10 }}>
      We are the market.<br /><span style={{ color: Y }}>We are the students Knock is built for.</span>
    </div>
    <Sub>Unfair insight: we lived the problem before we built the solution.</Sub>

    <G2 gap={18}
      left={
        <Card accent color={Y}>
          <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>Dylan Tasdhary — Co-Founder</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {["🏆 Allan Gray Fellow", "4 hackathons · R680k in prizes", "Placed 2nd of 4 tracks · world's largest Web3 hackathon", "Product · Architecture · Commercial", "UCT Computer Science — postgraduate"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, background: Y + "0C", border: `1px solid ${Y}22`, borderRadius: 6, padding: "9px 12px", fontSize: 13, color: FG }}>{item}</div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: FG2, lineHeight: 1.65 }}>
            Led student society to 2× fundraising growth. Full-stack + data engineering background. Previous: built full product within hackathon constraints, multiple wins.
          </div>
        </Card>
      }
      right={
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card>
            <div style={{ fontSize: 10, color: BLU, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>Chipo Chidakwa — Co-Founder</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {["Operations & Compliance", "POPIA framework owner", "Student acquisition & campus relations"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, background: BLU + "0C", border: `1px solid ${BLU}22`, borderRadius: 6, padding: "9px 12px", fontSize: 13, color: FG }}>{item}</div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: FG2, lineHeight: 1.65 }}>
              Leads the SA compliance stack, drives student community growth, and manages institutional campus relationships.
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Technical squad</div>
            <div style={{ fontSize: 14, color: FG, fontWeight: 700, marginBottom: 6 }}>4 Information Systems developers</div>
            <div style={{ fontSize: 12, color: FG2, lineHeight: 1.6 }}>Building the MVP in parallel: verification logic · matching engine · intent-tracking · headless auth bridge</div>
          </Card>
        </div>
      }
    />
  </SW>
);


const S15 = () => (
  <SW label="Investment & Partnership Readiness">
    <G2 ratio="1.1fr 1fr" gap={40}
      left={
        <div>
          <BigHead>Not seeking permission.<br /><span style={{ color: Y }}>Seeking runway.</span></BigHead>
          <Sub>The infrastructure is built. The pilot is live. The ask is for the fuel to scale what already works.</Sub>

          <Check color={Y}>CIPC registered & legally compliant</Check>
          <Check color={Y}>Founders' agreement signed & witnessed</Check>
          <Check color={Y}>Equity structure formalised (65/25/10 ESOP)</Check>
          <Check color={Y}>POPIA compliance framework underway</Check>
          <Check done={false}>Business banking (target: 26 June)</Check>
          <Check done={false}>First LOIs from corporate partners (July)</Check>

          <div style={{ marginTop: 20, fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Natural partners</div>
          {[
            [Y, "Universities — career services, registrars, transcript verification"],
            [BLU, "Corporates — HR, Transformation Directors, SETA"],
            [PUR, "Financial services — graduate last-mile product distribution"],
          ].map(([color, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, background: CARD, border: `1px solid ${BD}`, borderLeft: `3px solid ${color}`, borderRadius: "0 8px 8px 0", padding: "10px 14px", fontSize: 13, color: FG, marginBottom: 8 }}>{text}</div>
          ))}
        </div>
      }
      right={
        <Card accent color={Y}>
          <div style={{ fontSize: 10, color: Y, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>The ask</div>

          <div style={{ fontSize: 60, fontWeight: 900, color: FG, letterSpacing: "-3px", lineHeight: 1, marginBottom: 6 }}>R500k</div>
          <div style={{ fontSize: 14, color: FG2, marginBottom: 28 }}>12 months of full runway</div>

          <div style={{ fontSize: 10, color: MUT, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>In exchange</div>

          {[
            "400+ verified STEM students in the network",
            "8+ paying corporate pilot campaigns",
            "Validated intent data across top SA universities",
            "Revenue unlocking — Week 1 of July 2026",
            "InnoVarsity advisory and mentorship",
            "Platform and brand credibility with our user base",
          ].map(item => (
            <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ color: Y, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>→</span>
              <span style={{ fontSize: 13, color: FG2 }}>{item}</span>
            </div>
          ))}
        </Card>
      }
    />
  </SW>
);


const S16 = () => (
  <SW>
    <div style={{ paddingTop: 20 }}>
      <div style={{ fontSize: 11, color: MUT, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 56 }}>
        Category 5: Innovative Industries
      </div>

      <div style={{ fontSize: 72, fontWeight: 900, color: FG, letterSpacing: "-4px", lineHeight: 0.92, marginBottom: 40 }}>
        Moments end.<br /><span style={{ color: Y }}>Networks don't.</span>
      </div>

      <div style={{ fontSize: 17, color: FG2, lineHeight: 1.75, maxWidth: 580, marginBottom: 44 }}>
        Every career fair, sponsored event, and bursary programme is a moment. Knock is the network those moments land in — the permanent infrastructure for South Africa's graduate talent market.
      </div>

      <div style={{ width: 48, height: 2, background: Y, marginBottom: 44 }} />

      <div style={{ fontSize: 16, color: FG2, marginBottom: 10 }}>
        An economy where no young talent goes unseen by the industries that need them.
      </div>
      <div style={{ fontSize: 14, color: MUT, fontStyle: "italic", marginBottom: 56 }}>— Vision, knock.</div>

      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: FG, letterSpacing: "-3px" }}>knock.</div>
        <div style={{ width: 1, height: 40, background: BD }} />
        <div style={{ fontSize: 14, color: Y, letterSpacing: "0.26em", textTransform: "uppercase" }}>opportunity infrastructure</div>
      </div>
    </div>
  </SW>
);


const SLIDES = [
  { label: "Title", C: S01 },
  { label: "The Crisis", C: S02 },
  { label: "Problem", C: S03 },
  { label: "Solution", C: S04 },
  { label: "Innovation", C: S05 },
  { label: "Product", C: S06 },
  { label: "Market", C: S07 },
  { label: "Execution", C: S08 },
  { label: "SDG Alignment", C: S09 },
  { label: "Business Model", C: S10 },
  { label: "Financials", C: S11 },
  { label: "Scalability", C: S12 },
  { label: "Impact", C: S13 },
  { label: "Team", C: S14 },
  { label: "Readiness", C: S15 },
  { label: "Close", C: S16 },
];

export default function Deck() {
  const [idx, setIdx] = useState(0);
  const total = SLIDES.length;

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setIdx(i => Math.min(i + 1, total - 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [total]);

  const Slide = SLIDES[idx].C;

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: F, color: FG, position: "relative", userSelect: "none" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: DIM, zIndex: 200 }}>
        <div style={{ height: "100%", background: Y, width: `${((idx + 1) / total) * 100}%`, transition: "width 0.35s ease" }} />
      </div>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 44, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", zIndex: 199 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#2A2A2A", letterSpacing: "-0.5px" }}>knock.</div>
        <div style={{ fontSize: 11, color: MUT }}>{idx + 1} / {total} — {SLIDES[idx].label}</div>
      </div>

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "72px 48px 88px" }}>
        <Slide />
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 60, background: BG, borderTop: `1px solid ${BD}`, display: "flex", justifyContent: "center", alignItems: "center", gap: 16, zIndex: 200 }}>
        <button
          onClick={() => setIdx(i => Math.max(i - 1, 0))}
          disabled={idx === 0}
          style={{ background: "transparent", border: `1px solid ${idx === 0 ? MUT : "#333"}`, color: idx === 0 ? MUT : FG2, padding: "7px 18px", borderRadius: 6, cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 12, transition: "all 0.2s" }}
        >← prev</button>

        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setIdx(i)}
              title={SLIDES[i].label}
              style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 3, background: i === idx ? Y : DIM, cursor: "pointer", transition: "all 0.3s ease" }}
            />
          ))}
        </div>

        <button
          onClick={() => setIdx(i => Math.min(i + 1, total - 1))}
          disabled={idx === total - 1}
          style={{ background: idx === total - 1 ? DIM : Y, border: "none", color: idx === total - 1 ? MUT : BG, padding: "7px 18px", borderRadius: 6, cursor: idx === total - 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
        >next →</button>
      </div>
    </div>
  );
}
