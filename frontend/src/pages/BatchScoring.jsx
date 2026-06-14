import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadTransactions } from "../api";

function BatchScoring({ setSummary, setAlerts, setActivePage }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadName, setUploadName] = useState("");

  async function handleUpload() {
    if (!file) return;

    try {
      setLoading(true);

      const data = await uploadTransactions(file);

      setSummary(data.summary);
      setAlerts(data.alerts);

      setActivePage("alerts");
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check if backend is running and CSV columns are correct.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="batch-page">
      <div className="upload-card">
        <div className="upload-icon">
          {loading ? <Loader2 className="spin" size={42} /> : <UploadCloud size={42} />}
        </div>

        <h3>CSV Transaction Dataset</h3>
        <p>
          Use the same transaction format as the AML dataset.
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setUploadName(selectedFile?.name || "");
          }}
        />

        {uploadName && (
          <span className="file-name">
            Selected file: {uploadName}
          </span>
        )}

        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Scoring dataset..." : "Run XGBoost Screening"}
        </button>
      </div>
    </section>
  );
}

export default BatchScoring;
