"use client";

import { useState, useEffect, use } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, Loader2, CalendarIcon } from "lucide-react";
import { useTransaction, useTransactions } from "@/hooks/use-transactions";
import { useProject } from "@/hooks/use-projects";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface EditTransactionPageProps {
  params: Promise<{
    id: string;
    transactionId: string;
  }>;
}

export default function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id, transactionId } = use(params);
  const router = useRouter();
  const { transaction, loading } = useTransaction(transactionId);
  const { updateTransaction, deleteTransaction } = useTransactions(id);
  const { project } = useProject(id);

  const [formData, setFormData] = useState({
    transaction_date: new Date(),
    description: "",
    transaction_type: "expense",
    debit: 0,
    credit: 0,
    proof_document_url: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        transaction_date: transaction.transaction_date
          ? new Date(transaction.transaction_date)
          : new Date(transaction.created_at),
        description: transaction.description,
        transaction_type: transaction.transaction_type,
        debit: transaction.debit || 0,
        credit: transaction.credit || 0,
        proof_document_url: transaction.proof_document_url || "",
      });
    }
  }, [transaction]);

  const handleInputChange = (field: string, value: string | number | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getAmountDisplay = () => {
    if (formData.debit > 0) return formatCurrency(formData.debit);
    if (formData.credit > 0) return formatCurrency(formData.credit);
    return formatCurrency(0);
  };

  const shouldShowDebit = () => {
    return ["expense", "transfer"].includes(formData.transaction_type);
  };

  const shouldShowCredit = () => {
    return ["income", "adjustment", "transfer"].includes(
      formData.transaction_type
    );
  };

  // Auto-adjust debit/credit based on transaction type
  useEffect(() => {
    if (
      formData.transaction_type === "income" ||
      formData.transaction_type === "adjustment"
    ) {
      setFormData((prev) => ({ ...prev, debit: 0 }));
    } else if (formData.transaction_type === "expense") {
      setFormData((prev) => ({ ...prev, credit: 0 }));
    }
  }, [formData.transaction_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    // Basic validation
    if (!formData.description.trim()) {
      toast.error("Deskripsi harus diisi");
      return;
    }
    if (formData.debit <= 0 && formData.credit <= 0) {
      toast.error("Minimal salah satu dari debit atau kredit harus diisi");
      return;
    }
    if (formData.debit > 0 && formData.credit > 0) {
      toast.error("Tidak bisa mengisi debit dan kredit bersamaan");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updateTransaction({
        id: transaction.id,
        transaction_date: format(formData.transaction_date, "yyyy-MM-dd"),
        description: formData.description,
        transaction_type: formData.transaction_type as
          | "income"
          | "expense"
          | "transfer"
          | "adjustment",
        debit: formData.debit,
        credit: formData.credit,
        proof_document_url: formData.proof_document_url || undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Transaksi berhasil diperbarui!");
      router.push(`/projects/${id}/transactions`);
    } catch (err) {
      console.error("Error updating transaction:", err);
      toast.error("Terjadi kesalahan saat memperbarui transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteTransaction(transaction.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Transaksi berhasil dihapus!");
      router.push(`/projects/${id}/transactions`);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      toast.error("Terjadi kesalahan saat menghapus transaksi");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Transaksi tidak ditemukan
        </h1>
        <Link href={`/projects/${id}/transactions`}>
          <Button>Kembali ke Transaksi</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto w-full px-2 pb-2"
      suppressHydrationWarning
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Transaksi</h1>
            <p className="text-gray-600">
              {project?.name || "Loading project..."} -{" "}
              {project?.customer_name || ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="hidden sm:flex"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus transaksi &ldquo;
                    {formData.description}&rdquo;? Tindakan ini tidak dapat
                    dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menghapus...
                      </>
                    ) : (
                      "Ya, Hapus"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Link href={`/projects/${id}/transactions`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full pt-6 pb-6">
          <CardHeader>
            <CardTitle>Informasi Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Date */}
            <div className="space-y-2">
              <Label htmlFor="transaction_date" className="text-sm font-medium">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.transaction_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.transaction_date
                      ? format(formData.transaction_date, "dd MMMM yyyy", {
                          locale: localeId,
                        })
                      : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.transaction_date}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange("transaction_date", date);
                        setShowCalendar(false);
                      }
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="transaction_type" className="text-sm font-medium">
                Tipe Transaksi <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) =>
                  handleInputChange("transaction_type", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="adjustment">Penyesuaian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Masukkan deskripsi transaksi..."
                rows={3}
                required
              />
            </div>

            {/* Amount Fields */}
            <div className="space-y-4">
              {shouldShowDebit() && (
                <div className="space-y-2">
                  <Label
                    htmlFor="debit"
                    className="text-sm font-medium text-red-600"
                  >
                    Debit (Pengeluaran) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="debit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.debit}
                    onChange={(e) =>
                      handleInputChange(
                        "debit",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
              )}

              {shouldShowCredit() && (
                <div className="space-y-2">
                  <Label
                    htmlFor="credit"
                    className="text-sm font-medium text-green-600"
                  >
                    Kredit (Pemasukan) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="credit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.credit}
                    onChange={(e) =>
                      handleInputChange(
                        "credit",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {/* Proof Document URL */}
            <div className="space-y-2">
              <Label
                htmlFor="proof_document_url"
                className="text-sm font-medium"
              >
                Dokumen Bukti (Opsional)
              </Label>
              <Input
                id="proof_document_url"
                value={formData.proof_document_url}
                onChange={(e) =>
                  handleInputChange("proof_document_url", e.target.value)
                }
                placeholder="https://... atau nama file"
              />
            </div>

            {/* Amount Display */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">
                  Jumlah Transaksi:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  {getAmountDisplay()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formData.transaction_type === "income" &&
                  "Pemasukan ke proyek"}
                {formData.transaction_type === "expense" &&
                  "Pengeluaran dari proyek"}
                {formData.transaction_type === "transfer" &&
                  "Transfer antar akun"}
                {formData.transaction_type === "adjustment" &&
                  "Penyesuaian saldo"}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || isDeleting}
            >
              Batal
            </Button>
            <div className="flex items-center gap-2">
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="sm:hidden"
                    disabled={isDeleting || isSubmitting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus transaksi &ldquo;
                      {formData.description}&rdquo;? Tindakan ini tidak dapat
                      dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        "Ya, Hapus"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="submit" disabled={isSubmitting || isDeleting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
