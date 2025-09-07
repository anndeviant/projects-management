"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Calculator,
  Package,
  DollarSign,
  ExternalLink,
  Edit,
  Loader2,
} from "lucide-react";
import { useRAB } from "@/hooks/use-rab";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useEffect } from "react";

export default function RABPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { rabItems, loading, error, totalRAB } = useRAB(projectId);
  const { project } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPlatformInfo = (purchaseLink: string | null) => {
    if (!purchaseLink) return null;

    const link = purchaseLink.toLowerCase();

    // Check if it's a URL
    const urlPattern = /^(https?:\/\/|www\.)/;
    if (!urlPattern.test(purchaseLink)) {
      // Not a URL, treat as seller name
      return {
        isUrl: false,
        displayName: purchaseLink,
        url: null,
      };
    }

    // Detect platform based on URL
    if (link.includes("shopee")) {
      return {
        isUrl: true,
        displayName: "Shopee",
        url: purchaseLink,
      };
    } else if (link.includes("tokopedia")) {
      return {
        isUrl: true,
        displayName: "Tokopedia",
        url: purchaseLink,
      };
    } else if (link.includes("bukalapak")) {
      return {
        isUrl: true,
        displayName: "Bukalapak",
        url: purchaseLink,
      };
    } else if (link.includes("lazada")) {
      return {
        isUrl: true,
        displayName: "Lazada",
        url: purchaseLink,
      };
    } else if (link.includes("blibli")) {
      return {
        isUrl: true,
        displayName: "Blibli",
        url: purchaseLink,
      };
    } else if (link.includes("amazon")) {
      return {
        isUrl: true,
        displayName: "Amazon",
        url: purchaseLink,
      };
    } else if (link.includes("alibaba")) {
      return {
        isUrl: true,
        displayName: "Alibaba",
        url: purchaseLink,
      };
    } else {
      return {
        isUrl: true,
        displayName: "Link",
        url: purchaseLink,
      };
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusMap = {
      planning: { label: "Perencanaan", variant: "secondary" as const },
      pending: { label: "Menunggu", variant: "outline" as const },
      ordered: { label: "Dipesan", variant: "default" as const },
      delivered: { label: "Diterima", variant: "secondary" as const },
      completed: { label: "Selesai", variant: "default" as const },
    };

    const statusInfo =
      statusMap[(status || "planning") as keyof typeof statusMap] ||
      statusMap.planning;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
    <div className="px-4 pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RAB Management</h1>
          <p className="text-gray-600">
            {project?.name || "Loading project..."}
          </p>
        </div>
        <Link href={`/projects/${projectId}/rab/new`}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah RAB
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total RAB</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRAB)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Item</p>
                <p className="text-2xl font-bold">{rabItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selesai</p>
                <p className="text-2xl font-bold">
                  {
                    rabItems.filter((item) => item.status === "completed")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {rabItems.filter((item) => item.status === "pending").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RAB Items Table */}
      <Card className="pt-6 pb-6">
        <CardHeader>
          <CardTitle>Daftar RAB</CardTitle>
        </CardHeader>
        <CardContent>
          {rabItems.length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada item RAB
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan menambahkan item RAB pertama Anda
              </p>
              <Link href={`/projects/${projectId}/rab/new`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah RAB Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      Nama Item
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Sumber</th>
                    <th className="text-right py-3 px-4 font-medium">Qty</th>
                    <th className="text-right py-3 px-4 font-medium">
                      Harga Satuan
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rabItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.item_name}</p>
                          {item.purchase_link &&
                            (() => {
                              const platformInfo = getPlatformInfo(
                                item.purchase_link
                              );
                              if (!platformInfo) return null;

                              if (platformInfo.isUrl) {
                                return (
                                  <a
                                    href={platformInfo.url!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-1"
                                  >
                                    {platformInfo.displayName}{" "}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                );
                              } else {
                                return (
                                  <span className="text-gray-600 text-sm mt-1 block">
                                    {platformInfo.displayName}
                                  </span>
                                );
                              }
                            })()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {item.purchasing_source}
                      </td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.total_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/projects/${projectId}/rab/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
