import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      await login(email, password);
      // Let the ProtectedRoute redirect or handle post-login naturally
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--nexus-bg-page)] p-4">
      <div className="w-full max-w-md bg-[var(--nexus-card-bg)] rounded-xl shadow-[var(--nexus-card-shadow)] border border-[var(--nexus-card-border)] p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-[var(--nexus-accent-primary)] rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">CC</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--nexus-text-primary)]">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--nexus-text-secondary)] mt-2">
            Sign in to access Command Center 2.0
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-[var(--nexus-text-secondary)]">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[var(--nexus-text-secondary)]">
                Password
              </Label>
              <a href="#" className="text-xs text-[var(--nexus-accent-primary)] hover:underline">
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[var(--nexus-input-bg)] border-[var(--nexus-input-border)] text-[var(--nexus-text-primary)]"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[var(--nexus-button-bg)] hover:bg-[var(--nexus-button-hover)] text-white border-0"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}