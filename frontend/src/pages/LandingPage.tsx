import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";
import { Bot, ScanLine, Calculator, FileDown, Users, CreditCard, UserPlus, FileText, Send, CheckSquare } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <LandingNav />
      <main className="flex-1">
        <section className="py-20 md:py-32 lg:py-40 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 text-gray-900 dark:text-gray-50">
              Create Smart Invoices in 30 Seconds with AI
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">
              InvoiceMate is an AI-powered invoicing solution designed for freelancers and small businesses. Streamline your billing process and get paid faster.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Tired of Tedious Invoicing?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manual invoicing is time-consuming, prone to errors, and can delay payments. Freelancers and small businesses lose countless hours that could be spent on growing their business. InvoiceMate automates the entire process, so you can focus on what you do best.
                </p>
              </div>
              {/* <div>
                <img src="/placeholder.svg" alt="Invoice illustration" className="w-full h-auto rounded-lg shadow-md" />
              </div> */}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Bot className="w-8 h-8 text-blue-500" />
                  <CardTitle>AI Invoice Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Describe your invoice in plain English, and our AI will create a detailed, professional invoice for you.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <ScanLine className="w-8 h-8 text-blue-500" />
                  <CardTitle>OCR Invoice Upload</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Scan and upload any invoice, and our OCR technology will extract the data and populate it for you.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Calculator className="w-8 h-8 text-blue-500" />
                  <CardTitle>Real-time Calculations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>All totals, taxes, and discounts are calculated automatically and in real-time as you edit.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileDown className="w-8 h-8 text-blue-500" />
                  <CardTitle>PDF Export</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Generate and download professional PDF invoices to send to your clients with a single click.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Users className="w-8 h-8 text-blue-500" />
                  <CardTitle>Client Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Keep track of all your clients, their contact information, and billing history in one place.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                  <CardTitle>Payment Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Mark invoices as paid and keep track of your income and outstanding payments.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-white dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/50 text-blue-500 rounded-full text-2xl font-bold mb-4">
                  <UserPlus className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
                <p>Create your free account in seconds.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/50 text-blue-500 rounded-full text-2xl font-bold mb-4">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create or Upload</h3>
                <p>Use AI to generate an invoice or upload an existing one.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/50 text-blue-500 rounded-full text-2xl font-bold mb-4">
                  <CheckSquare className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Review & Edit</h3>
                <p>Make any necessary adjustments in the invoice editor.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900/50 text-blue-500 rounded-full text-2xl font-bold mb-4">
                  <Send className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Send & Get Paid</h3>
                <p>Export as a PDF and send it to your client.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to simplify your invoicing?</h2>
.
            <p className="text-gray-600 dark:text-gray-400 mb-8">Join InvoiceMate today and take the first step towards smarter, faster invoicing.</p>
            <Button asChild size="lg">
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
