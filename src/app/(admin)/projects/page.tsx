"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Plus,
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  Search,
  Loader2,
} from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import type { Project } from "@/lib/types";
import { formatCurrency, formatDateShort } from "@/lib/utils/format";

export default function ProjectsPage() {
  const { projects, loading, error } = useProjects();
  const { setSelectedProject } = useProjectContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    router.push(`/projects/${project.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyek</h1>
          <p className="text-gray-600">Kelola semua proyek Anda</p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Proyek Baru
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari proyek..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-shadow cursor-pointer pt-6 pb-2"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-1">
                      {project.name}
                    </CardTitle>
                  </div>
                </div>
                {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button> */}
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4 space-y-2">
              {/* <p className="text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p> */}

              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  {project.customer_name || "No customer"}
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDateShort(project.start_date)} -{" "}
                  {formatDateShort(project.end_date)}
                </div>

                <div className="flex items-center text-sm font-medium text-emerald-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {formatCurrency(project.total_budget)}
                </div>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleProjectSelect(project)}
                >
                  Pilih Proyek
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum ada proyek
          </h3>
          <p className="text-gray-600 mb-6">
            Mulai dengan membuat proyek pertama Anda
          </p>
          <Link href="/projects/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Buat Proyek Baru
            </Button>
          </Link>
        </div>
      )}

      {/* No Search Results */}
      {projects.length > 0 &&
        filteredProjects.length === 0 &&
        searchQuery.trim() && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada proyek ditemukan
            </h3>
            <p className="text-gray-600">
              Tidak ada proyek yang cocok dengan pencarian &ldquo;{searchQuery}
              &rdquo;
            </p>
          </div>
        )}
    </div>
  );
}
