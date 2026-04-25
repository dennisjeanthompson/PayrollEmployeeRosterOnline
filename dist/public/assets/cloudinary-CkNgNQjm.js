import { dM as Cloudinary, dN as auto, dO as autoGravity } from './vendor-v-EuVKxF.js';

const CLOUDINARY_CLOUD_NAME = "dofcwajrj";
const UPLOAD_PRESETS = {
  EMPLOYEE_PROFILES: "employee_profiles",
  COMPANY_LOGOS: "company_logos",
  DOCUMENTS: "employee_documents"
};
const FOLDERS = {
  EMPLOYEE_PROFILES: "employee-profiles",
  COMPANY_LOGOS: "company-logos",
  ID_DOCUMENTS: "id-documents",
  SUPPORTING_DOCS: "supporting-documents"
};
const cld = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME
  }
});
const getProfilePhoto = (publicId, size = 400) => {
  return cld.image(publicId).format("auto").quality("auto").resize(
    auto().gravity(autoGravity()).width(size).height(size)
  );
};
async function uploadToCloudinary(options) {
  const {
    file,
    folder,
    publicId,
    uploadPreset = UPLOAD_PRESETS.EMPLOYEE_PROFILES,
    signature,
    timestamp,
    apiKey,
    cloudName = CLOUDINARY_CLOUD_NAME
  } = options;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  if (publicId) {
    formData.append("public_id", publicId);
  }
  if (signature && timestamp && apiKey) {
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
  } else {
    formData.append("upload_preset", uploadPreset);
  }
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
  }
  const data = await response.json();
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes
  };
}
function validateImageFile(file, maxSizeMB = 5) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Please select a valid image file (JPEG, PNG, GIF, WebP)" };
  }
  return { valid: true };
}
function validateDocumentFile(file, maxSizeMB = 10) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf"
  ];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: "Please select an image or PDF file" };
  }
  return { valid: true };
}

export { FOLDERS as F, UPLOAD_PRESETS as U, validateImageFile as a, getProfilePhoto as g, uploadToCloudinary as u, validateDocumentFile as v };
