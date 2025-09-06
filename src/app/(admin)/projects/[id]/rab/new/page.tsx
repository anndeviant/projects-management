"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRAB } from "@/hooks/use-rab";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useEffect } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";

const formSchema = z.object({
  item_name: z.string().min(1, "Nama item harus diisi"),
  purchasing_source: z.string().min(1, "Sumber pembelian harus diisi"),
  quantity: z.number().min(1, "Kuantitas minimal 1"),
  unit_price: z.number().min(0, "Harga satuan tidak boleh negatif"),
  shipping_tax: z.number().min(0, "Ongkir/pajak tidak boleh negatif"),
  purchase_link: z.string().optional().or(z.literal("")),
  status: z.enum(["planning", "pending", "ordered", "delivered", "completed"]),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewRABPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { createRABItem } = useRAB(projectId);
  const { project } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: "",
      purchasing_source: "",
      quantity: 1,
      unit_price: 0,
      shipping_tax: 0,
      purchase_link: "",
      status: "planning",
    },
  });

  const watchedValues = form.watch();
  const calculateTotal = () => {
    return (
      (watchedValues.quantity || 0) * (watchedValues.unit_price || 0) +
      (watchedValues.shipping_tax || 0)
    );
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await createRABItem({
        project_id: projectId,
        item_name: values.item_name,
        purchasing_source: values.purchasing_source,
        quantity: values.quantity,
        unit_price: values.unit_price,
        shipping_tax: values.shipping_tax,
        purchase_link: values.purchase_link || undefined,
        status: values.status,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Item RAB berhasil ditambahkan!");
      router.push(`/projects/${projectId}/rab`);
    } catch (err) {
      console.error("Error creating RAB item:", err);
      toast.error("Terjadi kesalahan saat menyimpan item RAB");
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
            <h1 className="text-2xl font-bold">Item RAB Baru</h1>
            <p className="text-gray-600">
              {project?.name || "Loading project..."}
            </p>
          </div>
          <Link href={`/projects/${projectId}/rab`}>
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <Card className="w-full pt-6 pb-6">
              <CardHeader>
                <CardTitle>Informasi Item RAB</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Item Name */}
                <FormField
                  control={form.control}
                  name="item_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Item <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Server Hosting Premium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Purchasing Source */}
                <FormField
                  control={form.control}
                  name="purchasing_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Sumber Pembelian <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: AWS, Tokopedia, dll"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity and Unit Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Kuantitas <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Harga Satuan (Rp){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Shipping/Tax */}
                <FormField
                  control={form.control}
                  name="shipping_tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ongkir / Pajak (Rp)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Purchase Link */}
                <FormField
                  control={form.control}
                  name="purchase_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Pembelian / Nama Penjual</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://... atau Nama Penjual"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Perencanaan</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="ordered">Dipesan</SelectItem>
                          <SelectItem value="delivered">Diterima</SelectItem>
                          <SelectItem value="completed">Selesai</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Total Calculation */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      Total Harga:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    ({watchedValues.quantity || 0} ×{" "}
                    {formatCurrency(watchedValues.unit_price || 0)}) +{" "}
                    {formatCurrency(watchedValues.shipping_tax || 0)}
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
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Menyimpan..."
                    : "Simpan Item RAB"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
