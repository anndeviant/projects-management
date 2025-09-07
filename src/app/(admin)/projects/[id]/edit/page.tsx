"use client";

import { useEffect, useState, use } from "react";
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
import { Calendar as CalendarIcon, X, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProject, useProjects } from "@/hooks/use-projects";
import { useProjectContext } from "@/contexts/project-context";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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

interface EditProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { project, loading } = useProject(id);
  const { updateProject, deleteProject } = useProjects();
  const { selectedProject, setSelectedProject } = useProjectContext();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        customer_name: project.customer_name || "",
        customer_desc: project.customer_desc || "",
        description: project.description || "",
        start_date: project.start_date
          ? new Date(project.start_date)
          : undefined,
        end_date: project.end_date ? new Date(project.end_date) : undefined,
        total_budget: project.total_budget || undefined,
      });
    }
  }, [project, form]);

  const onSubmit = async (values: FormValues) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const { error } = await updateProject({
        id: project.id,
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

      toast.success("Proyek berhasil diperbarui!");
      router.push(`/projects/${id}`);
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Terjadi kesalahan saat memperbarui proyek");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      const { error } = await deleteProject(project.id);

      if (error) {
        toast.error(error);
        return;
      }

      // Clear selected project if it's the one being deleted
      if (selectedProject && selectedProject.id === project.id) {
        setSelectedProject(null);
      }

      toast.success("Proyek berhasil dihapus!");
      router.push("/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Terjadi kesalahan saat menghapus proyek");
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

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Proyek tidak ditemukan
        </h1>
        <Link href="/projects">
          <Button>Kembali ke Projects</Button>
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
            <h1 className="text-2xl font-bold">Edit Proyek</h1>
            <p className="text-gray-600">
              {project.name} - {project.customer_name || ""}
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
                  <AlertDialogTitle>Hapus Proyek</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin menghapus proyek &ldquo;
                    {project.name}&rdquo;? Tindakan ini tidak dapat dibatalkan
                    dan akan menghapus semua data terkait termasuk RAB,
                    transaksi, dan invoice.
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
            <Link href={`/projects/${id}`}>
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
                                  locale: idLocale,
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
                                  locale: idLocale,
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
                      <AlertDialogTitle>Hapus Proyek</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus proyek &ldquo;
                        {project.name}&rdquo;? Tindakan ini tidak dapat
                        dibatalkan dan akan menghapus semua data terkait
                        termasuk RAB, transaksi, dan invoice.
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
      </Form>
    </div>
  );
}
