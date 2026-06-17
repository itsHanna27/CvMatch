import { useRef, useState, useCallback } from "react";

export default function DropZone({ file, onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function validateAndSet(f) {
    if (!f) return;
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(f.type)) { alert("Please upload a PDF, DOCX, or TXT file."); return; }
    if (f.size > 10 * 1024 * 1024) { alert("File must be under 10 MB."); return; }
    onFile(f);
  }

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  }, []);

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()  => { setDragging(false); };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !file && inputRef.current.click()}
      style={{
        border: `2px dashed ${dragging ? "#ffffff" : "rgba(255, 255, 255, 0.56)"}`,
        borderRadius: 20,
        minHeight: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        cursor: file ? "default" : "pointer",
        background: dragging ? "rgba(124,58,237,0.06)" : "transparent",
        transition: "background 0.2s, border-color 0.2s",
        padding: 24,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: "none" }}
        onChange={(e) => validateAndSet(e.target.files[0])}
      />

      {file ? (
        <>
          <div style={{ fontSize: 36 }}>📄</div>
          <p style={{ color: "#F8FAFC", fontWeight: 600, textAlign: "center" }}>{file.name}</p>
          <p style={{ color: "#94A3B8", fontSize: 13 }}>{(file.size / 1024).toFixed(1)} KB</p>
          <button
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "none", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Remove
          </button>
        </>
      ) : (
        <>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          </svg>
          <p style={{ color: "#CBD5E1", fontSize: 14 }}>Drag &amp; drop your CV here</p>
          <p style={{ color: "#94A3B8", fontSize: 13 }}>or</p>
         <button
  className="DropZone-btn"
  onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
>
  Browse Files
</button>
          <span style={{ color: "#94A3B8", fontSize: 12 }}>PDF, DOCX or TXT (max 10 MB)</span>
        </>
      )}
    </div>
  );
}