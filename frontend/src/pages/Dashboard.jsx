import { useState } from "react";
import BatchScoring from "./BatchScoring";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/Statcard";
import AlertsTable from "../components/AlertsTable";
import DashboardCharts from "../components/DashboardCharts";
import CountryAlertsMap from "../components/CountryAlertsMap";

import { generateExplanation } from "../api";

import {
  Activity,
  BarChart3,
  ClipboardCheck,
  FileSearch,
  ShieldCheck,
  Target,
} from "lucide-react";

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("batch");
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [aiExplanation, setAiExplanation] = useState("");
  const [explanationLoading, setExplanationLoading] = useState(false);

  const pageTitle = {
    batch: "Load Dataset",
    alerts: "Review Alerts",
    investigator: "Investigator",
    dashboard: "Dashboard",
    about: "About Us",
  }[activePage];

  const preferredCaseFieldOrder = [
    "Sender_account",
    "Receiver_account",
    "Amount",
    "Payment_currency",
    "Received_currency",
    "Sender_bank_location",
    "Receiver_bank_location",
    "Payment_type",
    "Full_Date",
    "Hour",
    "DayofWeek",
    "DayofMonth",
    "Month",
    "bank_location_missmatch",
    "isNight",
    "Is_MidMonth",
    "Receiver_transactions",
    "Unique_Receivers_Cum",
    "Nr_past_interactions",
    "prediction",
    "risk_level",
    "fraud_probability",
  ];

  function formatCaseLabel(key) {
    const labels = {
      Sender_account: "Sender Account",
      Receiver_account: "Receiver Account",
      Payment_currency: "Payment Currency",
      Received_currency: "Received Currency",
      Sender_bank_location: "Sender Bank Location",
      Receiver_bank_location: "Receiver Bank Location",
      Payment_type: "Payment Type",
      Full_Date: "Full Date",
      DayofWeek: "Day Of Week",
      DayofMonth: "Day Of Month",
      bank_location_missmatch: "Bank Location Mismatch",
      isNight: "Night Transaction",
      Is_MidMonth: "Mid-Month Transaction",
      Receiver_transactions: "Receiver Transactions",
      Unique_Receivers_Cum: "Unique Receivers Cum.",
      Nr_past_interactions: "Past Account Interactions",
      fraud_probability: "XGBoost Probability",
      risk_level: "Review Level",
      prediction: "Model Output",
    };

    return labels[key] || key.replaceAll("_", " ");
  }

  function formatCaseValue(key, value) {
    if (value === null || value === undefined || value === "") return "-";

    if (key === "fraud_probability") {
      return `${(Number(value) * 100).toFixed(3)}%`;
    }

    if (key === "Amount") {
      return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    }

    if (["isNight", "Is_MidMonth", "bank_location_missmatch"].includes(key)) {
      return Number(value) === 1 ? "Yes" : "No";
    }

    if (typeof value === "number") {
      return Number.isInteger(value)
        ? value.toLocaleString()
        : value.toLocaleString(undefined, { maximumFractionDigits: 3 });
    }

    return String(value);
  }

  function getCaseFields(alert) {
    const existingKeys = Object.keys(alert || {});
    const orderedKeys = [
      ...preferredCaseFieldOrder.filter((key) => existingKeys.includes(key)),
      ...existingKeys.filter((key) => !preferredCaseFieldOrder.includes(key)),
    ];

    return orderedKeys.map((key) => ({
      key,
      label: formatCaseLabel(key),
      value: formatCaseValue(key, alert[key]),
    }));
  }

  function cleanExplanationText(text) {
    return text.replaceAll("**", "");
  }

  function handleInvestigate(alert) {
    setSelectedAlert(alert);
    setAiExplanation("");
    setActivePage("investigator");
  }

  async function handleGenerateExplanation() {
    if (!selectedAlert) return;

    try {
      setExplanationLoading(true);
      setAiExplanation("");

      const data = await generateExplanation(selectedAlert);
      setAiExplanation(data.explanation);
    } catch (error) {
      console.error(error);
      setAiExplanation(
        "AI explanation could not be generated. Please check the backend logs."
      );
    } finally {
      setExplanationLoading(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
      />

      <main className="main-content">
        {activePage !== "about" && (
          <div className="page-header">
            <div>
              <h1>{pageTitle}</h1>
            </div>
          </div>
        )}

        {activePage === "dashboard" && (
          <>
            <div className="stats-grid">
              <StatCard
                title="Total Transactions"
                value={summary?.total_transactions ?? "-"}
                subtitle=""
                icon={<Activity />}
              />

              <StatCard
                title="Flagged Transactions"
                value={summary?.total_alerts ?? "-"}
                subtitle=""
                icon={<ClipboardCheck />}
              />
            </div>

            <DashboardCharts summary={summary} alerts={alerts} />

            <CountryAlertsMap alerts={alerts} />
          </>
        )}

        {activePage === "batch" && (
          <BatchScoring
            setSummary={setSummary}
            setAlerts={setAlerts}
            setActivePage={setActivePage}
          />
        )}

        {activePage === "alerts" && (
          <section className="placeholder-card">
            <div className="section-header">
              <div>
                <span className="eyebrow">Review Alerts</span>
                <h2>Model-Positive Transactions for Review</h2>
                <p>
                  Total review candidates: {alerts.length}.
                </p>
              </div>
            </div>

            <AlertsTable alerts={alerts} onInvestigate={handleInvestigate} />
          </section>
        )}

        {activePage === "investigator" && (
          <section className="placeholder-card">
            <span className="eyebrow">Investigator View</span>
            <h2>Transaction Investigator</h2>

            {!selectedAlert ? (
              <p>
                Select a transaction from Review Alerts to open a detailed
                investigation view.
              </p>
            ) : (
              <div className="investigator-grid">
                <div className="case-card case-overview-card">
                  <h3>Case Overview</h3>

                  {getCaseFields(selectedAlert).map((field) => (
                    <div className="case-row" key={field.key}>
                      <span>{field.label}</span>
                      <strong>{field.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="case-card">
                  <h3>AI-Assisted Investigator Note</h3>

                  <p className="investigator-note">
                    The XGBoost model selected this transaction for manual
                    review based on engineered temporal, categorical and
                    relational features. The LLM layer does not classify the
                    transaction; it only turns the model output and transaction
                    context into an analyst-friendly explanation.
                  </p>

                  <button
                    className="investigate-btn"
                    onClick={handleGenerateExplanation}
                    disabled={explanationLoading}
                  >
                    {explanationLoading
                      ? "Generating explanation..."
                      : "Generate AI Explanation"}
                  </button>

                  {aiExplanation && (
                    <div className="ai-explanation-box">
                      <h4>AI-Generated AML Explanation</h4>
                      <p>{cleanExplanationText(aiExplanation)}</p>
                    </div>
                  )}

                  <div className="risk-score-box">
                    <span>XGBoost Confidence</span>
                    <strong>
                      {(selectedAlert.fraud_probability * 100).toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {activePage === "about" && (
          <section className="about-page authenticated-about-page">
            <div className="about-intro">
              <h2>Explore AML Guard capabilities</h2>
              <p>
                AML Guard supports transaction screening, alert review and case
                investigation in one focused workflow. The application helps
                analysts move from uploaded transaction data to clear review
                candidates with model confidence and investigation context.
              </p>
            </div>

            <div className="capabilities-grid">
              <div className="capability-card">
                <span className="capability-icon"><ShieldCheck size={34} /></span>
                <h3>Screen suspicious activity</h3>
                <p>
                  Score transaction batches and separate normal traffic from
                  transactions that need analyst attention.
                </p>
              </div>

              <div className="capability-card">
                <span className="capability-icon"><BarChart3 size={34} /></span>
                <h3>Prioritize review work</h3>
                <p>
                  Sort and filter alerts by payment type, review level and model
                  confidence to focus on the most relevant cases.
                </p>
              </div>

              <div className="capability-card">
                <span className="capability-icon"><FileSearch size={34} /></span>
                <h3>Investigate case details</h3>
                <p>
                  Open individual alerts with sender, receiver, amount, time,
                  location and engineered AML features.
                </p>
              </div>

              <div className="capability-card">
                <span className="capability-icon"><Target size={34} /></span>
                <h3>Explain model output</h3>
                <p>
                  Generate readable investigation notes that help analysts
                  understand why a transaction was selected for review.
                </p>
              </div>
            </div>

            <div className="about-login-panel authenticated-about-visual">
              <img
                src="https://www.paycron.com/wp-content/uploads/2024/01/the-Power-of-AI-and-ML-in-Online-Payment-Fraud-Detection.jpg"
                alt="AI and machine learning payment fraud detection"
              />
              <div>
                <h3>AI-supported transaction review</h3>
                <p>
                  AML Guard combines batch scoring, alert prioritization and
                  investigation context so analysts can move from uploaded data
                  to review-ready cases in one secure workspace.
                </p>
              </div>
            </div>

            <div className="about-metrics">
              <div>
                <strong>100%</strong>
                <span>dataset rows scored</span>
              </div>
              <div>
                <strong>&gt;10M</strong>
                <span>transactions detected</span>
              </div>
              <div>
                <strong>XGBoost</strong>
                <span>deployed screening model</span>
              </div>
              <div>
                <strong>&lt;1 min</strong>
                <span>fast analyst workflow</span>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default Dashboard;
