import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const applyOnboardingPreferences = async () => {
    const onboardingData = JSON.parse(localStorage.getItem("perkup-onboarding") || "{}");
    if (Object.keys(onboardingData).length === 0) return;

    const updateData = {
      christian_content: onboardingData.christianContent || false,
      selected_categories: JSON.stringify(onboardingData.selectedCategories || []),
      morning_enabled: true,
      midday_enabled: true,
      evening_enabled: true,
      morning_time: onboardingData.notificationTimes?.morning || "07:00",
      midday_time: onboardingData.notificationTimes?.midday || "12:00",
      evening_time: onboardingData.notificationTimes?.evening || "19:00",
      phone_number: onboardingData.phoneNumber || "",
      country_code: onboardingData.countryCode || "US",
      sms_consent: onboardingData.smsConsent || false,
      analytics_consent: onboardingData.analytics_consent || false,
      analytics_consent_timestamp: onboardingData.analytics_consent_timestamp || null,
      ...(onboardingData.birthday ? { birthday: onboardingData.birthday } : {}),
    };
    await base44.auth.updateMe(updateData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Registration is immediate on this deployment. Passwords are sent only
      // to the HTTPS API and are never saved in browser storage.
      await base44.auth.register({ email, password });
      await applyOnboardingPreferences();
      window.location.href = "/paywall";
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/paywall");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/paywall");

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={<>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></>}
    >
      <div className="space-y-3 mb-6">
        <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={handleGoogle}>
          <GoogleIcon className="w-5 h-5 mr-2" />Continue with Google
        </Button>
        <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={handleApple}>
          <AppleIcon className="w-5 h-5 mr-2" />Continue with Apple
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or</span></div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}