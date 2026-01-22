import React, { useState } from 'react';

const SocialMediaConfig = ({ 
  platforms = [], 
  deliverables = { posts: 0, reels: 0, stories: 0 },
  onPlatformChange,
  onDeliverableChange 
}) => {
  const availablePlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X'];

  const handlePlatformToggle = (platform, checked) => {
    const updatedPlatforms = checked 
      ? [...platforms, platform]
      : platforms.filter(p => p !== platform);
    onPlatformChange(updatedPlatforms);
  };

  const handleDeliverableChange = (type, value) => {
    const updatedDeliverables = {
      ...deliverables,
      [type]: parseInt(value) || 0
    };
    onDeliverableChange(updatedDeliverables);
  };

  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <h4 className="text-md font-medium mb-3 text-purple-800 dark:text-purple-400">
        Social Media Configuration
      </h4>
      
      {/* Platform Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Platforms *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availablePlatforms.map(platform => (
            <label 
              key={platform} 
              className="flex items-center p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={(e) => handlePlatformToggle(platform, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {platform}
              </span>
            </label>
          ))}
        </div>
        {platforms.length === 0 && (
          <p className="text-red-500 text-xs mt-1">At least one platform is required</p>
        )}
      </div>
      
      {/* Deliverables */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monthly Deliverables *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Posts/month
            </label>
            <input
              type="number"
              value={deliverables.posts}
              onChange={(e) => handleDeliverableChange('posts', e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Reels/month
            </label>
            <input
              type="number"
              value={deliverables.reels}
              onChange={(e) => handleDeliverableChange('reels', e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Stories/month
            </label>
            <input
              type="number"
              value={deliverables.stories}
              onChange={(e) => handleDeliverableChange('stories', e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-white/20 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        {(deliverables.posts + deliverables.reels + deliverables.stories) === 0 && (
          <p className="text-red-500 text-xs mt-1">At least one deliverable must be greater than 0</p>
        )}
      </div>
    </div>
  );
};

export default SocialMediaConfig;