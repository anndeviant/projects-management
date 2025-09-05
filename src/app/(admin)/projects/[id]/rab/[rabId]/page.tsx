"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Save, Calculator, Trash2 } from "lucide-react";
import { useRABItem } from "@/hooks/use-rab";

interface EditRABPageProps {
  params: {
    id: string;
    rabId: string;
  };
}

export default function EditRABPage({ params }: EditRABPageProps) {
  const { id, rabId } = params;
  const { rabItem, loading } = useRABItem(rabId);

  const [formData, setFormData] = useState({
    item_name: "",
    purchasing_source: "",
    quantity: 1,
    unit_price: 0,
    shipping_tax: 0,
    purchase_link: "",
    status: "planning",
  });

  const project = {
    name: "Website E-commerce Development",
    customer: "PT. Digital Solutions",
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateTotal = () => {
    return formData.quantity * formData.unit_price + formData.shipping_tax;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update to Supabase
    console.log("Updating RAB item:", {
      ...formData,
      total_price: calculateTotal(),
    });
  };

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus item RAB ini?")) {
      // TODO: Implement delete from Supabase
      console.log("Deleting RAB item:", rabId);
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${id}/rab`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke RAB
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Item RAB</h1>
          </div>
          <p className="text-gray-600">
            {project.name} - {project.customer}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          className="hidden sm:flex"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Hapus
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Detail Item RAB</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="item_name" className="text-sm font-medium">
                Nama Item *
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
                Sumber Pembelian *
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
                  Kuantitas *
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
                  Harga Satuan (Rp) *
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
                Link Pembelian
              </Label>
              <Input
                id="purchase_link"
                type="url"
                value={formData.purchase_link}
                onChange={(e) =>
                  handleInputChange("purchase_link", e.target.value)
                }
                placeholder="https://..."
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Perencanaan</option>
                <option value="pending">Pending</option>
                <option value="ordered">Dipesan</option>
                <option value="delivered">Diterima</option>
                <option value="completed">Selesai</option>
              </select>
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

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="sm:hidden"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>

              <Link
                href={`/projects/${id}/rab`}
                className="flex-1 sm:flex-none"
              >
                <Button type="button" variant="outline" className="w-full">
                  Batal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
