import { useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function UploadZone() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    setUploadResult(null);
    const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/x-msvideo'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only JPEG, PNG, MP4, and AVI are allowed.');
      return;
    }
    
    // 250MB limit (250 * 1024 * 1024 bytes)
    if (selectedFile.size > 262144000) {
      setError('File is too large. Maximum size is 250MB.');
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/pipeline/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      setUploadResult(res.data);
      setTimeout(() => {
        navigate(`/analysis/${res.data.file_id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
          dragActive ? 'border-cyber-neonBlue bg-cyber-neonBlue/5' : 'border-cyber-border bg-cyber-panel/50 hover:border-cyber-neonBlue/50 hover:bg-cyber-accent'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleChange}
          accept="image/jpeg, image/png, video/mp4, video/x-msvideo"
        />
        
        {!file ? (
          <>
            <UploadCloud className={`w-20 h-20 mb-4 transition-colors ${dragActive ? 'text-cyber-neonBlue' : 'text-gray-500'}`} />
            <h3 className="text-xl font-bold text-white mb-2">DRAG & DROP EVIDENCE</h3>
            <p className="text-sm text-gray-400 text-center">
              Supported formats: JPEG, PNG, MP4, AVI<br/>
              Max size: 250MB
            </p>
          </>
        ) : (
          <div className="w-full z-10 relative bg-cyber-dark p-6 rounded-lg border border-cyber-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <File className="w-10 h-10 text-cyber-neonBlue" />
              <div>
                <p className="text-white font-semibold truncate max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            {!uploadResult && !uploading && (
              <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-red-500 hover:text-red-400 p-2">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {file && !uploadResult && (
        <div className="mt-6">
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full btn-cyber font-bold tracking-widest py-3 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? `UPLOADING... ${uploadProgress}%` : 'INITIALIZE PIPELINE'}
          </button>
          
          {uploading && (
            <div className="w-full h-2 bg-cyber-dark mt-4 rounded overflow-hidden border border-cyber-border">
              <div 
                className="h-full bg-cyber-neonBlue transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {uploadResult && (
        <div className="mt-6 p-4 border border-cyber-neonGreen bg-cyber-neonGreen/10 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-cyber-neonGreen" />
          <div>
            <p className="text-cyber-neonGreen font-bold tracking-wide">EVIDENCE SECURED</p>
            <p className="text-xs text-gray-400">ID: {uploadResult.file_id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
