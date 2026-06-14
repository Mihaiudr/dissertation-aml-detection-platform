import { useState } from "react";

const PAGE_SIZE = 25;

function AlertsTable({ alerts, onInvestigate }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentType, setPaymentType] = useState("all");
  const [reviewLevel, setReviewLevel] = useState("all");
  const [maxConfidence, setMaxConfidence] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const paymentTypes = [...new Set(alerts.map((alert) => alert.Payment_type).filter(Boolean))];
  const reviewLevels = [...new Set(alerts.map((alert) => alert.risk_level).filter(Boolean))];
  const filteredAlerts = alerts.filter((alert) => {
    const confidence = Number(alert.fraud_probability) * 100;
    const accountText = `${alert.Sender_account ?? ""} ${alert.Receiver_account ?? ""}`.toLowerCase();

    return (
      (paymentType === "all" || alert.Payment_type === paymentType) &&
      (reviewLevel === "all" || alert.risk_level === reviewLevel) &&
      (!maxConfidence || confidence <= Number(maxConfidence)) &&
      (!accountSearch || accountText.includes(accountSearch.toLowerCase()))
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageAlerts = filteredAlerts.slice(startIndex, startIndex + PAGE_SIZE);

  function updateFilter(callback) {
    callback();
    setCurrentPage(1);
  }

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  return (
    <>
      {alerts.length > 0 && (
        <div className="alerts-filters">
          <label>
            Account
            <input
              type="search"
              placeholder="Sender or receiver"
              value={accountSearch}
              onChange={(event) => updateFilter(() => setAccountSearch(event.target.value))}
            />
          </label>

          <label>
            Payment Type
            <select
              value={paymentType}
              onChange={(event) => updateFilter(() => setPaymentType(event.target.value))}
            >
              <option value="all">All types</option>
              {paymentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Review Level
            <select
              value={reviewLevel}
              onChange={(event) => updateFilter(() => setReviewLevel(event.target.value))}
            >
              <option value="all">All levels</option>
              {reviewLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>

          <label>
            Max Confidence
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="0-100"
              value={maxConfidence}
              onChange={(event) => updateFilter(() => setMaxConfidence(event.target.value))}
            />
          </label>
        </div>
      )}

      <div className="alerts-table-wrapper">
        <table className="alerts-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Payment Type</th>
              <th>Model Output</th>
              <th>Review Level</th>
              <th>Confidence</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  Load a dataset to generate review candidates.
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  No alerts match the selected filters.
                </td>
              </tr>
            ) : (
              pageAlerts.map((alert, index) => (
                <tr key={`${alert.Sender_account}-${alert.Receiver_account}-${startIndex + index}`}>
                  <td>{alert.Sender_account}</td>
                  <td>{alert.Receiver_account}</td>
                  <td>
                    {Number(alert.Amount).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>{alert.Payment_type}</td>
                  <td>{alert.prediction}</td>
                  <td>
                    <span className={`risk-badge ${alert.risk_level?.toLowerCase()}`}>
                      {alert.risk_level}
                    </span>
                  </td>
                  <td>{(alert.fraud_probability * 100).toFixed(2)}%</td>
                  <td>
                    <button
                      className="investigate-btn"
                      onClick={() => onInvestigate(alert)}
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredAlerts.length > PAGE_SIZE && (
        <div className="alerts-pagination">
          <span>
            Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredAlerts.length)} of {filteredAlerts.length}
          </span>

          <div className="pagination-actions">
            <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1}>
              Previous
            </button>
            <strong>
              Page {safePage} of {totalPages}
            </strong>
            <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages}>
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AlertsTable;
