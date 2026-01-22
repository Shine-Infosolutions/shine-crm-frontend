import React from 'react';
import { motion } from 'framer-motion';

const EmployeeModal = ({ selectedEmployee, setSelectedEmployee }) => {
  if (!selectedEmployee) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedEmployee(null)}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 dark:border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.h3 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Employee Details
          </motion.h3>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedEmployee(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {[
            { label: 'Name', value: selectedEmployee.name },
            { label: 'Email', value: selectedEmployee.email },
            { label: 'Contact', value: selectedEmployee.contact1 },
            { label: 'Employee ID', value: selectedEmployee.employee_id }
          ].map((field, index) => (
            <motion.div 
              key={field.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="group"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{field.label}</p>
              <p className="font-medium text-gray-900 dark:text-white bg-gray-50/50 dark:bg-gray-700/50 rounded-lg px-3 py-2 backdrop-blur-sm">
                {field.value || 'N/A'}
              </p>
            </motion.div>
          ))}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <motion.span 
              whileHover={{ scale: 1.05 }}
              className={`inline-block px-3 py-2 rounded-lg text-xs font-medium backdrop-blur-sm ${
                selectedEmployee.employee_status === 'Active' 
                  ? 'bg-green-100/80 text-green-800 border border-green-200/50' 
                  : 'bg-red-100/80 text-red-800 border border-red-200/50'
              }`}
            >
              {selectedEmployee.employee_status || 'N/A'}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeModal;