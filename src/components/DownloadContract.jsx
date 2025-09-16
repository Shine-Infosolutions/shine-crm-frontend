import React from 'react';

const DownloadContract = ({ contractUrl, fileName = 'Contract_Agreement.pdf' }) => {
  const handleDownload = () => {
    // Create a hidden link and trigger download
    const link = document.createElement('a');
    link.href = contractUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload}>
      Download Contract Agreement
    </button>
  );
};

export default DownloadContract;