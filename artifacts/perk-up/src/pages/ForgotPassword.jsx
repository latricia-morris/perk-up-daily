import React from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

// Password reset requires an email delivery service, which is not configured
// on this deployment yet. Rather than pretending to send a reset link, we
// tell the user honestly how to regain access.
export default function ForgotPassword() {
  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="Account recovery"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Back to log in
        </Link>
      }
    >
      <div className="space-y-3 text-center">
        <p className="text-sm text-foreground">
          Self-service password reset isn&apos;t available yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Please contact support and we&apos;ll help you regain access to your
          account.
        </p>
      </div>
    </AuthLayout>
  );
}
