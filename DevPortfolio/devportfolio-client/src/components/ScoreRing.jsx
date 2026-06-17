import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

function getColor(score) {
  if (score >= 80) return "#22C55E";
  if (score >= 70) return "#EAB308";
  return "#F97316";
}

function getLabel(score) {
  if (score >= 80) return "Great Match!";
  if (score >= 70) return "Good Match";
  return "Needs Work";
}

export default function ScoreRing({ score }) {
  const color = getColor(score);
  const data = [{ value: score, fill: color }];

  return (
    <div style={{ position: "relative", width: 220, height: 220 }}>
      <RadialBarChart
        width={220} height={220}
        cx={110} cy={110}
        innerRadius={80} outerRadius={105}
        startAngle={90} endAngle={-270}
        data={data}
        barSize={14}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        {/* background prop draws the grey track */}
        <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={8} />
      </RadialBarChart>

      {/* Score text centred on top of the chart */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 46, fontWeight: 700, color: "#F8FAFC", lineHeight: 1 }}>
          {score}<span style={{ fontSize: 22 }}>%</span>
        </span>
        <span style={{ color, fontSize: 14, marginTop: 6, fontWeight: 600 }}>
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
}