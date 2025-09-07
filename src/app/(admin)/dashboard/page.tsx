"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderOpen,
  DollarSign,
  TrendingUp,
  Plus,
  FileText,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useProjects } from "@/hooks/use-projects";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRABItems: number;
  totalRABValue: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
}

interface RecentProject {
  id: string;
  name: string;
  customer_name?: string;
  total_budget?: number;
  created_at: string;
  invoiceCount?: number;
  rabCount?: number;
}

interface RecentTransaction {
  id: string;
  description: string;
  debit?: number;
  credit?: number;
  transaction_type: string;
  transaction_date?: string;
  created_at: string;
  project?: {
    name: string;
  };
}

interface RecentRAB {
  id: string;
  item_name: string;
  total_price: number;
  status?: string;
  purchasing_source: string;
  created_at: string;
  project?: {
    name: string;
  };
}

export default function DashboardPage() {
  const { projects, loading: projectsLoading } = useProjects();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRABItems: 0,
    totalRABValue: 0,
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    netCashFlow: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [recentRAB, setRecentRAB] = useState<RecentRAB[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          invoicesResult,
          rabResult,
          transactionsResult,
          recentProjectsResult,
        ] = await Promise.all([
          // Fetch invoices data
          supabase
            .from("invoices")
            .select(
              `
              *,
              project:projects(name)
            `
            )
            .order("created_at", { ascending: false }),

          // Fetch RAB data
          supabase
            .from("budget_items")
            .select(
              `
              *,
              project:projects(name)
            `
            )
            .order("created_at", { ascending: false }),

          // Fetch transactions data
          supabase
            .from("transactions")
            .select(
              `
              *,
              project:projects(name)
            `
            )
            .order("created_at", { ascending: false }),

          // Fetch recent projects with additional data
          supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        const invoices = invoicesResult.data || [];
        const rabItems = rabResult.data || [];
        const transactions = transactionsResult.data || [];
        const recentProjectsData = recentProjectsResult.data || [];

        // Calculate project stats
        const totalProjects = projects.length;
        const activeProjects = projects.filter((p) => {
          const endDate = p.end_date ? new Date(p.end_date) : null;
          const now = new Date();
          return !endDate || endDate > now;
        }).length;

        const totalBudget = projects.reduce(
          (sum, p) => sum + (p.total_budget || 0),
          0
        );

        // Calculate invoice stats
        const totalInvoices = invoices.length;
        const totalRevenue = invoices.reduce(
          (sum, inv) => sum + inv.total_amount,
          0
        );
        const paidInvoices = invoices.filter(
          (inv) => inv.status === "paid"
        ).length;
        const pendingInvoices = invoices.filter(
          (inv) => inv.status === "sent"
        ).length;
        const overdueInvoices = invoices.filter((inv) => {
          if (inv.status === "overdue") return true;
          if (inv.status === "sent" && inv.due_date) {
            return new Date(inv.due_date) < new Date();
          }
          return false;
        }).length;

        // Calculate RAB stats
        const totalRABItems = rabItems.length;
        const totalRABValue = rabItems.reduce(
          (sum, rab) => sum + rab.total_price,
          0
        );

        // Calculate transaction stats
        const totalTransactions = transactions.length;
        const totalIncome = transactions.reduce(
          (sum, t) => sum + (t.credit || 0),
          0
        );
        const totalExpense = transactions.reduce(
          (sum, t) => sum + (t.debit || 0),
          0
        );
        const netCashFlow = totalIncome - totalExpense;

        setStats({
          totalProjects,
          activeProjects,
          totalBudget,
          totalRevenue,
          totalInvoices,
          paidInvoices,
          pendingInvoices,
          overdueInvoices,
          totalRABItems,
          totalRABValue,
          totalTransactions,
          totalIncome,
          totalExpense,
          netCashFlow,
        });

        // Set recent data
        setRecentProjects(recentProjectsData.slice(0, 5));
        setRecentTransactions(transactions.slice(0, 5));
        setRecentRAB(rabItems.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!projectsLoading) {
      fetchDashboardData();
    }
  }, [projects, projectsLoading, supabase]);

  if (loading || projectsLoading) {
    return (
      <div className="px-6 pb-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="px-6 pb-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Pantau performa proyek dan finansial secara real-time
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Proyek Baru
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Proyek */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FolderOpen className="h-4 w-4 text-emerald-600 mr-2" />
              Total Proyek
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-green-600">
              {stats.activeProjects} aktif
            </p>
          </CardContent>
        </Card>

        {/* Total Budget */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 text-blue-600 mr-2" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-gray-500">semua proyek</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500">
              {stats.totalInvoices} invoice
            </p>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
              Net Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div
              className={`text-2xl font-bold ${
                stats.netCashFlow >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.netCashFlow >= 0 ? "+" : ""}
              {formatCurrency(stats.netCashFlow)}
            </div>
            <p className="text-xs text-gray-500">
              {stats.totalTransactions} transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Budget Utilization */}
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 text-indigo-600 mr-2" />
              Budget vs Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Budget</span>
                <span className="font-medium">
                  {formatCurrency(stats.totalBudget)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Revenue</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              {stats.totalBudget > 0 && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (stats.totalRevenue / stats.totalBudget) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600">
                    {((stats.totalRevenue / stats.totalBudget) * 100).toFixed(
                      1
                    )}
                    % dari budget
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FileText className="h-4 w-4 text-green-600 mr-2" />
              Status Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                  Lunas
                </span>
                <span className="text-sm font-medium">
                  {stats.paidInvoices}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Clock className="h-3 w-3 text-yellow-500 mr-2" />
                  Pending
                </span>
                <span className="text-sm font-medium">
                  {stats.pendingInvoices}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <AlertTriangle className="h-3 w-3 text-red-500 mr-2" />
                  Overdue
                </span>
                <span className="text-sm font-medium">
                  {stats.overdueInvoices}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Wallet className="h-4 w-4 text-purple-600 mr-2" />
              Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600">Total Pemasukan</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(stats.totalIncome)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-red-600">Total Pengeluaran</span>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(stats.totalExpense)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium">RAB Items</span>
                <span className="text-sm font-medium">
                  {stats.totalRABItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Nilai RAB</span>
                <span className="text-sm font-medium">
                  {formatCurrency(stats.totalRABValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Analytics */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects">Proyek Terbaru</TabsTrigger>
          <TabsTrigger value="financial">Keuangan</TabsTrigger>
          <TabsTrigger value="rab">RAB Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader className="pb-3 pt-6">
              <CardTitle>Proyek Terbaru</CardTitle>
              <CardDescription>
                {recentProjects.length} proyek terbaru yang dibuat
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="flex items-center justify-between border-b pb-4 last:border-b-0 hover:bg-gray-50 p-2 rounded cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-500">
                              {project.customer_name || "No customer assigned"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {format(
                                  new Date(project.created_at),
                                  "dd MMM yyyy",
                                  { locale: localeId }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {project.total_budget
                              ? formatCurrency(project.total_budget)
                              : "No budget"}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Aktif
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada proyek yang dibuat</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 pt-6">
                <CardTitle>Transaksi Terbaru</CardTitle>
                <CardDescription>
                  {recentTransactions.length} transaksi terakhir
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between border-b pb-2 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              transaction.credit ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {transaction.credit ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <DollarSign className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">
                              {transaction.description}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {transaction.project?.name || "No project"} •{" "}
                              {transaction.transaction_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-sm font-medium ${
                              transaction.credit
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.credit ? "+" : "-"}
                            {formatCurrency(
                              transaction.credit || transaction.debit || 0
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.transaction_date
                              ? format(
                                  new Date(transaction.transaction_date),
                                  "dd MMM",
                                  { locale: localeId }
                                )
                              : format(
                                  new Date(transaction.created_at),
                                  "dd MMM",
                                  { locale: localeId }
                                )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Belum ada transaksi</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 pt-6">
                <CardTitle>Ringkasan Keuangan</CardTitle>
                <CardDescription>
                  Overview keuangan semua proyek
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">
                        {formatCurrency(stats.totalIncome)}
                      </div>
                      <div className="text-xs text-green-600">
                        Total Pemasukan
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-700">
                        {formatCurrency(stats.totalExpense)}
                      </div>
                      <div className="text-xs text-red-600">
                        Total Pengeluaran
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Net Cash Flow</span>
                      <span
                        className={`font-medium ${
                          stats.netCashFlow >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(stats.netCashFlow)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Invoices</span>
                      <span className="font-medium">{stats.totalInvoices}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Revenue vs Budget</span>
                      <span className="font-medium text-blue-600">
                        {stats.totalBudget > 0
                          ? `${(
                              (stats.totalRevenue / stats.totalBudget) *
                              100
                            ).toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rab">
          <Card>
            <CardHeader className="pb-3 pt-6">
              <CardTitle>RAB Items Terbaru</CardTitle>
              <CardDescription>
                {recentRAB.length} item RAB terbaru (
                {formatCurrency(stats.totalRABValue)})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="space-y-4">
                {recentRAB.length > 0 ? (
                  recentRAB.map((rab) => (
                    <div
                      key={rab.id}
                      className="flex items-center justify-between border-b pb-3 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            rab.status === "delivered"
                              ? "bg-green-100"
                              : rab.status === "ordered"
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                          }`}
                        >
                          <ShoppingCart
                            className={`w-5 h-5 ${
                              rab.status === "delivered"
                                ? "text-green-600"
                                : rab.status === "ordered"
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {rab.item_name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {rab.project?.name || "No project"} •{" "}
                            {rab.purchasing_source}
                          </p>
                          <p className="text-xs text-gray-400">
                            {format(new Date(rab.created_at), "dd MMM yyyy", {
                              locale: localeId,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(rab.total_price)}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            rab.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : rab.status === "ordered"
                              ? "bg-yellow-100 text-yellow-700"
                              : rab.status === "pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rab.status === "delivered"
                            ? "Diterima"
                            : rab.status === "ordered"
                            ? "Dipesan"
                            : rab.status === "pending"
                            ? "Pending"
                            : rab.status || "Planning"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Belum ada item RAB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 pt-6">
                <CardTitle>Performa Proyek</CardTitle>
                <CardDescription>
                  Analisis berdasarkan data aktual
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">
                        {stats.totalProjects > 0
                          ? `${Math.round(
                              (stats.activeProjects / stats.totalProjects) * 100
                            )}%`
                          : "0%"}
                      </div>
                      <div className="text-xs text-green-600">Proyek Aktif</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">
                        {stats.totalInvoices > 0
                          ? `${Math.round(
                              (stats.paidInvoices / stats.totalInvoices) * 100
                            )}%`
                          : "0%"}
                      </div>
                      <div className="text-xs text-blue-600">Invoice Paid</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg. Budget per Project</span>
                      <span className="font-medium text-green-600">
                        {stats.totalProjects > 0
                          ? formatCurrency(
                              stats.totalBudget / stats.totalProjects
                            )
                          : formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. Revenue per Project</span>
                      <span className="font-medium text-blue-600">
                        {stats.totalProjects > 0
                          ? formatCurrency(
                              stats.totalRevenue / stats.totalProjects
                            )
                          : formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cash Flow Ratio</span>
                      <span
                        className={`font-medium ${
                          stats.totalExpense > 0 &&
                          stats.totalIncome / stats.totalExpense > 1
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {stats.totalExpense > 0
                          ? `${(stats.totalIncome / stats.totalExpense).toFixed(
                              2
                            )}x`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 pt-6">
                <CardTitle>Distribusi Status</CardTitle>
                <CardDescription>
                  Breakdown status across all modules
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Invoice Status</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Paid ({stats.paidInvoices})</span>
                        <span>
                          {stats.totalInvoices > 0
                            ? (
                                (stats.paidInvoices / stats.totalInvoices) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.totalInvoices > 0
                                ? (stats.paidInvoices / stats.totalInvoices) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Project Status</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Active ({stats.activeProjects})</span>
                        <span>
                          {stats.totalProjects > 0
                            ? (
                                (stats.activeProjects / stats.totalProjects) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              stats.totalProjects > 0
                                ? (stats.activeProjects / stats.totalProjects) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">
                      Financial Health
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold">
                          {stats.totalTransactions}
                        </div>
                        <div className="text-xs text-gray-600">
                          Transactions
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold">
                          {stats.totalRABItems}
                        </div>
                        <div className="text-xs text-gray-600">RAB Items</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-sm font-bold">
                          {stats.totalInvoices}
                        </div>
                        <div className="text-xs text-gray-600">Invoices</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
