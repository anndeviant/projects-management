"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  X,
  Calculator,
  Receipt,
  FileText,
  LogOut,
} from "lucide-react";
import { useProjectContext } from "@/contexts/project-context";
import { useProjects } from "@/hooks/use-projects";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const staticNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderOpen,
    children: [
      {
        name: "All Projects",
        href: "/projects",
        icon: FolderOpen,
      },
      {
        name: "New Project",
        href: "/projects/new",
        icon: Plus,
      },
    ],
  },
];

const projectSpecificNavigation = [
  {
    name: "RAB Management",
    href: "#",
    icon: Calculator,
    children: [
      {
        name: "All RAB",
        href: "/projects/[id]/rab",
        icon: Calculator,
      },
      {
        name: "New RAB",
        href: "/projects/[id]/rab/new",
        icon: Plus,
      },
    ],
  },
  {
    name: "Transactions",
    href: "#",
    icon: Receipt,
    children: [
      {
        name: "All Transactions",
        href: "/projects/[id]/transactions",
        icon: Receipt,
      },
      {
        name: "New Transaction",
        href: "/projects/[id]/transactions/new",
        icon: Plus,
      },
    ],
  },
  {
    name: "Invoices",
    href: "#",
    icon: FileText,
    children: [
      {
        name: "All Invoices",
        href: "/projects/[id]/invoices",
        icon: FileText,
      },
      {
        name: "New Invoice",
        href: "/projects/[id]/invoices/new",
        icon: Plus,
      },
    ],
  },
];

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Projects"]);
  const { selectedProject } = useProjectContext();
  const { projects } = useProjects();
  const { signOut } = useAuth();

  // Auto-select project if we're on a project-specific route
  useEffect(() => {
    const pathParts = pathname.split("/");
    if (pathParts[1] === "projects" && pathParts[2] && pathParts[2] !== "new") {
      const projectId = pathParts[2];
      const project = projects.find((p) => p.id === projectId);
      if (project && selectedProject?.id !== projectId) {
        // Note: We would need to call setSelectedProject here, but that might cause issues
        // This should be handled by the parent component or page
      }
    }
  }, [pathname, projects, selectedProject]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const getNavigationWithProjectId = () => {
    if (!selectedProject) return [];

    return projectSpecificNavigation.map((item) => ({
      ...item,
      href: item.href.replace("[id]", selectedProject.id),
      children: item.children?.map((child) => ({
        ...child,
        href: child.href.replace("[id]", selectedProject.id),
      })),
    }));
  };

  return (
    <>
      {/* Mobile overlay - hanya muncul di mobile ketika sidebar terbuka */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto shadow-lg lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Projects
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Static Navigation */}
            {staticNavigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left font-medium",
                        expandedItems.includes(item.name)
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                      onClick={() => toggleExpanded(item.name)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>

                    {expandedItems.includes(item.name) && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-sm",
                                pathname === child.href
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              )}
                            >
                              <child.icon className="mr-3 h-4 w-4" />
                              {child.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  </Link>
                )}
              </div>
            ))}

            {/* Project-specific navigation separator and content */}
            {selectedProject && (
              <>
                <div className="border-t border-gray-200 my-4"></div>
                <Link href={`/projects/${selectedProject.id}`}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start p-7 mb-2 bg-gray-100/70 hover:bg-gray-100 border border-gray-200/50 rounded-md",
                      pathname.startsWith(`/projects/${selectedProject.id}`)
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "text-gray-700 hover:text-gray-900"
                    )}
                  >
                    <FolderOpen className="mr-3 h-4 w-4 flex-shrink-0 mt-1" />
                    <div className="flex flex-col items-start w-full">
                      <p className="text-xs font-semibold text-black uppercase tracking-wider">
                        Current Project
                      </p>
                      <p className="text-sm font-medium truncate mt-1 w-full text-left">
                        {selectedProject.name}
                      </p>
                    </div>
                  </Button>
                </Link>

                {getNavigationWithProjectId().map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <div>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-left font-medium",
                            expandedItems.includes(item.name)
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          )}
                          onClick={() => toggleExpanded(item.name)}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Button>

                        {expandedItems.includes(item.name) && (
                          <div className="ml-8 mt-2 space-y-1">
                            {item.children.map((child) => (
                              <Link key={child.href} href={child.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start text-sm",
                                    pathname === child.href
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                  )}
                                >
                                  <child.icon className="mr-3 h-4 w-4" />
                                  {child.name}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            pathname === item.href
                              ? "bg-emerald-100 text-emerald-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          )}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin keluar?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Ya, Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
}
