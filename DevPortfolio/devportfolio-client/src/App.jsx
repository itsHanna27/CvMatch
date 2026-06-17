import { useState } from "react";
import ScoreRing from "./components/ScoreRing";
import DropZone from "./components/DropZone";
import HistoryPanel from "./components/HistoryPanel";
import Spinner from "./components/Spinner";
import { Document, Paragraph, TextRun, Packer } from "docx";
import { saveAs } from "file-saver";
import "./App.css";
import { 
  FiUpload,
  FiFileText,
  FiBarChart2,
  FiMail,
  FiDownload,
  FiCopy,
  FiLoader,
  FiSearch,
  FiShield
} from "react-icons/fi";

// dummy data

const INITIAL_HISTORY = [
  { id: 1, title: "Frontend Developer", company: "Google",    score: 82, date: "12 Jun 2025 · 10:30 AM" },
  { id: 2, title: "Backend Developer",  company: "Microsoft", score: 76, date: "10 Jun 2025 · 4:15 PM"  },
  { id: 3, title: "Full Stack Engineer",company: "Stripe",    score: 85, date: "9 Jun 2025 · 11:20 AM"  },
  { id: 4, title: "Software Engineer",  company: "Amazon",    score: 71, date: "7 Jun 2025 · 2:45 PM"   },
  { id: 5, title: "Frontend Developer", company: "Tesla",     score: 68, date: "5 Jun 2025 · 9:10 AM"   },
];


// Helpers

function getPriorityStyle(priority) {
  const map = {
    High:   { color: "#EF4444", bg: "rgba(239,68,68,0.15)"  },
    Medium: { color: "#F97316", bg: "rgba(249,115,22,0.15)" },
    Low:    { color: "#EAB308", bg: "rgba(234,179,8,0.15)"  },
  };
  return map[priority] || map.Low;
}

// App 

export default function App() {
  const [jobTitle,     setJobTitle]     = useState("");
  const [company,      setCompany]      = useState("");
  const [cvFile,       setCvFile]       = useState(null);
  const [jobDesc,      setJobDesc]      = useState("");
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [history,      setHistory]      = useState(INITIAL_HISTORY);
  const [coverLetter,  setCoverLetter]  = useState(null);   // cover letter text
  const [clLoading,    setClLoading]    = useState(false);  // cover letter loading state
  const [copied,       setCopied]       = useState(false);  // copy to clipboard state

  const CHAR_LIMIT = 5000;
//downloding cover letter as doc
  async function handleDownload() {
  if (!coverLetter) return;

  const doc = new Document({
    sections: [{
      children: coverLetter.split("\n").map(line => 
        new Paragraph({
          children: [new TextRun(line)],
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `cover-letter-${company || "download"}.docx`);

}
  async function handleAnalyse() {
    if (!cvFile)         { alert("Please upload your CV first.");    return; }
    if (!jobDesc.trim()) { alert("Please paste a job description."); return; }
    if (!jobTitle.trim()) { alert("Please enter a job title."); return; }
    if (!company.trim()) { alert("Please enter a company name."); return; }

    setLoading(true);
    setCoverLetter(null); // reset cover letter when analysing again

    const form = new FormData();
    form.append("cv", cvFile);
    form.append("jobDescription", jobDesc);
    form.append("jobTitle", jobTitle);
    form.append("company", company);
    const res  = await fetch("/api/analyse", { method: "POST", body: form });
    const data = await res.json();
    setResult(data);

    setHistory((prev) => [
      {
        id: Date.now(),
        title:   jobTitle || "Untitled Role",
        company: company  || "—",
        score:   data.score,
        date: new Date().toLocaleString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
      },
      ...prev.slice(0, 7),
    ]);

    setLoading(false);
  }

  async function handleGenerateCoverLetter() {
    if (!cvFile || !jobDesc.trim()) return;

    setClLoading(true);
    setCoverLetter(null);

    const form = new FormData();
    form.append("cv", cvFile);
    form.append("jobDescription", jobDesc);
    form.append("jobTitle", jobTitle);
    form.append("company", company);
    const res  = await fetch("/api/coverletter", { method: "POST", body: form });
    const data = await res.json();
    setCoverLetter(data.coverLetter);

    setClLoading(false);
  }

  function handleCopy() {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  }

  return (
    <div className="app">

      {/* Header */}
      <div className="header">
        <h1>CVMatch</h1>
      </div>

      {/* Main layout */}
      <div className="main-layout">

        {/* Left column */}
        <div className="left-column">

          {/* Job title + Company */}
          <div className="input-row">
            {[
              { label: "Job Title", val: jobTitle, set: setJobTitle, placeholder: "e.g. Frontend Developer" },
              { label: "Company",   val: company,  set: setCompany,  placeholder: "e.g. Google"            },
            ].map(({ label, val, set, placeholder }) => (
              <div className="input-group" key={label}>
                <label>{label}</label>
                <input
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          {/* Upload + Job description */}
          <div className="upload-row">

            <div className="card upload-card">
              <h2> <FiUpload size={30} /> Upload Your CV</h2>
              <p className="card-subtitle">Drag and drop your CV file here, or click to browse</p>
              <DropZone file={cvFile} onFile={setCvFile} />
            </div>

            <div className="card upload-card">
              <h2> <FiFileText size={30} /> Paste Job Description</h2>
              <p className="card-subtitle">Paste the full job description below</p>
              <textarea
                className="job-desc-textarea"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value.slice(0, CHAR_LIMIT))}
                placeholder="Paste the job description here..."
              />
              <p className="char-count">{jobDesc.length} / {CHAR_LIMIT}</p>
            </div>

          </div>

          {/* Analyse button */}
          <button
            className="btn btn-primary"
            onClick={handleAnalyse}
            disabled={loading}
          >
            {loading
              ? <><Spinner /> Analysing…</>
              : <><FiBarChart2 /> Analyse Match</>}
          </button>

          {/* Results */}
          {result && (
            <>
              {/* Score */}
              <div className="card score-section">
                <h2>Match Score</h2>
                <ScoreRing score={result.score} />
                <p className="score-subtitle">
                  {result.score >= 80 ? "Your CV matches the job description well. See below for details."
                  : result.score >= 60 ? "Your CV is a decent match but has some gaps. See below for details."
                  : "Your CV needs work to match this role. See below for details."}
                </p>
              </div>

              {/* Generate cover letter button */}
              <button
                className="btn btn-primary"
                onClick={handleGenerateCoverLetter}
                disabled={clLoading}
              >
                {clLoading
                  ? <><Spinner size={20}/> Generating…</>
                  : <><FiMail size={20} /> Generate Cover Letter</>}
              </button>

              {/* Cover letter result */}
              {coverLetter && (
                <div className="card">
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2><FiFileText size={20} /> Cover Letter</h2>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-primary" onClick={handleCopy} style={{ width: "auto", padding: "0.4rem 1rem" }}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                    <button className="btn btn-primary" onClick={handleDownload} style={{ width: "auto", padding: "0.4rem 1rem" }}>
                      ⬇ Download
                    </button>
                  </div>
                </div>
                  <textarea
                    className="job-desc-textarea"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)} // lets user edit it
                    style={{ minHeight: "300px" }}
                  />
                </div>
              )}

              {/* Feedback */}
              <div className="feedback-row">

                {/* Strengths */}
                <div className="card feedback-card">
                  <h2><FiShield size={20} /> Strengths</h2>
                  <ul className="strengths-list">
                    {result.strengths.map((s) => (
                      <li className="strength-item" key={s.title}>
                        <span className="strength-check">✓</span>
                        <div>
                          <p>{s.title}</p>
                          <p>{s.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing keywords */}
                <div className="card feedback-card">
                  <h2><FiSearch size={20} /> Missing Keywords</h2>
                  <ul className="missing-list">
                    {result.missing.map((m) => {
                      const { color, bg } = getPriorityStyle(m.priority);
                      return (
                        <li className="missing-item" key={m.keyword}>
                          <div className="missing-item-left">
                            <span className="missing-x">✕</span>
                            <div>
                              <p>{m.keyword}</p>
                              <p>{m.detail}</p>
                            </div>
                          </div>
                          <span className="priority-badge" style={{ color, background: bg }}>
                            {m.priority}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>
            </>
          )}

        </div>

        {/* History panel */}
        <HistoryPanel history={history} />

      </div>

    </div>
  );
}