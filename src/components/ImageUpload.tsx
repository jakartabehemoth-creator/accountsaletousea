import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string, fileName: string) => void;
  onCancel: () => void;
}

export const ImageUpload = ({ onImageSelect, onCancel }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Check file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Please select a JPEG or PNG image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSendImage = () => {
    if (preview && fileName) {
      onImageSelect(preview, fileName);
      setPreview(null);
      setFileName('');
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setFileName('');
    onCancel();
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Upload Payment Proof</h3>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!preview ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-400 bg-blue-400/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <p className="text-white mb-2">Drop your payment screenshot here</p>
                <p className="text-gray-400 text-sm mb-4">
                  Support JPEG, JPG, PNG files up to 5MB
                </p>
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Payment proof preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPreview(null);
                  setFileName('');
                }}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div>
              <p className="text-white text-sm font-medium">{fileName}</p>
              <p className="text-gray-400 text-xs">Ready to send</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSendImage}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Send Image
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="border-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};