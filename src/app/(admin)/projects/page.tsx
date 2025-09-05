import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  MoreHorizontal,
} from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "Office Renovation",
      description:
        "Complete renovation of the main office building including electrical and plumbing work",
      category: "Construction",
      budget: 125000,
      spent: 93750,
      progress: 75,
      status: "In Progress",
      deadline: "2025-10-15",
      team: 8,
    },
    {
      id: 2,
      title: "Mobile App Development",
      description:
        "Development of a mobile application for iOS and Android platforms",
      category: "Technology",
      budget: 85000,
      spent: 21250,
      progress: 25,
      status: "Planning",
      deadline: "2025-12-01",
      team: 5,
    },
    {
      id: 3,
      title: "Marketing Campaign",
      description: "Digital marketing campaign for Q4 product launch",
      category: "Marketing",
      budget: 45000,
      spent: 40500,
      progress: 90,
      status: "Active",
      deadline: "2025-09-30",
      team: 3,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Planning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">
            Manage and track all your projects in one place.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 max-w-2xl">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Budget */}
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      ${project.spent.toLocaleString()} / $
                      {project.budget.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Budget</div>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs font-medium text-gray-900">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Team */}
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {project.team} members
                    </div>
                    <div className="text-xs text-gray-600">Team</div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600">Deadline</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex space-x-2">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/rab`}>
                    <Button variant="outline" size="sm">
                      RAB
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/transactions`}>
                    <Button variant="outline" size="sm">
                      Transactions
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/invoices`}>
                    <Button variant="outline" size="sm">
                      Invoices
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
