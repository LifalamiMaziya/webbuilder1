'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import FileTree from '@/components/FileTree';
import CodeEditor from '@/components/CodeEditor';
import LivePreview from '@/components/LivePreview';
import { FileTreeNode, Project } from '@/types';

export default function ProjectEditorPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    content: string;
    language: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchFiles();
    }
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);

        // Construct preview URL if sandbox is active
        if (data.project.sandboxId && data.project.status === 'active') {
          // This will be provided by E2B
          setPreviewUrl(`https://sandbox-${data.project.sandboxId}.e2b.dev:3000`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/files/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(buildFileTree(data.files));
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  const buildFileTree = (fileList: any[]): FileTreeNode[] => {
    // Simple file tree builder - in production, this should be more robust
    const tree: FileTreeNode[] = [];
    const dirMap: Record<string, FileTreeNode> = {};

    // Sort files to ensure directories come first
    fileList.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    fileList.forEach((item) => {
      const node: FileTreeNode = {
        name: item.name,
        path: item.path,
        type: item.type,
        children: item.type === 'directory' ? [] : undefined,
      };

      const pathParts = item.path.split('/');
      if (pathParts.length === 1 || pathParts.length === 2) {
        tree.push(node);
        if (item.type === 'directory') {
          dirMap[item.path] = node;
        }
      } else {
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = dirMap[parentPath];
        if (parent && parent.children) {
          parent.children.push(node);
          if (item.type === 'directory') {
            dirMap[item.path] = node;
          }
        }
      }
    });

    return tree;
  };

  const handleFileSelect = async (path: string) => {
    try {
      // Extract relative path from full path (remove 'my-app/' prefix)
      const relativePath = path.replace('my-app/', '');
      const response = await fetch(`/api/files/${projectId}/${relativePath}`);

      if (response.ok) {
        const data = await response.json();
        setSelectedFile({
          path,
          content: data.content,
          language: getLanguageFromPath(path),
        });
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      css: 'css',
      html: 'html',
      md: 'markdown',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const handleFileChange = useCallback(
    async (content: string) => {
      if (!selectedFile) return;

      setSaving(true);
      try {
        const relativePath = selectedFile.path.replace('my-app/', '');
        await fetch(`/api/files/${projectId}/${relativePath}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        setSelectedFile({ ...selectedFile, content });
      } catch (error) {
        console.error('Failed to save file:', error);
      } finally {
        setSaving(false);
      }
    },
    [selectedFile, projectId]
  );

  // Debounce file saves
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedFile) {
        // Auto-save logic here if needed
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedFile?.content]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Loading project...</div>
        </div>
      </AuthGuard>
    );
  }

  if (!project) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-white text-xl">Project not found</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-gray-200"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-white">
              {project.name}
            </h1>
            {saving && (
              <span className="text-sm text-yellow-400">Saving...</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === 'active'
                  ? 'bg-green-900 text-green-200'
                  : project.status === 'creating'
                  ? 'bg-yellow-900 text-yellow-200'
                  : 'bg-red-900 text-red-200'
              }`}
            >
              {project.status}
            </span>
          </div>
        </header>

        {/* Main content - Split pane layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree - 20% */}
          <div className="w-1/5 border-r border-gray-700 overflow-hidden">
            <FileTree
              files={files}
              onFileSelect={handleFileSelect}
              selectedPath={selectedFile?.path || null}
            />
          </div>

          {/* Code Editor - 40% */}
          <div className="w-2/5 border-r border-gray-700 overflow-hidden">
            <CodeEditor file={selectedFile} onChange={handleFileChange} />
          </div>

          {/* Live Preview - 40% */}
          <div className="w-2/5 overflow-hidden">
            <LivePreview url={previewUrl} projectName={project.name} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
