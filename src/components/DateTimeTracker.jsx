import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DateTimeTracker = ({ 
  label, 
  dates = [], 
  onAddDate, 
  onUpdateLatest, 
  error 
}) => {
  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMinDateTime = () => {
    if (dates.length <= 1) return '';
    const lastDate = dates[dates.length - 2]?.dateTime;
    return lastDate ? new Date(new Date(lastDate).getTime() + 60000).toISOString().slice(0, 16) : '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={onAddDate}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Add More
        </motion.button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {dates.map((entry, index) => {
            const isLatest = index === dates.length - 1;
            const isReadOnly = !isLatest;
            
            return (
              <motion.div
                key={`${index}-${entry.addedAt}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3 rounded-lg border ${
                  isReadOnly 
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="datetime-local"
                      value={entry.dateTime ? new Date(entry.dateTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => isLatest && onUpdateLatest(e.target.value)}
                      min={isLatest ? getMinDateTime() : undefined}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        isReadOnly
                          ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                      }`}
                      required={isLatest}
                    />
                  </div>
                  
                  {isReadOnly && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 min-w-0">
                      <div className="font-medium">Added:</div>
                      <div className="truncate">{formatDateTime(entry.addedAt)}</div>
                    </div>
                  )}
                  
                  {isLatest && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Current
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {dates.length === 0 && (
          <div className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
            <input
              type="datetime-local"
              onChange={(e) => onUpdateLatest(e.target.value)}
              className="w-full px-3 py-2 bg-transparent border-0 focus:outline-none text-gray-900 dark:text-white"
              placeholder={`Select ${label.toLowerCase()}`}
              required
            />
          </div>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default DateTimeTracker;