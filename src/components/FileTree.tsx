'use client';

import { useState } from 'react';
import { FileTreeNode } from '@/types';

interface FileTreeProps {
  files: FileTreeNode[];
  onFileSelect: (path: string) => void;
  selectedPath: string | null;
}

export default function FileTree({
  files,
  onFileSelect,
  selectedPath,
}: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(
    new Set(['my-app', 'my-app/src', 'my-app/src/app'])
  );

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderNode = (node: FileTreeNode, level: number = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    const isSelected = selectedPath === node.path;

    if (node.type === 'directory') {
      return (
        <div key={node.path}>
          <div
            onClick={() => toggleDirectory(node.path)}
            className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-700 ${
              isSelected ? 'bg-gray-700' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            <span className="mr-2 text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </span>
            <span className="text-yellow-400 mr-2">📁</span>
            <span className="text-gray-200">{node.name}</span>
          </div>
          {isExpanded &&
            node.children &&
            node.children.map((child) => renderNode(child, level + 1))}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        onClick={() => onFileSelect(node.path)}
        className={`flex items-center px-2 py-1 cursor-pointer hover:bg-gray-700 ${
          isSelected ? 'bg-blue-600' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 24}px` }}
      >
        <span className="mr-2">{getFileIcon(node.name)}</span>
        <span className="text-gray-200 text-sm">{node.name}</span>
      </div>
    );
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      ts: '📘',
      tsx: '⚛️',
      js: '📜',
      jsx: '⚛️',
      json: '📋',
      css: '🎨',
      md: '📝',
      html: '🌐',
    };
    return iconMap[ext || ''] || '📄';
  };

  return (
    <div className="h-full bg-gray-800 overflow-y-auto">
      <div className="bg-gray-900 px-4 py-2 text-gray-200 font-semibold border-b border-gray-700">
        Files
      </div>
      <div className="py-2">
        {files.length === 0 ? (
          <div className="px-4 py-2 text-gray-400 text-sm">
            No files available
          </div>
        ) : (
          files.map((node) => renderNode(node))
        )}
      </div>
    </div>
  );
}
