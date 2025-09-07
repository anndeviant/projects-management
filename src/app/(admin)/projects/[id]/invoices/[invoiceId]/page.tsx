"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { X, Trash2, Loader2 } from "lucide-react";
import { useInvoice, useInvoices } from "@/hooks/use-invoices";
import { useProject } from "@/hooks/use-projects";
import { UpdateInvoiceData } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { toast } from "sonner";
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

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const invoiceId = params.invoiceId as string;
  const { invoice, loading: invoiceLoading } = useInvoice(invoiceId);
  const { updateInvoice, deleteInvoice } = useInvoices(projectId);
  const { project } = useProject(projectId);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState<UpdateInvoiceData>({
    id: invoiceId,
    description: "",
    price: 0,
    quantity: 1,
    total_amount: 0,
  });

  // Update form data when invoice is loaded
  useEffect(() => {
    if (invoice) {
      setFormData({
        id: invoice.id,
        description: invoice.description,
        price: invoice.price,
        quantity: invoice.quantity,
        total_amount: invoice.total_amount,
      });
    }
  }, [invoice]);

  const handleInputChange = (
    field: keyof UpdateInvoiceData,
    value: string | number | undefined
  ) => {
    if (field === "id") return; // Don't allow ID changes

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate total amount when price or quantity changes
    if (field === "price" || field === "quantity") {
      const price = field === "price" ? Number(value) : formData.price || 0;
      const quantity =
        field === "quantity" ? Number(value) : formData.quantity || 1;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        total_amount: price * quantity,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description?.trim()) {
      toast.error("Deskripsi wajib diisi");
      return;
    }

    if ((formData.price || 0) <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }

    if ((formData.quantity || 0) <= 0) {
      toast.error("Quantity harus lebih dari 0");
      return;
    }

    setLoading(true);

    try {
      const result = await updateInvoice(invoiceId, formData);
      if (result) {
        toast.success("Invoice item berhasil diperbarui");
        router.push(`/projects/${projectId}/invoices`);
      } else {
        toast.error("Gagal memperbarui invoice item");
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error("Terjadi kesalahan saat memperbarui invoice item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      const success = await deleteInvoice(invoiceId);
      if (success) {
        toast.success("Invoice item berhasil dihapus");
        router.push(`/projects/${projectId}/invoices`);
      } else {
        toast.error("Gagal menghapus invoice item");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Terjadi kesalahan saat menghapus invoice item");
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (invoiceLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Invoice item tidak ditemukan
        </h1>
        <Link href={`/projects/${projectId}/invoices`}>
          <Button>Kembali ke Invoice</Button>
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
            <h1 className="text-2xl font-bold">Edit Invoice Item</h1>
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
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Invoice Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus invoice item &ldquo;
                    {formData.description}&rdquo;? Tindakan ini tidak dapat
                    dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteLoading ? (
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
            <Link href={`/projects/${projectId}/invoices`}>
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
            <CardTitle>Informasi Invoice Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Masukkan deskripsi item"
                rows={3}
                required
              />
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Harga <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || 0}
                  onChange={(e) =>
                    handleInputChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Kuantitas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || 1}
                  onChange={(e) =>
                    handleInputChange("quantity", parseInt(e.target.value) || 1)
                  }
                  placeholder="1"
                  required
                />
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Harga:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(formData.total_amount || 0)}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formData.quantity || 0} × {formatCurrency(formData.price || 0)}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading || deleteLoading}
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
                    disabled={deleteLoading || loading}
                  >
                    {deleteLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Hapus
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Invoice Item</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus invoice item &ldquo;
                      {formData.description}&rdquo;? Tindakan ini tidak dapat
                      dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleteLoading ? (
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
              <Button type="submit" disabled={loading || deleteLoading}>
                {loading ? (
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
