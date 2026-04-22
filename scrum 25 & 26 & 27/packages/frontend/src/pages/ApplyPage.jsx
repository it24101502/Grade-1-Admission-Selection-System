import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ApplyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ childName: "", grade: "", notes: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");

    // Mock submit — replace with axios.post("/api/applications") when backend is running
    setTimeout(() => {
      // Save to sessionStorage so ResultsPage can show it
      const existing = JSON.parse(sessionStorage.getItem("applications") || "[]");
      existing.push({
        applicationId: `app-${Date.now()}`,
        childName: form.childName,
        grade: form.grade,
        notes: form.notes,
        status: "pending",
        message: "Your application is under review.",
        submittedAt: new Date().toISOString(),
        publishedAt: null,
        userId: user?.id,
      });
      sessionStorage.setItem("applications", JSON.stringify(existing));
      setStatus("success");
      setTimeout(() => navigate("/results"), 1800);
    }, 600);
  };

  return (
    <div className="page apply-page">
      <h1>Submit Application</h1>
      <p className="page-subtitle">
        Complete the form below to apply for school admission.
      </p>

      {status === "success" && (
        <div className="alert alert-success">
          ✅ Application submitted! Redirecting to results…
        </div>
      )}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="childName">Child's Full Name *</label>
          <input
            id="childName"
            name="childName"
            type="text"
            value={form.childName}
            onChange={handleChange}
            required
            placeholder="e.g. Alice Smith"
          />
        </div>

        <div className="form-group">
          <label htmlFor="grade">Applying for Grade *</label>
          <select
            id="grade"
            name="grade"
            value={form.grade}
            onChange={handleChange}
            required
          >
            <option value="">Select grade…</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((g) => (
              <option key={g} value={String(g)}>Grade {g}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Any relevant information…"
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? "Submitting…" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
