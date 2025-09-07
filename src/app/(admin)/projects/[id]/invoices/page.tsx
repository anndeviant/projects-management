"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Plus,
  Receipt,
  DollarSign,
  Edit,
  Loader2,
  FileText,
  CalendarIcon,
} from "lucide-react";
import { useInvoices } from "@/hooks/use-invoices";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/utils/pdf-generator";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { invoices, loading, error, totalAmount } = useInvoices(projectId);
  const { project } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();

  // State untuk invoice number dan date
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const handlePreviewPDF = async () => {
    if (!invoiceNumber.trim()) {
      toast.error("Invoice number harus diisi untuk preview PDF");
      return;
    }

    if (!invoiceDate) {
      toast.error("Tanggal invoice harus diisi untuk preview PDF");
      return;
    }

    if (invoices.length === 0) {
      toast.error("Tidak ada item invoice untuk di-generate PDF");
      return;
    }

    try {
      await generateInvoicePDF(
        invoices,
        project,
        invoiceNumber,
        invoiceDate.toISOString().split("T")[0],
        true
      );
      toast.success("PDF preview berhasil dibuat");
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast.error("Gagal membuat preview PDF");
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
            Invoice Management
          </h1>
          <p className="text-gray-600">
            {project?.name || "Loading project..."}
          </p>
        </div>
        <Link href={`/projects/${projectId}/invoices/new`}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Invoice Item
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Header Section */}
      <Card className="pt-6 pb-6">
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Invoice Number</Label>
              <Input
                id="invoice_number"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Masukkan nomor invoice"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice_date">Invoice Date</Label>
              <Popover
                open={isDatePickerOpen}
                onOpenChange={setIsDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? formatDate(invoiceDate) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={(date) => {
                      if (date) {
                        setInvoiceDate(date);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Button
                onClick={handlePreviewPDF}
                disabled={!invoiceNumber.trim() || !invoiceDate}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items Table */}
      <Card className="pt-6 pb-6">
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada invoice items
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan menambahkan invoice item pertama Anda
              </p>
              <Link href={`/projects/${projectId}/invoices/new`}>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Invoice Item Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 font-medium">Price</th>
                    <th className="text-right py-3 px-4 font-medium">Qty.</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-center py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium">{item.description}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.total_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/projects/${projectId}/invoices/${item.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td
                      colSpan={3}
                      className="py-3 px-4 text-right font-semibold"
                    >
                      Total:
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-lg">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
