import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Project Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kelola proyek, RAB, transaksi, dan invoice dengan mudah dalam satu
            platform terpadu
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">
                Project Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Kelola semua proyek Anda dengan timeline, budget, dan detail
                klien
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600">RAB & Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Buat dan kelola Rencana Anggaran Biaya dengan detail item dan
                sumber pembelian
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">Invoicing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate invoice otomatis dan track pembayaran dengan mudah
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
