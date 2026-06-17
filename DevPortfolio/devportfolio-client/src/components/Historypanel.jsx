function getScoreStyle(score) {
  if (score >= 80) return { color: "#22C55E", bg: "rgba(34,197,94,0.15)"  };
  if (score >= 75) return { color: "#EAB308", bg: "rgba(234,179,8,0.15)"  };
  if (score >= 65) return { color: "#F97316", bg: "rgba(249,115,22,0.15)" };
  return               { color: "#EF4444", bg: "rgba(239,68,68,0.15)"  };
}

export default function HistoryPanel({ history }) {
  return (
    <div className="card history-panel">

      <div className="history-header">
        <h2>Recent Analyses</h2>
        <span className="view-all">View all</span>
      </div>

      <div className="history-list">
        {history.map((h) => {
          const { color, bg } = getScoreStyle(h.score);
          return (
            <div className="history-card" key={h.id}>
              <div>
                <h3>{h.title}</h3>
                <p>{h.company}</p>
                <p className="history-date">{h.date}</p>
              </div>
              <span className="score-badge" style={{ color, background: bg }}>
                {h.score}%
              </span>
            </div>
          );
        })}
      </div>

      <button className="btn btn-ghost">⊙ View full history</button>

    </div>
  );
}