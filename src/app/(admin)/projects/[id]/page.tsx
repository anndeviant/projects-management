"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
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
    <div className="px-6 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Proyek
        </Button>
      </div>

      {/* Project Overview - More Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Total Budget
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {formatCurrency(project.total_budget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Periode Proyek
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(project.start_date)}
            </div>
            <div className="text-xs text-gray-500">
              s/d {formatDate(project.end_date)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">
                Customer
              </span>
            </div>
            <div className="text-lg font-medium text-gray-900 mt-1">
              {project.customer_name || "No customer"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href={`/projects/${projectId}/rab`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">RAB</h3>
                  <p className="text-xs text-gray-600">
                    Kelola Rencana Anggaran Biaya
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${projectId}/transactions`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Transaksi</h3>
                  <p className="text-xs text-gray-600">
                    Kelola transaksi keuangan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/projects/${projectId}/invoices`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Invoice</h3>
                  <p className="text-xs text-gray-600">
                    Kelola invoice dan pembayaran
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Customer Description - Separate full-width card */}
      {project.customer_desc && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detail Customer</h3>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {project.customer_desc}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Project Description - Full width */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Deskripsi Proyek</h3>
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {project.description || "Tidak ada deskripsi"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
