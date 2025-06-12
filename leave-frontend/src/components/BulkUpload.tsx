import React, { useState } from 'react';
import api from '../api/axios';

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage('');
      setWarnings([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select an Excel file to upload.');
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setMessage('');
      setWarnings([]);
      setIsError(false);

      const res = await api.post('/api/employees/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.warnings && res.data.warnings.length > 0) {
        setWarnings(res.data.warnings);
        setMessage(`Upload completed with ${res.data.warnings.length} warnings.`);
        setIsError(true); // treated as warning display
      } else {
        setMessage(res.data.message);
        setIsError(false);
      }

      setFile(null);
    } catch (err: any) {
      setMessage(`Upload failed: ${err.response?.data?.message || 'Server error'}`);
      setIsError(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-xl shadow-md w-full max-w-xl mx-auto mt-10 bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📤 Bulk Upload Employees</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleChange}
        className="mb-3 block w-full text-sm text-gray-700"
      />

      {file && (
        <div className="mb-3 text-sm text-gray-600">
          Selected file: <strong>{file.name}</strong>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className={`w-full py-2 rounded text-white font-semibold transition ${
          uploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload Excel File'}
      </button>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm font-medium ${
            isError
              ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
              : 'bg-green-100 text-green-800 border border-green-300'
          }`}
        >
          {message}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-md max-h-60 overflow-y-auto text-sm text-yellow-800">
          <strong>⚠️ Warnings:</strong>
          <ul className="mt-2 list-disc list-inside">
            {warnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
