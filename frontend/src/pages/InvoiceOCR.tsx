import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  Save,
  X,
} from 'lucide-react';
import { ocrApi } from '@/lib/ocrApi';
import { invoiceApi, LineItem, InvoiceInput } from '@/lib/invoiceApi';
import { clientApi, Client } from '@/lib/clientApi';
import { toast } from 'sonner';

export default function InvoiceOCR() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<InvoiceInput>({
    clientId: null,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: null,
    currency: 'USD',
    paymentTerms: '',
    notes: '',
    status: 'draft',
    lineItems: [],
  });

  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientApi.getClients({ limit: 1000 }),
  });

  // Process OCR mutation
  const ocrMutation = useMutation({
    mutationFn: ocrApi.processInvoiceImage,
    onSuccess: (data) => {
      setExtractedData(data.extractedData);
      const clients = clientsData?.clients || [];
      const matchedClient = clients.find(
        (client: Client) =>
          client.clientName.toLowerCase() === data.extractedData.clientName?.toLowerCase()
      );

      setFormData({
        clientId: matchedClient?.id || null,
        invoiceDate: data.extractedData.invoiceDate ? new Date(data.extractedData.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: data.extractedData.invoiceDate ? new Date(data.extractedData.invoiceDate).toISOString().split('T')[0] : null,
        currency: data.extractedData.currency || 'USD',
        paymentTerms: data.extractedData.paymentTerms || '',
        notes: `Invoice Number: ${data.extractedData.invoiceNumber}\nAccount Number: ${data.extractedData.accountNumber}\nSender: ${data.extractedData.sender}`,
        status: 'sent',
        lineItems: data.extractedData.lineItems || [],
      });
      setIsProcessing(false);
      toast.success('Invoice data extracted successfully!');
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast.error(error.message || 'Failed to process image');
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please select an image or PDF file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null); // No preview for PDF
    }
  };

  const processImage = () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    ocrMutation.mutate(selectedFile);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setFormData({
      clientId: null,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: null,
      currency: 'USD',
      paymentTerms: '',
      notes: '',
      status: 'draft',
      lineItems: [],
    });
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...formData.lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, lineItems: updatedItems });
  };

  const handleSave = () => {
    if (formData.lineItems.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    saveMutation.mutate(formData);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Scanner</h1>
          <p className="text-gray-600 mt-1">
            Upload an invoice image
          </p>
        </div>

        {!extractedData ? (
          <>
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Invoice Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Invoice preview"
                        className="max-h-96 mx-auto rounded-lg shadow-md"
                      />
                      <div className="flex gap-3 justify-center">
                        <Button onClick={processImage} disabled={isProcessing}>
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Extract Data
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={resetUpload} disabled={isProcessing}>
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        File: {selectedFile?.name} ({(selectedFile!.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  ) : (
                    <>
                      <FileImage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Drop your invoice image here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        or click to browse (PNG, JPG - Max 10MB)
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileInput}
                      />
                      <label htmlFor="file-upload">
                        <Button asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Select Image
                          </span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Upload Image</h3>
                    <p className="text-sm text-gray-600">
                      Drag & drop or click to select
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Loader2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-1">AI Processing</h3>
                      <p className="text-sm text-gray-500">
                        Tesseract OCR extracts invoice data
                      </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-1">Review & Save</h3>
                    <p className="text-sm text-gray-600">
                      Verify and create invoice
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Extracted Data Review */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Extracted Invoice Data</CardTitle>
                    {extractedData.confidenceScore && (
                      <Badge
                        variant={
                          extractedData.confidenceScore >= 80
                            ? 'success'
                            : extractedData.confidenceScore >= 60
                            ? 'warning'
                            : 'destructive'
                        }
                        className="mt-2"
                      >
                        Confidence: {extractedData.confidenceScore}%
                      </Badge>
                    )}
                  </div>
                  <Button variant="outline" onClick={resetUpload}>
                    <X className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Info */}
                {extractedData.clientName && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-sm mb-2">Detected Client:</h3>
                    <p className="font-medium">{extractedData.clientName}</p>
                    {extractedData.clientEmail && <p className="text-sm">{extractedData.clientEmail}</p>}
                    {extractedData.clientAddress && <p className="text-sm">{extractedData.clientAddress}</p>}
                    {extractedData.clientPhone && <p className="text-sm">{extractedData.clientPhone}</p>}
                  </div>
                )}

                {/* Invoice Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Invoice Date</Label>
                    <Input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Input
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      placeholder="e.g., Net 30"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-3">Line Items</h3>
                  <div className="space-y-3">
                    {formData.lineItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 p-3 border rounded-lg">
                        <div className="col-span-6">
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            placeholder="Description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                            placeholder="Qty"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                            placeholder="Price"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value))}
                            placeholder="Tax %"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {formData.notes && (
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <textarea
                      className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/invoices/new/manual')}> 
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
