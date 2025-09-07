"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Package,
  Receipt,
  Eye,
  Loader2,
  Building,
  TrendingUp,
  TrendingDown,
  Search,
} from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useRAB } from "@/hooks/use-rab";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, formatDateShort } from "@/lib/utils/format";
import type { Project } from "@/lib/types";

export default function GuestPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6; // 2 rows of 3 projects each

  const { projects, loading: projectsLoading } = useProjects();
  const {
    rabItems,
    loading: rabLoading,
    totalRAB,
  } = useRAB(selectedProject?.id || "");
  const {
    transactions,
    loading: transactionsLoading,
    totalDebit,
    totalCredit,
    balance,
  } = useTransactions(selectedProject?.id || "");

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

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.customer_name &&
          project.customer_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset current page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  const getTransactionTypeBadge = (type: string) => {
    const badgeMap = {
      income: {
        label: "Pemasukan",
        className: "bg-green-100 text-green-800",
        icon: TrendingUp,
      },
      expense: {
        label: "Pengeluaran",
        className: "bg-red-100 text-red-800",
        icon: TrendingDown,
      },
      transfer: {
        label: "Transfer",
        className: "bg-blue-100 text-blue-800",
        icon: Receipt,
      },
      adjustment: {
        label: "Penyesuaian",
        className: "bg-gray-100 text-gray-800",
        icon: Receipt,
      },
    };

    return badgeMap[type as keyof typeof badgeMap] || badgeMap.adjustment;
  };

  // Project Detail View
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PM</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  Projects Management
                </span>
              </div>

              <Button
                variant="ghost"
                onClick={handleBackToProjects}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Proyek
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Project Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedProject.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {selectedProject.customer_name || "Tidak ada customer"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDateShort(selectedProject.start_date)} -{" "}
                    {formatDateShort(selectedProject.end_date)}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatCurrency(selectedProject.total_budget)}
                  </div>
                </div>
              </div>
              {/* <Badge variant="secondary" className="w-fit">
                <Eye className="w-4 h-4 mr-2" />
                Tampilan Transparansi
              </Badge> */}
            </div>

            {selectedProject.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-700">{selectedProject.description}</p>
              </div>
            )}
          </div>

          {/* Transparency Tabs */}
          <Tabs defaultValue="rab" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rab" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Rencana Anggaran Biaya (RAB)
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                Transaksi Keuangan
              </TabsTrigger>
            </TabsList>

            {/* RAB Tab */}
            <TabsContent value="rab">
              <Card className="py-4">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Daftar Item RAB
                      </CardTitle>
                      <CardDescription>
                        Transparansi penggunaan anggaran untuk item-item proyek
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total RAB</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalRAB)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {rabLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Memuat data RAB...</span>
                    </div>
                  ) : rabItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Belum ada item RAB untuk proyek ini
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">
                              Item
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">
                              Sumber
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">
                              Qty
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">
                              Harga Satuan
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">
                              Ongkir/Pajak
                            </th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">
                              Total
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-600">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rabItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.item_name}
                                  </p>
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
                                            className="text-blue-600 hover:underline text-sm"
                                          >
                                            {platformInfo.displayName} →
                                          </a>
                                        );
                                      } else {
                                        return (
                                          <span className="text-gray-600 text-sm">
                                            {platformInfo.displayName}
                                          </span>
                                        );
                                      }
                                    })()}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700">
                                {item.purchasing_source}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {formatCurrency(item.shipping_tax || 0)}
                              </td>
                              <td className="py-3 px-4 text-right font-medium">
                                {formatCurrency(item.total_price)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge
                                  variant={
                                    item.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    item.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "delivered"
                                      ? "bg-blue-100 text-blue-800"
                                      : item.status === "ordered"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {item.status === "completed"
                                    ? "Selesai"
                                    : item.status === "delivered"
                                    ? "Diterima"
                                    : item.status === "ordered"
                                    ? "Dipesan"
                                    : item.status === "pending"
                                    ? "Menunggu"
                                    : "Rencana"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Total Pemasukan
                        </span>
                      </div>
                      <p className="text-xl font-bold text-green-600 mt-1">
                        {formatCurrency(totalCredit)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Total Pengeluaran
                        </span>
                      </div>
                      <p className="text-xl font-bold text-red-600 mt-1">
                        {formatCurrency(totalDebit)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                          Saldo
                        </span>
                      </div>
                      <p
                        className={`text-xl font-bold mt-1 ${
                          balance >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Transactions Table */}
                <Card className="py-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-blue-600" />
                      Riwayat Transaksi
                    </CardTitle>
                    <CardDescription>
                      Transparansi alur keuangan proyek
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Memuat data transaksi...</span>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-12">
                        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Belum ada transaksi untuk proyek ini
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">
                                Tanggal
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">
                                Deskripsi
                              </th>
                              <th className="text-center py-3 px-4 font-medium text-gray-600">
                                Tipe
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">
                                Keluar
                              </th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">
                                Masuk
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction) => {
                              const badgeInfo = getTransactionTypeBadge(
                                transaction.transaction_type
                              );
                              const Icon = badgeInfo.icon;

                              return (
                                <tr
                                  key={transaction.id}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="py-3 px-4 text-gray-700">
                                    {formatDateShort(
                                      transaction.transaction_date
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <p className="font-medium text-gray-900">
                                      {transaction.description}
                                    </p>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge className={badgeInfo.className}>
                                      <Icon className="w-3 h-3 mr-1" />
                                      {badgeInfo.label}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-right text-red-600 font-medium">
                                    {transaction.debit
                                      ? formatCurrency(transaction.debit)
                                      : "-"}
                                  </td>
                                  <td className="py-3 px-4 text-right text-green-600 font-medium">
                                    {transaction.credit
                                      ? formatCurrency(transaction.credit)
                                      : "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Main landing page with home-like structure
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Projects Management
              </span>
            </div>

            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transparansi
            <span className="text-emerald-600"> Proyek</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Lihat progress proyek, anggaran (RAB), dan transaksi keuangan secara
            real-time. Transparansi penuh untuk semua stakeholder tanpa perlu
            login.
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                const projectsSection =
                  document.getElementById("projects-section");
                projectsSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Lihat Proyek
            </Button>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Login Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects-section" className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Daftar Proyek
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Pilih proyek untuk melihat transparansi anggaran dan transaksi
            </p>

            {/* Search Input */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Cari berdasarkan nama proyek atau customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-lg">Memuat daftar proyek...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="text-center py-12 max-w-md mx-auto">
              <CardContent>
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? "Proyek Tidak Ditemukan" : "Belum Ada Proyek"}
                </h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? `Tidak ada proyek yang sesuai dengan pencarian "${searchQuery}"`
                    : "Saat ini belum ada proyek yang tersedia untuk ditampilkan"}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Hapus Pencarian
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Projects Grid with Horizontal Scroll for more than 3 projects */}
              <div
                className={`${
                  currentProjects.length > 3 ? "overflow-x-auto pb-4" : ""
                }`}
              >
                <div
                  className={`${
                    currentProjects.length > 3
                      ? "flex gap-8 min-w-max"
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  }`}
                >
                  {currentProjects.map((project) => (
                    <Card
                      key={project.id}
                      className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group pt-6 pb-6 ${
                        currentProjects.length > 3 ? "flex-shrink-0 w-80" : ""
                      }`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <CardHeader>
                        <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                          {project.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-3 text-gray-400" />
                          <span className="font-medium">Customer:</span>
                          <span className="ml-2 truncate">
                            {project.customer_name || "Tidak ada customer"}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                          <span className="font-medium">Timeline:</span>
                          <span className="ml-2">
                            {formatDateShort(project.start_date)} -{" "}
                            {formatDateShort(project.end_date)}
                          </span>
                        </div>

                        <div className="flex items-center text-sm">
                          <DollarSign className="w-4 h-4 mr-3 text-emerald-500" />
                          <span className="font-medium text-gray-600">
                            Budget:
                          </span>
                          <span className="ml-2 font-bold text-emerald-600">
                            {formatCurrency(project.total_budget)}
                          </span>
                        </div>

                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Transparansi
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(page);
                                  }}
                                  isActive={currentPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (
                            page === currentPage - 2 ||
                            page === currentPage + 2
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {/* Results Summary */}
              <div className="text-center mt-8">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  <Building className="w-4 h-4 mr-2" />
                  {searchQuery
                    ? `${filteredProjects.length} dari ${projects.length} proyek ditemukan`
                    : `${projects.length} Proyek Tersedia`}
                </Badge>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PM</span>
                </div>
                <span className="text-xl font-semibold">
                  Projects Management
                </span>
              </div>
              <p className="text-gray-400">
                Platform manajemen proyek dengan transparansi penuh untuk
                membangun kepercayaan.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Fitur</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Transparansi Proyek</li>
                <li>RAB Real-time</li>
                <li>Tracking Transaksi</li>
                <li>Dashboard Admin</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Akses</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Tampilan Publik</li>
                <li>Dashboard Admin</li>
                <li>Mobile Responsive</li>
                <li>Real-time Updates</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Dokumentasi</li>
                <li>Tutorial</li>
                <li>Contact Support</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Projects Management. Platform transparansi proyek
              terpercaya.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
