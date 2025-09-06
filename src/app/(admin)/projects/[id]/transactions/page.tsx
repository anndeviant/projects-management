"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ExternalLink,
  Edit,
  Loader2,
} from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function TransactionsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { transactions, loading, error, totalDebit, totalCredit, balance } =
    useTransactions(projectId);
  const { project } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const getTransactionTypeBadge = (type: string) => {
    const badgeMap = {
      income: {
        label: "Pemasukan",
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      expense: {
        label: "Pengeluaran",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
      transfer: {
        label: "Transfer",
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800",
      },
      adjustment: {
        label: "Penyesuaian",
        variant: "outline" as const,
        className: "bg-gray-100 text-gray-800",
      },
    };

    const badgeInfo =
      badgeMap[type as keyof typeof badgeMap] || badgeMap.adjustment;
    return (
      <Badge variant={badgeInfo.variant} className={badgeInfo.className}>
        {badgeInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  const getProofDocumentLink = (url: string | null | undefined) => {
    if (!url) return null;

    // Check if it's a URL
    const urlPattern = /^(https?:\/\/|www\.)/;
    if (urlPattern.test(url)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          Lihat Dokumen
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    } else {
      // Not a URL, treat as filename
      return <span className="text-gray-600 text-sm">{url}</span>;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Transactions Management
          </h1>
          <p className="text-gray-600">
            {project?.name || "Loading project..."}
          </p>
        </div>
        <Link href={`/projects/${projectId}/transactions/new`}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debit</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDebit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Kredit
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalCredit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign
                className={`h-8 w-8 ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo</p>
                <p
                  className={`text-2xl font-bold ${
                    balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Transaksi
                </p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="pt-6 pb-6">
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada transaksi
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan menambahkan transaksi pertama Anda
              </p>
              <Link href={`/projects/${projectId}/transactions/new`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Transaksi Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Deskripsi
                    </th>
                    <th className="text-center py-3 px-4 font-medium">Tipe</th>
                    <th className="text-right py-3 px-4 font-medium">Debit</th>
                    <th className="text-right py-3 px-4 font-medium">Kredit</th>
                    <th className="text-center py-3 px-4 font-medium">
                      Dokumen
                    </th>
                    <th className="text-center py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm">
                        {formatDate(
                          transaction.transaction_date || transaction.created_at
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getTransactionTypeBadge(transaction.transaction_type)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {transaction.debit && transaction.debit > 0 ? (
                          <span className="text-red-600 font-medium">
                            {formatCurrency(transaction.debit)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {transaction.credit && transaction.credit > 0 ? (
                          <span className="text-green-600 font-medium">
                            {formatCurrency(transaction.credit)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getProofDocumentLink(transaction.proof_document_url)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/projects/${projectId}/transactions/${transaction.id}`}
                          >
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
