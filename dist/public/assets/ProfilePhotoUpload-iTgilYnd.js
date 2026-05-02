import { r as reactExports, Q as jsxRuntimeExports, dB as Root, dC as Image, dD as Fallback, dE as AdvancedImage, bK as LoaderCircle, dF as Camera, dG as X, dH as Upload, bQ as y } from './vendor-5dgU3tca.js';
import { B as Button } from './button-BjtCgUzM.js';
import { d as cn, c as apiRequest } from './main-2BvCZ7pP.js';
import { g as getProfilePhoto, a as validateImageFile, F as FOLDERS, u as uploadToCloudinary } from './cloudinary-BR56uk38.js';

const Avatar = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = Root.displayName;
const AvatarImage = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = Image.displayName;
const AvatarFallback = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = Fallback.displayName;

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32"
};
const ProfilePhotoUpload = ({
  currentPhotoId,
  currentPhotoUrl,
  employeeId,
  employeeName,
  onUploadComplete,
  size = "lg",
  disabled = false
}) => {
  const [uploading, setUploading] = reactExports.useState(false);
  const [photoId, setPhotoId] = reactExports.useState(currentPhotoId);
  const [photoUrl, setPhotoUrl] = reactExports.useState(currentPhotoUrl);
  const fileInputRef = reactExports.useRef(null);
  const initials = employeeName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      y.error(validation.error);
      return;
    }
    setUploading(true);
    try {
      const publicId = `emp-${employeeId}`;
      const folder = FOLDERS.EMPLOYEE_PROFILES;
      const sigResponse = await apiRequest(
        "GET",
        `/api/employees/upload-signature?public_id=${publicId}&folder=${folder}`
      );
      const { signature, timestamp, apiKey, cloudName } = await sigResponse.json();
      const result = await uploadToCloudinary({
        file,
        folder,
        publicId,
        // Pass signed params to bypass unsigned preset requirement
        signature,
        timestamp,
        apiKey,
        cloudName
      });
      setPhotoId(result.publicId);
      setPhotoUrl(result.secureUrl);
      await apiRequest("PATCH", `/api/employees/${employeeId}/photo`, {
        photoUrl: result.secureUrl,
        photoPublicId: result.publicId
      });
      onUploadComplete?.(result.publicId, result.secureUrl);
      y.success("✅ Profile photo updated!");
    } catch (error) {
      y.error("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleRemovePhoto = async () => {
    if (!photoId && !photoUrl) return;
    try {
      await apiRequest("DELETE", `/api/employees/${employeeId}/photo`);
      setPhotoId(void 0);
      setPhotoUrl(void 0);
      onUploadComplete?.("", "");
      y.success("Profile photo removed");
    } catch (error) {
      y.error("Failed to remove photo");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: `${sizeClasses[size]} relative border-4 border-white shadow-xl`, children: photoId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        AdvancedImage,
        {
          cldImg: getProfilePhoto(photoId, size === "lg" ? 400 : size === "md" ? 200 : 100),
          className: "w-full h-full object-cover"
        }
      ) : photoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: photoUrl, alt: employeeName }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 text-xl font-bold", children: initials }) }),
      !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => fileInputRef.current?.click(),
          className: "absolute bottom-1 right-1 bg-white text-slate-700 rounded-full p-2.5 shadow-lg shadow-black/10 hover:bg-slate-50 hover:text-blue-600 transition-all duration-200 border border-slate-100 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0",
          disabled: uploading,
          title: "Change photo",
          children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4" })
        }
      ),
      (photoId || photoUrl) && !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleRemovePhoto,
          className: "absolute top-0 right-0 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 transform -translate-y-2 group-hover:translate-y-0 scale-90",
          title: "Remove photo",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileInputRef,
        type: "file",
        accept: "image/jpeg,image/png,image/gif,image/webp",
        onChange: handleUpload,
        className: "hidden",
        disabled: disabled || uploading
      }
    ),
    !disabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => fileInputRef.current?.click(),
          disabled: uploading,
          variant: "outline",
          className: "gap-2 rounded-full px-6 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-medium transition-all shadow-sm",
          children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
            "Uploading..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
            photoId || photoUrl ? "Change Photo" : "Upload Photo"
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase tracking-wider text-slate-400 font-medium", children: "JPG, PNG, GIF • Max 5MB" })
    ] })
  ] });
};

export { ProfilePhotoUpload as P };
