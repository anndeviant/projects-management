import LoginFormWrapper from "@/components/auth/login-form-wrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FolderOpen, Calendar, Users, BarChart3 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <LoginFormWrapper />
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
        <div className="flex flex-col justify-center p-8 text-white relative z-10">
          {/* Main Feature Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Streamline Project Management
              </h3>
              <div className="bg-white/20 rounded-lg p-2">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
            </div>

            <p className="text-white/80 text-sm mb-3 leading-relaxed">
              Manage your projects efficiently with our comprehensive platform.
              Track progress, manage budgets, and collaborate with your team
              seamlessly.
            </p>

            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
            >
              Learn more
            </Button>

            {/* Project Dashboard Preview */}
            <div className="mt-4 relative">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white text-sm font-medium">
                    Active Projects
                  </div>
                  <div className="text-white/70 text-xs">24 Total</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-white/80 text-xs">
                      Office Renovation
                    </div>
                    <div className="text-white text-xs font-medium">75%</div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-3 bg-white rounded-lg p-2.5 text-gray-900">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Completion Rate</span>
                <div className="flex items-center">
                  <BarChart3 className="w-3 h-3 text-green-500 mr-1" />
                  <span className="font-semibold">87.5%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature Highlight */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">
              Powerful Project Features
            </h2>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    Timeline Management
                  </div>
                  <div className="text-white/70 text-xs">
                    Track milestones and deadlines
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    Team Collaboration
                  </div>
                  <div className="text-white/70 text-xs">
                    Work together seamlessly
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex space-x-2 pt-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full border border-white/20"></div>
          <div className="absolute bottom-1/4 left-1/4 w-16 h-16 rounded-full border border-white/20"></div>
          <div className="absolute top-1/2 right-1/2 w-12 h-12 rounded-full border border-white/20"></div>
        </div>
      </div>
    </div>
  );
}
