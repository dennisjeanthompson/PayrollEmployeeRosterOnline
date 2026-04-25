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
      // 1. Get Secure Signature from Backend
      const publicId = `emp-${employeeId}`;
      const folder = FOLDERS.EMPLOYEE_PROFILES;
      
      const sigResponse = await apiRequest(
        'GET', 
        `/api/employees/upload-signature?public_id=${publicId}&folder=${folder}`
      );
      
      const { signature, timestamp, apiKey, cloudName } = await sigResponse.json();

      // 2. Upload to Cloudinary with Signature
      const result = await uploadToCloudinary({
        file,
        folder,
        publicId,
        // Pass signed params to bypass unsigned preset requirement
        signature,
        timestamp,
        apiKey,
        cloudName,
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
      toast.error('Failed to remove photo');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Avatar with Photo */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur-sm"></div>
        <Avatar className={`${sizeClasses[size]} relative border-4 border-white shadow-xl`}>
          {photoId ? (
            <AdvancedImage
              cldImg={getProfilePhoto(photoId, size === 'lg' ? 400 : size === 'md' ? 200 : 100)}
              className="w-full h-full object-cover"
            />
          ) : photoUrl ? (
            <AvatarImage src={photoUrl} alt={employeeName} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 text-xl font-bold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Camera overlay button */}
        {!disabled && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-white text-slate-700 rounded-full p-2.5 shadow-lg shadow-black/10 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200 border border-slate-100 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            disabled={uploading}
            title="Change photo"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Remove button */}
        {(photoId || photoUrl) && !disabled && (
          <button
            onClick={handleRemovePhoto}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 scale-90"
            title="Remove photo"
          >
            <X className="w-3 h-3" />
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
        <div className="flex flex-col items-center gap-2">
            <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="gap-2 rounded-full px-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition-all shadow-sm"
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
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                JPG, PNG, GIF • Max 5MB
            </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
