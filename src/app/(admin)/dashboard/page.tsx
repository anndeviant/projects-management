import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, DollarSign, Users, TrendingUp, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Ringkasan aktivitas dan statistik proyek Anda
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Proyek Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FolderOpen className="h-4 w-4 text-emerald-600 mr-2" />
              Total Proyek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-600">+2 dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="h-4 w-4 text-blue-600 mr-2" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 2.4M</div>
            <p className="text-xs text-green-600">+12% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 text-purple-600 mr-2" />
              Proyek Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">sedang berjalan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="h-4 w-4 text-orange-600 mr-2" />
              Invoice Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-gray-500">menunggu pembayaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Proyek Terbaru</TabsTrigger>
          <TabsTrigger value="rab">RAB Terbaru</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Terbaru</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Proyek Terbaru</CardTitle>
              <CardDescription>
                5 proyek yang baru dibuat atau diupdate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          Website E-commerce Project {i}
                        </h4>
                        <p className="text-sm text-gray-500">
                          PT. Digital Solutions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Rp 150.000.000</div>
                      <div className="text-xs text-gray-500">
                        2 hari yang lalu
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rab">
          <Card>
            <CardHeader>
              <CardTitle>RAB Terbaru</CardTitle>
              <CardDescription>Item RAB yang baru ditambahkan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <div>
                      <h4 className="font-medium">
                        Server Hosting Premium {i}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Website E-commerce Project
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Rp 5.000.000</div>
                      <div className="text-xs text-gray-500">
                        1 hari yang lalu
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Terbaru</CardTitle>
              <CardDescription>
                Invoice yang baru dibuat atau diupdate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-2 last:border-b-0"
                  >
                    <div>
                      <h4 className="font-medium">INV-2025-00{i}</h4>
                      <p className="text-sm text-gray-500">
                        Website E-commerce Project
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Rp 25.000.000</div>
                      <div className="text-xs text-green-600">Paid</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
