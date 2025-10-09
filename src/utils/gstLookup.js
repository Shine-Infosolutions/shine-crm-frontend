// src/utils/gstLookup.js
export const fetchGSTDetails = async (gstNumber) => {
  if (!gstNumber || gstNumber.length !== 15) {
    throw new Error('Invalid GST number');
  }

  // Mock data for demonstration - replace with actual API when available
  const mockData = {
    '09AAECS9247G1ZZ': {
      name: 'ABC PRIVATE LIMITED',
      address: '123 Business Park, Sector 18, Noida, UP, 201301',
      state: 'Uttar Pradesh',
      pincode: '201301'
    },
    '27AABCU9603R1ZX': {
      name: 'XYZ ENTERPRISES',
      address: '456 Industrial Area, Mumbai, MH, 400001',
      state: 'Maharashtra', 
      pincode: '400001'
    }
  };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = mockData[gstNumber];
      if (data) {
        resolve(data);
      } else {
        reject(new Error('GST number not found. Using mock data for demo.'));
      }
    }, 1000);
  });
};