import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../api";

export default function AuthenticationForm() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // login | signup | signup-admin
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ================= REGISTER =================
      if (mode !== "login") {
        if (!/^\d{10}$/.test(phone)) {
          toast.error("Phone must be 10 digits");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const role = mode === "signup-admin" ? "admin" : "user";

        await API.post("/register", {
          fullName,
          phone,
          password,
          role,
          adminSecret: role === "admin" ? "superadmin123" : null,
        });

        toast.success("Registration successful!");
        setMode("login");
        setPhone("");
        setPassword("");
        setFullName("");
        setConfirmPassword("");
        return;
      }

      // ================= LOGIN =================
      const res = await API.post("/login", {
        phone,
        password,
      });

      const { token, refreshToken, user } = res.data;

      // Store Tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("loggedInUser", JSON.stringify(user));

      toast.success("Login successful!");

      if (user.role === "admin") window.location.href = "/dashboard";
      else window.location.href = "/";

      setPhone("");
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2] p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Toggle Login / Signup */}
        <div className="flex justify-center mb-6 border-b border-gray-300">
          <button
            onClick={() => setMode("login")}
            className={`px-6 py-2 font-medium ${
              mode === "login"
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-6 py-2 font-medium ${
              mode !== "login"
                ? "border-b-2 border-black text-black"
                : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== "login" && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border-b border-gray-300 p-2 focus:border-black outline-none"
            />
          )}

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            maxLength="10"
            pattern="[0-9]{10}"
            required
            className="w-full border-b border-gray-300 p-2 focus:border-black outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-b border-gray-300 p-2 focus:border-black outline-none"
          />

          {mode !== "login" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border-b border-gray-300 p-2 focus:border-black outline-none"
            />
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
          >
            {mode === "login"
              ? "Login"
              : mode === "signup-admin"
              ? "Register as Admin"
              : "Register"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {mode === "login" && (
            <>
              Not registered?{" "}
              <span
                onClick={() => setMode("signup")}
                className="text-black font-medium cursor-pointer"
              >
                Create Account
              </span>
            </>
          )}

          {mode === "signup" && (
            <>
              Are you an Admin?{" "}
              <span
                onClick={() => setMode("signup-admin")}
                className="text-black font-medium cursor-pointer"
              >
                Register here
              </span>
            </>
          )}

          {mode === "signup-admin" && (
            <>
              Registering as Admin.{" "}
              <span
                onClick={() => setMode("signup")}
                className="text-black font-medium cursor-pointer"
              >
                Back to User Sign Up
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}