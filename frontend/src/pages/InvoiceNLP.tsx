import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Sparkles, Loader2, Save, X, Lightbulb } from 'lucide-react';
import { nlpApi } from '@/lib/nlpApi';
import { invoiceApi, InvoiceInput } from '@/lib/invoiceApi';
import { toast } from 'sonner';

export default function InvoiceNLP() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const examples = [
    'Invoice John for 5 hours at $100/hr',
    'Bill ABC Corp for web design $2500',
    'Invoice Sarah: 3 consulting sessions at $150 each, due in 30 days',
    'Create invoice for TechCo: 10 software licenses at $50 each, 8% tax',
  ];

  // Parse NLP mutation
  const nlpMutation = useMutation({
    mutationFn: nlpApi.parseNaturalLanguage,
    onSuccess: (data) => {
      setParsedData(data.parsedData);
      setIsProcessing(false);
      toast.success('Invoice data parsed successfully!');
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast.error(error.message || 'Failed to parse text');
    },
  });

  // Save invoice mutation
  const saveMutation = useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
      navigate('/invoices');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invoice');
    },
  });

  const handleParse = () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setIsProcessing(true);
    nlpMutation.mutate(inputText);
  };

  const handleSave = () => {
    if (!parsedData) return;

    const invoiceData: InvoiceInput = {
      clientId: parsedData.clientId || null,
      invoiceDate: parsedData.invoiceDate,
      dueDate: parsedData.dueDate,
      currency: parsedData.currency,
      paymentTerms: parsedData.paymentTerms,
      notes: parsedData.notes,
      status: 'draft',
      lineItems: parsedData.lineItems,
    };

    saveMutation.mutate(invoiceData);
  };

  const reset = () => {
    setInputText('');
    setParsedData(null);
  };

  const calculateTotal = () => {
    if (!parsedData?.lineItems) return 0;
    return parsedData.lineItems.reduce((sum: number, item: any) => {
      const lineTotal = item.quantity * item.unitPrice;
      const tax = (lineTotal * item.taxRate) / 100;
      return sum + lineTotal + tax;
    }, 0);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quick Invoice Creator</h1>
          <p className="text-gray-600 mt-1">
            Create invoices by typing in natural language - AI will do the rest
          </p>
        </div>

        {!parsedData ? (
          <>
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Describe Your Invoice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Invoice John Smith for 5 hours of consulting at $100/hour..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px] text-base"
                />
                <div className="flex gap-3">
                  <Button onClick={handleParse} disabled={isProcessing || !inputText.trim()}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Invoice
                      </>
                    )}
                  </Button>
                  {inputText && (
                    <Button variant="outline" onClick={reset}>
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Example Phrases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setInputText(example)}
                    >
                      <p className="text-sm text-gray-700">{example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Natural Language</h3>
                    <p className="text-sm text-gray-600">
                      Type as you would speak
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-1">AI Processing</h3>
                    <p className="text-sm text-gray-600">
                      Intelligent data extraction
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Save className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Quick Save</h3>
                    <p className="text-sm text-gray-600">
                      Review and save instantly
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Parsed Data Review */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parsed Invoice Data</CardTitle>
                    <Badge variant="success" className="mt-2">
                      Ready to Save
                    </Badge>
                  </div>
                  <Button variant="outline" onClick={reset}>
                    <X className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Original Input */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Your Input:</h3>
                  <p className="text-sm italic text-gray-700">&quot;{inputText}&quot;</p>
                </div>

                {/* Client Info */}
                {parsedData.clientName && (
                  <div>
                    <h3 className="font-semibold mb-2">Client:</h3>
                    <p className="text-gray-700">{parsedData.clientName}</p>
                  </div>
                )}

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-medium">{parsedData.invoiceDate}</p>
                  </div>
                  {parsedData.dueDate && (
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{parsedData.dueDate}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Currency</p>
                    <p className="font-medium">{parsedData.currency}</p>
                  </div>
                  {parsedData.paymentTerms && (
                    <div>
                      <p className="text-sm text-gray-600">Payment Terms</p>
                      <p className="font-medium">{parsedData.paymentTerms}</p>
                    </div>
                  )}
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-3">Line Items:</h3>
                  <div className="space-y-2">
                    {parsedData.lineItems?.map((item: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Qty: {item.quantity} × ${item.unitPrice}
                              {item.taxRate > 0 && ` (+${item.taxRate}% tax)`}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ${(item.quantity * item.unitPrice * (1 + item.taxRate / 100)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                {parsedData.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{parsedData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/invoices/new')}>
                Edit in Full Editor
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Invoice'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
