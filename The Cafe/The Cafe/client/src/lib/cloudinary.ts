/**
 * Cloudinary Configuration
 * 
 * Cloud-based image and file upload service for:
 * - Employee profile photos
 * - Company logos
 * - ID documents (SSS, PhilHealth, Pag-IBIG, TIN)
 * - Supporting documents
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity, face } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { focusOn } from '@cloudinary/url-gen/qualifiers/gravity';

// Cloudinary Cloud Name
export const CLOUDINARY_CLOUD_NAME = 'dofcwajrj';

// Upload presets (create these in Cloudinary Dashboard)
export const UPLOAD_PRESETS = {
  EMPLOYEE_PROFILES: 'employee_profiles',
  COMPANY_LOGOS: 'company_logos',
  DOCUMENTS: 'employee_documents',
} as const;

// Folder structure in Cloudinary
export const FOLDERS = {
  EMPLOYEE_PROFILES: 'employee-profiles',
  COMPANY_LOGOS: 'company-logos',
  ID_DOCUMENTS: 'id-documents',
  SUPPORTING_DOCS: 'supporting-documents',
} as const;

// Initialize Cloudinary SDK
export const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
});

/**
 * Get optimized profile photo with face detection
 */
export const getProfilePhoto = (publicId: string, size = 400) => {
  return cld
    .image(publicId)
    .format('auto')
    .quality('auto')
    .resize(
      auto()
        .gravity(autoGravity())
        .width(size)
        .height(size)
    );
};

/**
 * Get optimized company logo
 */
export const getCompanyLogo = (publicId: string, width = 200, height = 200) => {
  return cld
    .image(publicId)
    .format('auto')
    .quality('auto')
    .resize(auto().width(width).height(height));
};

/**
 * Get document thumbnail
 */
export const getDocumentThumbnail = (publicId: string, width = 300) => {
  return cld
    .image(publicId)
    .format('auto')
    .quality('auto:low')
    .resize(auto().width(width));
};

/**
 * Get full-size document for viewing
 */
export const getDocumentFull = (publicId: string) => {
  return cld
    .image(publicId)
    .format('auto')
    .quality('auto:best');
};

/**
 * Upload file to Cloudinary
 */
export interface UploadOptions {
  file: File;
  folder: string;
  publicId?: string;
  uploadPreset?: string;
}

export interface UploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export async function uploadToCloudinary(options: UploadOptions): Promise<UploadResult> {
  const { file, folder, publicId, uploadPreset = UPLOAD_PRESETS.EMPLOYEE_PROFILES } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  
  if (publicId) {
    formData.append('public_id', publicId);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Upload failed');
  }

  const data = await response.json();

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}

/**
 * Upload document (PDF, images)
 */
export async function uploadDocument(
  file: File,
  employeeId: string,
  documentType: 'sss' | 'philhealth' | 'pagibig' | 'tin' | 'birth_cert' | 'proof_address' | 'other'
): Promise<UploadResult> {
  const folder = `${FOLDERS.ID_DOCUMENTS}/${employeeId}`;
  const publicId = `${documentType}_${Date.now()}`;

  return uploadToCloudinary({
    file,
    folder,
    publicId,
    uploadPreset: UPLOAD_PRESETS.DOCUMENTS,
  });
}

/**
 * Get Cloudinary URL for a public ID
 */
export function getCloudinaryUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
}

/**
 * Validate file before upload
 */
export function validateImageFile(file: File, maxSizeMB = 5): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' };
  }

  return { valid: true };
}

/**
 * Validate document file
 */
export function validateDocumentFile(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }

  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select an image or PDF file' };
  }

  return { valid: true };
}
