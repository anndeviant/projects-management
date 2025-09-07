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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransactions } from "@/hooks/use-transactions";
import { useProject } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const formSchema = z
  .object({
    transaction_date: z.date({ message: "Tanggal transaksi harus diisi" }),
    description: z.string().min(1, "Deskripsi harus diisi"),
    transaction_type: z.enum(["income", "expense", "transfer", "adjustment"]),
    debit: z.number().min(0, "Debit tidak boleh negatif").optional(),
    credit: z.number().min(0, "Kredit tidak boleh negatif").optional(),
    proof_document_url: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // Must have either debit or credit, but not both
      const hasDebit = data.debit && data.debit > 0;
      const hasCredit = data.credit && data.credit > 0;

      if (!hasDebit && !hasCredit) return false;
      if (hasDebit && hasCredit) return false;

      return true;
    },
    {
      message:
        "Harus mengisi salah satu dari debit atau kredit, tidak boleh keduanya",
      path: ["debit"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export default function NewTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { createTransaction } = useTransactions(projectId);
  const { project } = useProject(projectId);
  const { setSelectedProject } = useProjectContext();
  const [showCalendar, setShowCalendar] = useState(false);

  // Set selected project when component mounts
  useEffect(() => {
    if (project) {
      setSelectedProject(project);
    }
  }, [project, setSelectedProject]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transaction_date: new Date(),
      description: "",
      transaction_type: "expense",
      debit: 0,
      credit: 0,
      proof_document_url: "",
    },
  });

  const watchedValues = form.watch();

  // Auto-adjust debit/credit based on transaction type
  useEffect(() => {
    const transactionType = watchedValues.transaction_type;

    if (transactionType === "income" || transactionType === "adjustment") {
      form.setValue("debit", 0);
    } else if (transactionType === "expense") {
      form.setValue("credit", 0);
    }
    // transfer can have both, so we don't auto-adjust for transfer
  }, [watchedValues.transaction_type, form]);

  const getAmountDisplay = () => {
    const debit = watchedValues.debit || 0;
    const credit = watchedValues.credit || 0;

    if (debit > 0) return formatCurrency(debit);
    if (credit > 0) return formatCurrency(credit);
    return formatCurrency(0);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await createTransaction({
        project_id: projectId,
        transaction_date: format(values.transaction_date, "yyyy-MM-dd"),
        description: values.description,
        transaction_type: values.transaction_type,
        debit: values.debit || 0,
        credit: values.credit || 0,
        proof_document_url: values.proof_document_url || undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Transaksi berhasil ditambahkan!");
      router.push(`/projects/${projectId}/transactions`);
    } catch (err) {
      console.error("Error creating transaction:", err);
      toast.error("Terjadi kesalahan saat menyimpan transaksi");
    }
  };

  const shouldShowDebit = () => {
    return ["expense", "transfer"].includes(watchedValues.transaction_type);
  };

  const shouldShowCredit = () => {
    return ["income", "adjustment", "transfer"].includes(
      watchedValues.transaction_type
    );
  };

  return (
    <div
      className="container mx-auto w-full px-2 pb-2"
      suppressHydrationWarning
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transaksi Baru</h1>
            <p className="text-gray-600">
              {project?.name || "Loading project..."}
            </p>
          </div>
          <Link href={`/projects/${projectId}/transactions`}>
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
                <CardTitle>Informasi Transaksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transaction Date */}
                <FormField
                  control={form.control}
                  name="transaction_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tanggal Transaksi{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Popover
                        open={showCalendar}
                        onOpenChange={setShowCalendar}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "dd MMMM yyyy", {
                                    locale: id,
                                  })
                                : "Pilih tanggal"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setShowCalendar(false);
                              }
                            }}
                            disabled={(date) => date > new Date()}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transaction Type */}
                <FormField
                  control={form.control}
                  name="transaction_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipe Transaksi <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih tipe transaksi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Pemasukan</SelectItem>
                          <SelectItem value="expense">Pengeluaran</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="adjustment">
                            Penyesuaian
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Deskripsi <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Masukkan deskripsi transaksi..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount Fields */}
                <div className="space-y-4">
                  {shouldShowDebit() && (
                    <FormField
                      control={form.control}
                      name="debit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-red-600">
                            Debit (Pengeluaran){" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
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
                  )}

                  {shouldShowCredit() && (
                    <FormField
                      control={form.control}
                      name="credit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-600">
                            Kredit (Pemasukan){" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
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
                  )}
                </div>

                {/* Proof Document URL */}
                <FormField
                  control={form.control}
                  name="proof_document_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dokumen Bukti (Opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://... atau nama file"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                    {watchedValues.transaction_type === "income" &&
                      "Pemasukan ke proyek"}
                    {watchedValues.transaction_type === "expense" &&
                      "Pengeluaran dari proyek"}
                    {watchedValues.transaction_type === "transfer" &&
                      "Transfer antar akun"}
                    {watchedValues.transaction_type === "adjustment" &&
                      "Penyesuaian saldo"}
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
                    : "Simpan Transaksi"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
