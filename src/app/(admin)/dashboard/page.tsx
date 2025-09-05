import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Total Projects
            </h3>
            <FolderOpen className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <p className="text-xs text-green-600 mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Budget</h3>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$1,245,680</div>
            <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Team</h3>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">48</div>
            <p className="text-xs text-green-600 mt-1">+12 new members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">
              Completion Rate
            </h3>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">87.5%</div>
            <p className="text-xs text-green-600 mt-1">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Projects
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Office Renovation
                  </h4>
                  <p className="text-sm text-gray-600">
                    Construction • In Progress
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  $125,000
                </div>
                <div className="text-xs text-green-600">75% Complete</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Mobile App Development
                  </h4>
                  <p className="text-sm text-gray-600">Technology • Planning</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">$85,000</div>
                <div className="text-xs text-yellow-600">25% Complete</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Marketing Campaign
                  </h4>
                  <p className="text-sm text-gray-600">Marketing • Active</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">$45,000</div>
                <div className="text-xs text-green-600">90% Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Deadlines
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <Calendar className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  Office Renovation - Final Review
                </h4>
                <p className="text-sm text-gray-600">Due in 2 days</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  Mobile App - UI Design
                </h4>
                <p className="text-sm text-gray-600">Due in 1 week</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Calendar className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  Marketing Campaign - Content Creation
                </h4>
                <p className="text-sm text-gray-600">Due in 2 weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
