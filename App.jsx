import { useState, useEffect, useRef } from "react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,300&family=Playfair+Display:wght@700;900&display=swap');
`;

function formatCurrency(n) {
  if (n < 0) return `-$${Math.abs(Math.round(n)).toLocaleString()}`;
  return `$${Math.round(n).toLocaleString()}`;
}

function formatPct(n) {
  if (n >= 10000) return `${Math.round(n / 100) * 100}%+`;
  return `${Math.round(n)}%`;
}

function Slider({ label, value, onChange, min, max, step, format, sublabel }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <label style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, color: "#1B2A4A", letterSpacing: 0.2 }}>
          {label}
        </label>
        <span style={{ fontFamily: "'DM Sans'", fontSize: 15, fontWeight: 700, color: "#2E5090", minWidth: 80, textAlign: "right" }}>
          {format ? format(value) : value}
        </span>
      </div>
      {sublabel && (
        <div style={{ fontFamily: "'DM Sans'", fontSize: 11, color: "#8C8C8C", marginBottom: 6, fontStyle: "italic" }}>{sublabel}</div>
      )}
      <div style={{ position: "relative", height: 6, background: "#E8EDF3", borderRadius: 3 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 6, borderRadius: 3, width: `${pct}%`, background: "linear-gradient(90deg, #2E5090, #4A7BD4)" }} />
        <input
          type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ position: "absolute", top: -8, left: 0, width: "100%", height: 22, opacity: 0, cursor: "pointer" }}
        />
        <div style={{
          position: "absolute", top: -5, left: `${pct}%`, transform: "translateX(-50%)",
          width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "3px solid #2E5090",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)", pointerEvents: "none"
        }} />
      </div>
    </div>
  );
}

function ResultCard({ label, skillsValue, stocksValue, highlight }) {
  const isSkillsBetter = typeof skillsValue === "number" && typeof stocksValue === "number" && skillsValue > stocksValue;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
      background: highlight ? "linear-gradient(135deg, #F0F7EC, #E8F5E0)" : "#FAFBFD",
      borderRadius: 10, overflow: "hidden", border: highlight ? "1.5px solid #9DC88D" : "1px solid #E4E8EF",
      marginBottom: 10,
    }}>
      <div style={{ padding: "12px 14px", fontFamily: "'DM Sans'", fontSize: 12.5, fontWeight: 500, color: "#1B2A4A", display: "flex", alignItems: "center" }}>
        {label}
      </div>
      <div style={{
        padding: "12px 14px", textAlign: "center", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 700,
        color: highlight ? "#2D6A1E" : "#2E5090",
        borderLeft: "1px solid rgba(0,0,0,0.06)", borderRight: "1px solid rgba(0,0,0,0.06)",
        background: isSkillsBetter ? "rgba(45,106,30,0.06)" : "transparent"
      }}>
        {typeof skillsValue === "number" ? formatCurrency(skillsValue) : skillsValue}
      </div>
      <div style={{
        padding: "12px 14px", textAlign: "center", fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 700,
        color: typeof stocksValue === "number" && stocksValue < 0 ? "#9C0006" : "#6B7280",
      }}>
        {typeof stocksValue === "number" ? formatCurrency(stocksValue) : stocksValue}
      </div>
    </div>
  );
}

export default function AiRoiCalculator() {
  const [salary, setSalary] = useState(85000);
  const [trainingHours, setTrainingHours] = useState(20);
  const [trainingCost, setTrainingCost] = useState(200);
  const [stockInvestment, setStockInvestment] = useState(10000);
  const [layoffReduction, setLayoffReduction] = useState(30);
  const [salaryPremium, setSalaryPremium] = useState(7);
  const [stockReturn, setStockReturn] = useState(10);
  const [horizon, setHorizon] = useState(3);

  // Skills calculations
  const annualProtection = salary * (layoffReduction / 100);
  const weightedProtection = annualProtection * 0.3; // probability-weighted
  const premiumYear1 = 0;
  const premiumYear2 = salary * (salaryPremium / 100);
  const premiumYear3 = salary * (salaryPremium / 100);
  const skillsBenefitByYear = [];
  for (let y = 1; y <= horizon; y++) {
    const prem = y === 1 ? 0 : salary * (salaryPremium / 100);
    skillsBenefitByYear.push(weightedProtection + prem);
  }
  const totalSkillsBenefit = skillsBenefitByYear.reduce((a, b) => a + b, 0);
  const netSkills = totalSkillsBenefit - trainingCost;
  const skillsROI = trainingCost > 0 ? (netSkills / trainingCost) * 100 : totalSkillsBenefit * 100;

  // Stock calculations
  const totalStockReturn = stockInvestment * (Math.pow(1 + stockReturn / 100, horizon) - 1);
  const stockDownside = stockInvestment * -0.35;
  const stockUpside = stockInvestment * (Math.pow(1 + (stockReturn * 1.8) / 100, horizon) - 1);
  const stockROI = (totalStockReturn / stockInvestment) * 100;

  const multiplier = netSkills > 0 && totalStockReturn > 0 ? Math.round(netSkills / totalStockReturn) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #F8FAFE 0%, #EEF2F7 50%, #F5F0EB 100%)", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 48px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 900, color: "#1B2A4A", lineHeight: 1.2, marginBottom: 6 }}>
            Invest in Yourself<br />
            <span style={{ color: "#2E5090" }}>or AI Stocks?</span>
          </div>
          <div style={{ fontSize: 13, color: "#8C8C8C", maxWidth: 460, margin: "0 auto", lineHeight: 1.5 }}>
            Adjust the sliders to see your personalized 3-year return comparison.
            <br />A thought experiment by <span style={{ fontWeight: 700, color: "#2E5090" }}>CapitAI</span>
          </div>
        </div>

        {/* Input Panel */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
          border: "1px solid #E8EDF3", marginBottom: 28
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#8C8C8C", marginBottom: 18 }}>
            Your Inputs
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
            <div>
              <Slider label="Annual Salary" value={salary} onChange={setSalary} min={40000} max={250000} step={5000}
                format={v => `$${(v/1000).toFixed(0)}K`} />
              <Slider label="AI Training Cost" value={trainingCost} onChange={setTrainingCost} min={0} max={2000} step={50}
                format={v => `$${v}`} sublabel="Courses, certifications, tools" />
              <Slider label="Stock Capital Invested" value={stockInvestment} onChange={setStockInvestment} min={1000} max={50000} step={1000}
                format={v => `$${(v/1000).toFixed(0)}K`} />
              <Slider label="Time Horizon" value={horizon} onChange={setHorizon} min={1} max={5} step={1}
                format={v => `${v} year${v > 1 ? "s" : ""}`} />
            </div>
            <div>
              <Slider label="Layoff Risk Reduction" value={layoffReduction} onChange={setLayoffReduction} min={5} max={50} step={5}
                format={v => `${v}%`} sublabel="If AI-skilled workers are less likely to be cut" />
              <Slider label="AI Salary Premium" value={salaryPremium} onChange={setSalaryPremium} min={0} max={20} step={1}
                format={v => `${v}%`} sublabel="Expected raise from AI fluency (Year 2+)" />
              <Slider label="Expected Stock Return" value={stockReturn} onChange={setStockReturn} min={-10} max={25} step={1}
                format={v => `${v}%/yr`} sublabel="Annualized return on AI stock picks" />
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
          border: "1px solid #E8EDF3", marginBottom: 28
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "#8C8C8C", marginBottom: 14 }}>
            {horizon}-Year Results
          </div>

          {/* Column labels */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 8 }}>
            <div />
            <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#2E5090", textTransform: "uppercase", letterSpacing: 1 }}>
              🎓 Skills
            </div>
            <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 }}>
              📈 Stocks
            </div>
          </div>

          <ResultCard label="Gross Benefit" skillsValue={totalSkillsBenefit} stocksValue={totalStockReturn} />
          <ResultCard label="Cost / Capital" skillsValue={-trainingCost} stocksValue={-stockInvestment} />
          <ResultCard label="Net Return" skillsValue={netSkills} stocksValue={totalStockReturn} highlight />
          <ResultCard label="ROI" skillsValue={formatPct(skillsROI)} stocksValue={formatPct(stockROI)} highlight />
          <ResultCard label="Worst-Case Loss" skillsValue={-trainingCost} stocksValue={stockDownside} />
        </div>

        {/* Big Takeaway */}
        <div style={{
          background: "linear-gradient(135deg, #1B2A4A, #2E5090)", borderRadius: 14, padding: "28px 28px",
          color: "#fff", textAlign: "center", marginBottom: 28,
          boxShadow: "0 4px 20px rgba(30,50,90,0.25)"
        }}>
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            {multiplier > 1 ? (
              <>Upskilling returns <span style={{ color: "#9DC88D", fontSize: 30 }}>{multiplier}×</span> more than stock-picking</>
            ) : multiplier === 1 ? (
              <>The returns are roughly comparable</>
            ) : (
              <>Adjust your assumptions to compare</>
            )}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, maxWidth: 500, margin: "0 auto" }}>
            And your downside is {formatCurrency(trainingCost)} in course fees vs. a potential {formatCurrency(Math.abs(stockDownside))} loss in the market.
            Your income is your biggest asset — protect it first.
          </div>
        </div>

        {/* Methodology */}
        <div style={{
          background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: "16px 20px",
          border: "1px solid #E8EDF3"
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: "#8C8C8C", marginBottom: 8 }}>
            How This Works
          </div>
          <div style={{ fontSize: 11.5, color: "#6B7280", lineHeight: 1.6 }}>
            <strong>Skills side:</strong> Salary protection = annual salary × layoff risk reduction × 30% probability weight.
            Salary premium kicks in Year 2. Both compound over your horizon.
            <br /><br />
            <strong>Stocks side:</strong> Straight compound return on invested capital. Worst case assumes a 35% drawdown.
            <br /><br />
            This is a thought experiment with transparent assumptions, not financial advice. The point is directional:
            the asymmetry between protecting your income stream and speculating with capital is massive.
          </div>
          <div style={{ fontSize: 10, color: "#ACACAC", marginTop: 10, fontStyle: "italic" }}>
            Source: CapitAI / David Weidner. Assumptions informed by BLS data, Goldman Sachs research, and S&P historical returns.
          </div>
        </div>

      </div>
    </div>
  );
}
