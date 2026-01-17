import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const DownloadContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAppContext();

  useEffect(() => {
    if (id && API_URL) {
      handleDownload();
    }
  }, [id, API_URL]);

  const handleDownload = async () => {
    try {
      const downloadUrl = `${API_URL}/api/employees/${id}/contract/download`;
      
      // Create a hidden link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Contract_Agreement_${id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Navigate back to contracts page after download
      setTimeout(() => {
        navigate('/contracts');
      }, 1000);
    } catch (error) {
      alert('Failed to download contract. Please try again.');
      navigate('/contracts');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Preparing your contract download...</p>
      </div>
    </div>
  );
};

export default DownloadContract;
