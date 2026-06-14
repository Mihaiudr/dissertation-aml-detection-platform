import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { clearToken, getCurrentUser, getToken } from "./api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    getCurrentUser().catch(() => {
      clearToken();
      setIsLoggedIn(false);
    });
  }, []);

  function handleLogout() {
    clearToken();
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
