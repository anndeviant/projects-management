"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export default function LoadingSpinner({
  size = "md",
  message = "Loading...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`animate-spin rounded-full border-b-2 border-emerald-600 ${sizeClasses[size]}`}
        ></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
}
