import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/AuthPage.css";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role?: string;
  name?: string;
  employeeId?: number;
  [key: string]: any;
}

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const resetForm = () => {
    setError("");
    setEmail("");
    setPassword("");
  };

  const switchToRegister = () => {
    resetForm();
    setIsRegister(true);
  };

  const switchToLogin = () => {
    resetForm();
    setIsRegister(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await api.post("/register", { email, password });
        alert("Registration successful! Please login.");
        switchToLogin();
      } else {
        const res = await api.post("/login", { email, password });
        const { token, role, name, employeeId } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
        localStorage.setItem("employeeId", String(employeeId));

        const decoded = jwtDecode<JwtPayload>(token);
        const userRole = decoded.role?.toLowerCase();

        switch (userRole) {
          case "admin":
            navigate("/dashboards/adminDashboard");
            break;
          case "hr":
            navigate("/dashboards/hrDashboard");
            break;
          case "manager":
            navigate("/dashboards/ManagerDashboard");
            break;
          case "team lead":
            navigate("/dashboards/TeamleadDashboard");
            break;
          case "developer":
            navigate("/dashboards/DeveloperDashboard");
            break;
          default:
            navigate("/");
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ??
          err.response?.data?.error ??
          "Something went wrong"
      );
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
    setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={handleEmailChange}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={handlePasswordChange}
            className="auth-input"
          />
          
          {!isRegister && (
            <div className="forgot-password-container">
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate("/reset-password")}
              >
                Forgot Password?
              </button>
            </div>
          )}
          
          <button type="submit" className="auth-button">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-footer">
          {isRegister ? (
            <p>
              Already have an account?{" "}
              <button onClick={switchToLogin}>Login here</button>
            </p>
          ) : (
            <>
              <p>
                Don’t have an account?{" "}
                <button onClick={switchToRegister}>Register here</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
