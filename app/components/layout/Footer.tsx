import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="flex justify-center gap-6 text-sm">
      <span className="text-gray-600 dark:text-gray-400">Jonathan Segal</span>
      <span className="text-gray-400 dark:text-gray-600">•</span>
      <span className="text-gray-600 dark:text-gray-400">AIRLab Cornell Tech</span>
    </footer>
  );
};