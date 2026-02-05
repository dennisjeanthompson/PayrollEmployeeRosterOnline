/**
 * Profile Photo Upload Component
 * 
 * Allows employees to upload and manage their profile photos
 * using Cloudinary for image hosting and optimization.
 */

import React, { useState, useRef } from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'react-toastify';
import { 
  cld, 
  FOLDERS, 
  UPLOAD_PRESETS, 
  uploadToCloudinary, 
  validateImageFile,
  getProfilePhoto 
} from '@/lib/cloudinary';
import { apiRequest } from '@/lib/queryClient';

interface ProfilePhotoUploadProps {
  currentPhotoId?: string;
  currentPhotoUrl?: string;
  employeeId: string | number;
  employeeName: string;
  onUploadComplete?: (publicId: string, url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoId,
  currentPhotoUrl,
  employeeId,
  employeeName,
  onUploadComplete,
  size = 'lg',
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [photoId, setPhotoId] = useState(currentPhotoId);
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = employeeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary({
        file,
        folder: FOLDERS.EMPLOYEE_PROFILES,
        publicId: `emp-${employeeId}`,
        uploadPreset: UPLOAD_PRESETS.EMPLOYEE_PROFILES,
      });

      // Update local state
      setPhotoId(result.publicId);
      setPhotoUrl(result.secureUrl);

      // Save to database
      await apiRequest('PATCH', `/api/employees/${employeeId}/photo`, {
        photoUrl: result.secureUrl,
        photoPublicId: result.publicId,
      });

      onUploadComplete?.(result.publicId, result.secureUrl);
      toast.success('✅ Profile photo updated!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoId && !photoUrl) return;

    try {
      await apiRequest('DELETE', `/api/employees/${employeeId}/photo`);
      setPhotoId(undefined);
      setPhotoUrl(undefined);
      onUploadComplete?.('', '');
      toast.success('Profile photo removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove photo');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar with Photo */}
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg`}>
          {photoId ? (
            <AdvancedImage
              cldImg={getProfilePhoto(photoId, size === 'lg' ? 400 : size === 'md' ? 200 : 100)}
              className="w-full h-full object-cover"
            />
          ) : photoUrl ? (
            <AvatarImage src={photoUrl} alt={employeeName} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Camera overlay button */}
        {!disabled && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors border border-gray-200 opacity-0 group-hover:opacity-100"
            disabled={uploading}
            title="Change photo"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-gray-700" />
            )}
          </button>
        )}

        {/* Remove button */}
        {(photoId || photoUrl) && !disabled && (
          <button
            onClick={handleRemovePhoto}
            className="absolute top-0 right-0 bg-red-500 rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove photo"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleUpload}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Upload button */}
      {!disabled && (
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {photoId || photoUrl ? 'Change Photo' : 'Upload Photo'}
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        JPG, PNG, GIF or WebP. Max 5MB.
      </p>
    </div>
  );
};

export default ProfilePhotoUpload;
