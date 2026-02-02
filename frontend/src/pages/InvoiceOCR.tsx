import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';

export default function InvoiceOCR() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTextDialogOpe, setIsTextDialogOpen] = useState(false);

  // Process OCR mutation
  const ocrMutation = useMutation({
    mutationFn: ocrApi.processInvoiceImage,
    onSuccess: (data) => {
      setRecognizedText(data.recognizedText);
      setIsProcessing(false);
      setIsTextDialogOpen(true);
      toast.success('Text recognized successfully!');
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast.error(error.message || 'Failed to process image');
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
    setRecognizedText(null);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Invoice Scanner</h1>
          <p className="text-gray-600 mt-1">
            Upload an invoice image and let AI extract the data
          </p>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Invoice Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
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
                    or click to browse (PNG, JPG, PDF - Max 10MB)
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

        {/* Text Dialog */}
        <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Recognized Text</DialogTitle>
              <DialogDescription>
                Copy the text below and paste it into the manual invoice form.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <textarea
                className="w-full h-64 p-2 border rounded-md"
                value={recognizedText || ''}
                readOnly
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setIsTextDialogOpen(false)}>Close</Button>
              <Button onClick={() => navigate('/invoices/new/manual')}>Go to Manual Form</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
