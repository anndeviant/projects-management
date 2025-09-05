"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Edit,
  FileText,
  Receipt,
  Calculator,
  Loader2,
} from "lucide-react";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useEffect } from "react";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, loading, error } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">
            Error: {error || "Project not found"}
          </p>
          <Link href="/projects">
            <Button>Kembali ke Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Aktif
            </span>
            <span className="text-gray-600">
              {project.customer_name || "No customer"}
            </span>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Proyek
        </Button>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(project.total_budget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              Periode Proyek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(project.start_date)}
            </div>
            <div className="text-sm text-gray-500">
              s/d {formatDate(project.end_date)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium text-gray-900">
              {project.customer_name || "No customer"}
            </div>
            {project.customer_desc && (
              <p className="text-sm text-gray-600 mt-1">
                {project.customer_desc}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      <Card>
        <CardHeader>
          <CardTitle>Deskripsi Proyek</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {project.description || "Tidak ada deskripsi"}
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/projects/${projectId}/rab`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">RAB</h3>
                  <p className="text-sm text-gray-600">
                    Kelola Rencana Anggaran Biaya
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${projectId}/transactions`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Transaksi</h3>
                  <p className="text-sm text-gray-600">
                    Kelola transaksi keuangan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${projectId}/invoices`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Invoice</h3>
                  <p className="text-sm text-gray-600">
                    Kelola invoice dan pembayaran
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
