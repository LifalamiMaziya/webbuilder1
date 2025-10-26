// Core types for the project management dashboard

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  sandboxId: string | null;
  status: 'creating' | 'active' | 'stopped' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  filePath: string;
  content: string;
  updatedAt: Date;
}

export interface SandboxInfo {
  sandboxId: string;
  url: string;
  status: 'running' | 'stopped' | 'error';
  createdAt: Date;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export interface EditorFile {
  path: string;
  content: string;
  language: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateFileRequest {
  path: string;
  content: string;
}

export interface CreateFileRequest {
  path: string;
  content: string;
  type: 'file' | 'directory';
}
