"use client";

import { Suspense } from "react";
import LoginForm from "./login-form";
import LoadingSpinner from "@/components/ui/loading-spinner";

function LoginFormFallback() {
  return <LoadingSpinner size="sm" message="Loading..." />;
}

export default function LoginFormWrapper() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
