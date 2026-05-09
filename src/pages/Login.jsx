import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const Login = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const form = e.target;
    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      await result.user.reload();

      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
        await signOut(auth);
        localStorage.clear();

        throw new Error(
          "Email not verified. We sent another verification email. Check inbox or spam."
        );
      }

      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        localStorage.clear();

        throw new Error("User profile not found in Firestore.");
      }

      const userData = userSnap.data();

      if (userData.role !== role) {
        await signOut(auth);
        localStorage.clear();

        throw new Error(`This account is not registered as ${role}.`);
      }

      const loggedUser = {
        uid: result.user.uid,
        userId: userData.userId || "",
        name: userData.name || result.user.displayName || "User",
        email: result.user.email,
        avatar: userData.avatar || result.user.photoURL || "",
        role: userData.role,
        emailVerified: result.user.emailVerified,
      };

      localStorage.setItem("neub_current_user", JSON.stringify(loggedUser));

      // ADDED THIS ONLY
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
      <style>
        {`
          body {
            margin: 0;
            font-family: Arial, sans-serif;
          }

          .auth-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f0fdf4, #ffffff, #ecfdf5);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .auth-card {
            width: 100%;
            max-width: 460px;
            background: white;
            border-radius: 34px;
            padding: 30px 24px;
            box-shadow: 0 24px 60px rgba(15, 118, 110, 0.18);
          }

          .back-btn {
            background: none;
            border: none;
            color: #16a34a;
            font-weight: 900;
            cursor: pointer;
            padding: 0;
          }

          .icon {
            width: 88px;
            height: 88px;
            margin: 24px auto 18px;
            border-radius: 28px;
            background: linear-gradient(135deg, #16a34a, #059669);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 44px;
          }

          .title {
            text-align: center;
            color: #0f172a;
            font-size: 34px;
            margin: 0;
            font-weight: 900;
          }

          .subtitle {
            text-align: center;
            color: #64748b;
            line-height: 26px;
            margin: 10px 0 22px;
          }

          .role-tabs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 18px;
          }

          .role-tabs button {
            border: 1px solid #bbf7d0;
            background: #f0fdf4;
            color: #15803d;
            padding: 12px 6px;
            border-radius: 15px;
            font-weight: 900;
            cursor: pointer;
          }

          .role-tabs .active {
            background: #16a34a;
            color: white;
          }

          form {
            display: grid;
            gap: 13px;
          }

          input {
            width: 100%;
            padding: 15px;
            border-radius: 16px;
            border: 1px solid #d1d5db;
            font-size: 15px;
            box-sizing: border-box;
          }

          .error {
            background: #fee2e2;
            color: #b91c1c;
            padding: 12px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 700;
          }

          .main-btn {
            background: linear-gradient(135deg, #16a34a, #059669);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 18px;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
          }

          .main-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .bottom-text {
            margin-top: 20px;
            text-align: center;
            color: #64748b;
          }

          .link-btn {
            background: none;
            border: none;
            color: #16a34a;
            font-weight: 900;
            cursor: pointer;
          }

          @media (max-width: 480px) {
            .role-tabs {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="auth-card">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back Home
        </button>

        <div className="icon">🔐</div>

        <h1 className="title">Login</h1>

        <p className="subtitle">
          Only verified student, teacher, or admin emails can login.
        </p>

        <div className="role-tabs">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>

          <button
            type="button"
            className={role === "teacher" ? "active" : ""}
            onClick={() => setRole("teacher")}
          >
            Teacher
          </button>

          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleLogin}>
          <input
            name="email"
            type="email"
            placeholder="Verified Email"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />

          {error && <div className="error">{error}</div>}

          <button className="main-btn" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </button>
        </form>

        <p className="bottom-text">
          New user?{" "}
          <button
            className="link-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;