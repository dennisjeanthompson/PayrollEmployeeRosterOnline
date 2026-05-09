/**
 * Document Upload Component
 * 
 * Allows uploading of employee documents:
 * - ID documents (SSS, PhilHealth, Pag-IBIG, TIN)
 * - Supporting documents (birth certificate, proof of address)
 */

import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  FileText, 
  Image, 
  X, 
  Loader2, 
  Eye,
  Download,
  Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { 
  FOLDERS, 
  UPLOAD_PRESETS,
  CLOUDINARY_CLOUD_NAME,
  uploadToCloudinary, 
  validateDocumentFile,
} from '@/lib/cloudinary';
import { apiRequest } from '@/lib/queryClient';

export type DocumentType = 
  | 'sss_id'
  | 'philhealth_id'
  | 'pagibig_id'
  | 'tin_id'
  | 'birth_certificate'
  | 'proof_of_address'
  | 'nbi_clearance'
  | 'resume'
  | 'diploma'
  | 'other';

interface Document {
  id: string;
  type: DocumentType;
  name: string;
  publicId: string;
  url: string;
  uploadedAt: string;
}

interface DocumentUploadProps {
  employeeId: string | number;
  documents?: Document[];
  onUploadComplete?: (doc: Document) => void;
  onDocumentRemove?: (docId: string) => void;
  allowedTypes?: DocumentType[];
  maxFiles?: number;
  disabled?: boolean;
}

const documentTypeLabels: Record<DocumentType, string> = {
  sss_id: 'SSS ID',
  philhealth_id: 'PhilHealth ID',
  pagibig_id: 'Pag-IBIG ID',
  tin_id: 'TIN ID',
  birth_certificate: 'Birth Certificate',
  proof_of_address: 'Proof of Address',
  nbi_clearance: 'NBI Clearance',
  resume: 'Resume/CV',
  diploma: 'Diploma/Certificate',
  other: 'Other Document',
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  employeeId,
  documents = [],
  onUploadComplete,
  onDocumentRemove,
  allowedTypes,
  maxFiles = 10,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('other');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTypes = allowedTypes || Object.keys(documentTypeLabels) as DocumentType[];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateDocumentFile(file, 10);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    // Check max files
    if (documents.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} documents allowed`);
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary({
        file,
        folder: `${FOLDERS.ID_DOCUMENTS}/${employeeId}`,
        publicId: `${selectedType}_${Date.now()}`,
        uploadPreset: UPLOAD_PRESETS.DOCUMENTS,
      });

      // Save to database
      const response = await apiRequest('POST', `/api/employees/${employeeId}/documents`, {
        type: selectedType,
        name: file.name,
        publicId: result.publicId,
        url: result.secureUrl,
      });

      const savedDoc = await response.json();

      onUploadComplete?.({
        id: savedDoc.id,
        type: selectedType,
        name: file.name,
        publicId: result.publicId,
        url: result.secureUrl,
        uploadedAt: new Date().toISOString(),
      });

      toast.success(`✅ ${documentTypeLabels[selectedType]} uploaded!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (doc: Document) => {
    if (!confirm(`Remove ${doc.name}?`)) return;

    try {
      await apiRequest('DELETE', `/api/employees/${employeeId}/documents/${doc.id}`);
      onDocumentRemove?.(doc.id);
      toast.success('Document removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove document');
    }
  };

  const getFileIcon = (url: string) => {
    if (url.includes('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {!disabled && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Document Type Selector */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="px-3 py-2 border rounded-md text-sm"
                disabled={uploading}
              >
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {documentTypeLabels[type]}
                  </option>
                ))}
              </select>

              {/* Upload Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || documents.length >= maxFiles}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    Upload Document
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleUpload}
                className="hidden"
                disabled={disabled || uploading}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              PDF, JPG, PNG. Max 10MB per file. {documents.length}/{maxFiles} documents.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Thumbnail/Icon */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    {doc.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      getFileIcon(doc.url)
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {documentTypeLabels[doc.type]}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setPreviewDoc(doc)}
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => window.open(doc.url, '_blank')}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {!disabled && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleRemove(doc)}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No documents uploaded yet</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            {previewDoc?.url.includes('.pdf') ? (
              <iframe
                src={previewDoc.url}
                className="w-full h-[600px]"
                title={previewDoc.name}
              />
            ) : (
              <img
                src={previewDoc?.url}
                alt={previewDoc?.name}
                className="w-full h-auto"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUpload;
