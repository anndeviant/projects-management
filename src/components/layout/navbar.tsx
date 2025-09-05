"use client";

import { Button } from "@/components/ui/button";
import { User, Menu } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 hidden sm:block">
              Projects Management
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* User Email */}
            {user?.email && (
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </span>
            )}

            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
