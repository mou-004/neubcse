import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config.js";

const TEACHER_SECRET_CODE = "NEUB-TEACHER-2026";
const ADMIN_SECRET_CODE = "NEUB-ADMIN-2026";

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.target;

    const userId = form.userId.value.trim();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const secretCode = form.secretCode?.value.trim() || "";

    try {
      if (role === "teacher" && secretCode !== TEACHER_SECRET_CODE) {
        throw new Error("Invalid teacher secret code.");
      }

      if (role === "admin" && secretCode !== ADMIN_SECRET_CODE) {
        throw new Error("Invalid admin secret code.");
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        userId,
        name,
        email,
        role,
        emailVerified: false,
        createdAt: serverTimestamp(),
      });

      await sendEmailVerification(result.user);

      await signOut(auth);
      localStorage.clear();

      setSuccess(
        "Registration successful. Verification email sent. Check inbox or spam, then login after verifying."
      );

      form.reset();
      setRole("student");

      setTimeout(() => {
        navigate("/login");
      }, 2500);
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

          input:focus {
            outline: none;
            border-color: #16a34a;
            box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.13);
          }

          .error {
            background: #fee2e2;
            color: #b91c1c;
            padding: 12px;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 700;
          }

          .success {
            background: #dcfce7;
            color: #15803d;
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

          .secret-note {
            margin: -4px 0 0;
            color: #64748b;
            font-size: 13px;
            line-height: 20px;
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

        <div className="icon">📝</div>

        <h1 className="title">Register</h1>

        <p className="subtitle">
          Use a real email. Verification is required before login.
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

        <form onSubmit={handleRegister}>
          <input
            name="userId"
            type="text"
            placeholder={
              role === "student"
                ? "Student ID"
                : role === "teacher"
                ? "Teacher ID"
                : "Admin ID"
            }
            required
          />

          <input
            name="name"
            type="text"
            placeholder="Full Name"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Real Email"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password minimum 6 characters"
            minLength="6"
            required
          />

          {role === "teacher" && (
            <>
              <input
                name="secretCode"
                type="password"
                placeholder="Teacher Secret Code"
                required
              />

              <p className="secret-note">
                Teacher registration needs department secret code.
              </p>
            </>
          )}

          {role === "admin" && (
            <>
              <input
                name="secretCode"
                type="password"
                placeholder="Admin Secret Code"
                required
              />

              <p className="secret-note">
                Admin registration needs admin secret code.
              </p>
            </>
          )}

          {error && <div className="error">{error}</div>}

          {success && <div className="success">{success}</div>}

          <button className="main-btn" type="submit" disabled={loading}>
            {loading ? "Sending Verification..." : `Register as ${role}`}
          </button>
        </form>

        <p className="bottom-text">
          Already have account?{" "}
          <button className="link-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;