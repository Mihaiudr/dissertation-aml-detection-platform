import { useState } from "react";
import {
  BarChart3,
  FileSearch,
  LogIn,
  ShieldCheck,
  Target,
} from "lucide-react";
import { loginUser, registerUser } from "../api";

function Login({ onLogin }) {
  const [publicPage, setPublicPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function openAccess(mode) {
    setAuthMode(mode);
    setAuthError("");
    setAuthMessage("");
    setPublicPage("access");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    setAuthError("");
    setAuthMessage("");

    if (authMode === "register" && password !== confirmPassword) {
      setAuthError("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === "register") {
        await registerUser({
          first_name: formData.get("firstName"),
          second_name: formData.get("secondName"),
          username,
          email: formData.get("email"),
          password,
        });

        setAuthMessage("Account created. You can now authenticate.");
        setAuthMode("login");
        event.currentTarget.reset();
        return;
      }

      await loginUser({ username, password });
      onLogin();
    } catch (error) {
      setAuthError(error.response?.data?.detail || "Authentication request failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <header className="landing-nav">
        <button className="landing-brand" type="button" onClick={() => setPublicPage("home")}>
          <span className="brand-mark" aria-hidden="true">
            <i />
          </span>
          <strong>AML Guard</strong>
        </button>

      </header>

      <main className="landing-main">
        {publicPage === "home" && (
          <section className="landing-hero">
            <div className="landing-copy">
              <h1>Detect suspicious transactions before they become risk.</h1>
              <p>
                AML Guard helps analysts screen transaction datasets, review
                model-positive alerts and investigate high-risk activity with a
                focused banking workflow.
              </p>

              <div className="landing-cta-row">
                <button className="primary-cta" onClick={() => openAccess("login")}>
                  Login
                </button>
                <button className="outline-cta" type="button" onClick={() => setPublicPage("about")}>
                  About Us
                </button>
              </div>
            </div>

            <div className="landing-visual" aria-label="AML transaction monitoring illustration">
              <img
                src="/aml-fi.avif"
                alt="AML monitoring interface"
              />
            </div>
          </section>
        )}

        {publicPage === "access" && (
          <section className="auth-panel page-panel" id="access">
            <div className="auth-copy">
              <span className="landing-kicker">Secure Access</span>
              <h2>{authMode === "login" ? "Authenticate to AML Guard" : "Create an AML Guard account"}</h2>
              <p>
                {authMode === "login"
                  ? "Use your username and password to access the AML screening workspace."
                  : "Register an analyst profile before accessing the application prototype."}
              </p>

              {authMode === "login" ? (
                <button className="switch-auth" type="button" onClick={() => setAuthMode("register")}>
                  Do not have an account? Register here
                </button>
              ) : (
                <button className="switch-auth" type="button" onClick={() => setAuthMode("login")}>
                  Already have an account? Authenticate here
                </button>
              )}
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {authError && <p className="auth-status auth-status-error">{authError}</p>}
              {authMessage && <p className="auth-status auth-status-success">{authMessage}</p>}

              {authMode === "register" && (
                <>
                  <label>
                    First Name
                    <input name="firstName" type="text" placeholder="Mihai" required />
                  </label>

                  <label>
                    Second Name
                    <input name="secondName" type="text" placeholder="Udriste" required />
                  </label>

                  <label>
                    Email
                    <input name="email" type="email" placeholder="analyst@amlguard.com" required />
                  </label>
                </>
              )}

              <label>
                Username
                <input name="username" type="text" placeholder="aml_analyst" required />
              </label>

              <label>
                Password
                <input name="password" type="password" placeholder="Password" required />
              </label>

              {authMode === "register" && (
                <label>
                  Confirm Password
                  <input name="confirmPassword" type="password" placeholder="Confirm password" required />
                </label>
              )}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Authenticate"
                    : "Register Account"}
              </button>
            </form>
          </section>
        )}

        {publicPage === "about" && (
          <section className="about-page">
            <div className="about-intro">
              <h2>Explore AML Guard capabilities</h2>
              <p>
                AML Guard supports transaction screening, alert review and case
                investigation in one focused workflow. The application helps
                analysts move from uploaded transaction data to clear review
                candidates with model confidence and investigation context.
              </p>
            </div>

            <div className="about-login-panel">
              <img
                src="https://www.paycron.com/wp-content/uploads/2024/01/the-Power-of-AI-and-ML-in-Online-Payment-Fraud-Detection.jpg"
                alt="AI and machine learning payment fraud detection"
              />
              <div>
                <h3>Start reviewing alerts</h3>
                <p>Access the AML Guard workspace and continue with dataset scoring, alert review and investigation.</p>
                <button className="primary-cta about-start" type="button" onClick={() => openAccess("login")}>
                  <LogIn size={20} /> Login
                </button>
              </div>
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

export default Login;
