"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProjects } from "@/hooks/use-projects";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const formSchema = z
  .object({
    name: z.string().min(1, "Nama proyek harus diisi"),
    customer_name: z.string().min(1, "Nama customer harus diisi"),
    customer_desc: z.string().optional(),
    description: z.string().optional(),
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    total_budget: z.number().min(0, "Budget tidak boleh negatif").optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: "Tanggal selesai harus setelah tanggal mulai",
      path: ["end_date"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject } = useProjects();
  const [mounted, setMounted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      customer_name: "",
      customer_desc: "",
      description: "",
      start_date: undefined,
      end_date: undefined,
      total_budget: undefined,
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await createProject({
        name: values.name,
        customer_name: values.customer_name || undefined,
        customer_desc: values.customer_desc || undefined,
        description: values.description || undefined,
        start_date: values.start_date
          ? values.start_date.toISOString().split("T")[0]
          : undefined,
        end_date: values.end_date
          ? values.end_date.toISOString().split("T")[0]
          : undefined,
        total_budget: values.total_budget || undefined,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Proyek berhasil dibuat!");
      router.push("/projects");
    } catch (err) {
      console.error("Error creating project:", err);
      toast.error("Terjadi kesalahan saat membuat proyek");
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
            <h1 className="text-2xl font-bold">Proyek Baru</h1>
            <p className="text-gray-600">Buat proyek baru untuk customer</p>
          </div>
          <Link href="/projects">
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <Card className="w-full pt-6 pb-6">
            <CardHeader>
              <CardTitle>Informasi Proyek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nama Proyek */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Proyek <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama proyek" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer Name */}
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nama Customer <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama customer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Customer Description */}
              <FormField
                control={form.control}
                name="customer_desc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detail Customer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detail customer, alamat, kontak, dsb (opsional)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deskripsi */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Proyek</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi proyek (opsional)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Mulai</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && mounted ? (
                                format(field.value, "d MMMM yyyy", {
                                  locale: id,
                                })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date("1900-01-01")}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value && mounted ? (
                                format(field.value, "d MMMM yyyy", {
                                  locale: id,
                                })
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01") ||
                              (watchedValues.start_date
                                ? date < watchedValues.start_date
                                : false)
                            }
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Budget */}
              <FormField
                control={form.control}
                name="total_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex items-center">
                          Rp
                        </span>
                        <Input
                          type="number"
                          placeholder="0"
                          className="pl-10"
                          min="0"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || value === null) {
                              field.onChange(undefined);
                            } else {
                              const numValue = Number(value);
                              field.onChange(
                                isNaN(numValue) ? undefined : numValue
                              );
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {form.formState.isSubmitting ? "Menyimpan..." : "Buat Proyek"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
