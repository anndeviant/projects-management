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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Trash2, Loader2 } from "lucide-react";
import { useRABItem, useRAB } from "@/hooks/use-rab";
import { useProject } from "@/hooks/use-projects";
import { formatCurrency } from "@/lib/utils/format";
import { toast } from "sonner";

interface EditRABPageProps {
  params: Promise<{
    id: string;
    rabId: string;
  }>;
}

export default function EditRABPage({ params }: EditRABPageProps) {
  const { id, rabId } = use(params);
  const router = useRouter();
  const { rabItem, loading } = useRABItem(rabId);
  const { updateRABItem, deleteRABItem } = useRAB(id);
  const { project } = useProject(id);

  const [formData, setFormData] = useState({
    item_name: "",
    purchasing_source: "",
    quantity: 1,
    unit_price: 0,
    shipping_tax: 0,
    purchase_link: "",
    status: "planning",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (rabItem) {
      setFormData({
        item_name: rabItem.item_name,
        purchasing_source: rabItem.purchasing_source,
        quantity: rabItem.quantity,
        unit_price: rabItem.unit_price,
        shipping_tax: rabItem.shipping_tax ?? 0,
        purchase_link: rabItem.purchase_link || "",
        status: rabItem.status || "planning",
      });
    }
  }, [rabItem]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateTotal = () => {
    return formData.quantity * formData.unit_price + formData.shipping_tax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rabItem) return;

    // Basic validation
    if (!formData.item_name.trim()) {
      toast.error("Nama item harus diisi");
      return;
    }
    if (!formData.purchasing_source.trim()) {
      toast.error("Sumber pembelian harus diisi");
      return;
    }
    if (formData.quantity < 1) {
      toast.error("Kuantitas minimal 1");
      return;
    }
    if (formData.unit_price < 0) {
      toast.error("Harga satuan tidak boleh negatif");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updateRABItem({
        id: rabItem.id,
        item_name: formData.item_name,
        purchasing_source: formData.purchasing_source,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        shipping_tax: formData.shipping_tax,
        purchase_link: formData.purchase_link || undefined,
        status: formData.status as
          | "planning"
          | "pending"
          | "ordered"
          | "delivered"
          | "completed",
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Item RAB berhasil diperbarui!");
      router.push(`/projects/${id}/rab`);
    } catch (err) {
      console.error("Error updating RAB item:", err);
      toast.error("Terjadi kesalahan saat memperbarui item RAB");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!rabItem) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteRABItem(rabItem.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Item RAB berhasil dihapus!");
      router.push(`/projects/${id}/rab`);
    } catch (err) {
      console.error("Error deleting RAB item:", err);
      toast.error("Terjadi kesalahan saat menghapus item RAB");
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

  if (!rabItem) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Item RAB tidak ditemukan
        </h1>
        <Link href={`/projects/${id}/rab`}>
          <Button>Kembali ke RAB</Button>
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
            <h1 className="text-2xl font-bold">Edit Item RAB</h1>
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
                  <AlertDialogTitle>Hapus Item RAB</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus item RAB &ldquo;
                    {formData.item_name}&rdquo;? Tindakan ini tidak dapat
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
            <Link href={`/projects/${id}/rab`}>
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
            <CardTitle>Informasi Item RAB</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item_name" className="text-sm font-medium">
                Nama Item <span className="text-red-500">*</span>
              </Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleInputChange("item_name", e.target.value)}
                placeholder="Contoh: Server Hosting Premium"
                required
              />
            </div>

            {/* Purchasing Source */}
            <div className="space-y-2">
              <Label
                htmlFor="purchasing_source"
                className="text-sm font-medium"
              >
                Sumber Pembelian <span className="text-red-500">*</span>
              </Label>
              <Input
                id="purchasing_source"
                value={formData.purchasing_source}
                onChange={(e) =>
                  handleInputChange("purchasing_source", e.target.value)
                }
                placeholder="Contoh: AWS, Tokopedia, dll"
                required
              />
            </div>

            {/* Quantity and Unit Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Kuantitas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", parseInt(e.target.value) || 1)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price" className="text-sm font-medium">
                  Harga Satuan (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) =>
                    handleInputChange(
                      "unit_price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Shipping/Tax */}
            <div className="space-y-2">
              <Label htmlFor="shipping_tax" className="text-sm font-medium">
                Ongkir / Pajak (Rp)
              </Label>
              <Input
                id="shipping_tax"
                type="number"
                min="0"
                value={formData.shipping_tax}
                onChange={(e) =>
                  handleInputChange(
                    "shipping_tax",
                    parseFloat(e.target.value) || 0
                  )
                }
                placeholder="0"
              />
            </div>

            {/* Purchase Link */}
            <div className="space-y-2">
              <Label htmlFor="purchase_link" className="text-sm font-medium">
                Link Pembelian / Nama Penjual
              </Label>
              <Input
                id="purchase_link"
                value={formData.purchase_link}
                onChange={(e) =>
                  handleInputChange("purchase_link", e.target.value)
                }
                placeholder="https://... atau Nama Penjual"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Perencanaan</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Dipesan</SelectItem>
                  <SelectItem value="delivered">Diterima</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Harga:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ({formData.quantity} × {formatCurrency(formData.unit_price)}) +{" "}
                {formatCurrency(formData.shipping_tax)}
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
                    <AlertDialogTitle>Hapus Item RAB</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus item RAB &ldquo;
                      {formData.item_name}&rdquo;? Tindakan ini tidak dapat
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
