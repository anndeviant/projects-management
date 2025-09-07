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
import { X } from "lucide-react";
import { useInvoices } from "@/hooks/use-invoices";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { CreateInvoiceData } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils/format";
import Link from "next/link";
import { toast } from "sonner";

export default function NewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { createInvoice } = useInvoices(projectId);
  const { project } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();
  const [loading, setLoading] = useState(false);

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const [formData, setFormData] = useState<CreateInvoiceData>({
    project_id: projectId,
    description: "",
    price: 0,
    quantity: 1,
    total_amount: 0,
  });

  const handleInputChange = (
    field: keyof CreateInvoiceData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate total amount when price or quantity changes
    if (field === "price" || field === "quantity") {
      const price = field === "price" ? Number(value) : formData.price;
      const quantity = field === "quantity" ? Number(value) : formData.quantity;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        total_amount: price * quantity,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Deskripsi wajib diisi");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }

    if (formData.quantity <= 0) {
      toast.error("Quantity harus lebih dari 0");
      return;
    }

    setLoading(true);

    try {
      const result = await createInvoice(formData);
      if (result.success) {
        toast.success("Invoice item berhasil dibuat");
        router.push(`/projects/${projectId}/invoices`);
      } else {
        toast.error(result.error || "Gagal membuat invoice item");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Terjadi kesalahan saat membuat invoice item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container mx-auto w-full px-2 pb-2"
      suppressHydrationWarning
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoice Item Baru</h1>
            <p className="text-gray-600">
              {project?.name || "Loading project..."}
            </p>
          </div>
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

      <div className="w-full">
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
                  value={formData.description}
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
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
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
                    value={formData.quantity}
                    onChange={(e) =>
                      handleInputChange(
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Total Harga:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(formData.total_amount)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formData.quantity} × {formatCurrency(formData.price)}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Invoice Item"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
