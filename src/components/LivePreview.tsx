'use client';

import { useState, useEffect } from 'react';

interface LivePreviewProps {
  url: string | null;
  projectName: string;
}

export default function LivePreview({ url, projectName }: LivePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [url, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        <div className="text-center">
          <p className="text-lg">No preview available</p>
          <p className="text-sm mt-2">Sandbox is still initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-gray-200 font-semibold">Live Preview</span>
          <span className="text-gray-400 text-sm">- {projectName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Open in new tab ↗
          </a>
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1 rounded hover:bg-gray-700"
            title="Refresh preview"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
            <div className="text-white">Loading preview...</div>
          </div>
        )}
        <iframe
          key={refreshKey}
          src={url}
          className="w-full h-full border-0"
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
