import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ObjectUploaderProps {
  maxFileSize?: number;
  onComplete?: (uploadURL: string) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A simple file upload component that uses native file input and uploads directly to object storage.
 */
export function ObjectUploader({
  maxFileSize = 10485760, // 10MB default
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Get upload URL from server
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      
      // Upload file directly to object storage
      const uploadResponse = await fetch(data.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      toast({
        title: "Upload Successful",
        description: "Your file has been uploaded successfully.",
      });

      onComplete?.(data.uploadURL);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        data-testid="input-file-upload"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        className={buttonClassName}
        disabled={isUploading}
        data-testid="button-upload-trigger"
      >
        {isUploading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
