import { supabase } from '@/integrations/supabase/client';
import { GalleryService, type GalleryImage } from './gallery';

export interface OrphanedFile {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

export interface StorageCleanupResult {
  totalFiles: number;
  orphanedFiles: OrphanedFile[];
  referencedFiles: string[];
  cleanupSize: number; // Total size of orphaned files in bytes
}

/**
 * Detect orphaned files in storage that are not referenced in the database
 */
export async function detectOrphanedFiles(): Promise<StorageCleanupResult> {
  const result: StorageCleanupResult = {
    totalFiles: 0,
    orphanedFiles: [],
    referencedFiles: [],
    cleanupSize: 0
  };

  try {
    // Get all files from storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('gallery')
      .list('', { limit: 1000 }); // Adjust limit as needed

    if (storageError) {
      throw new Error(`Failed to list storage files: ${storageError.message}`);
    }

    if (!storageFiles) {
      return result;
    }

    result.totalFiles = storageFiles.length;

    // Get all referenced files from database
    const { data: dbImages, error: dbError } = await supabase
      .from('gallery_images')
      .select('file_path');

    if (dbError) {
      throw new Error(`Failed to get database images: ${dbError.message}`);
    }

    const referencedPaths = new Set(dbImages?.map(img => img.file_path) || []);
    result.referencedFiles = Array.from(referencedPaths);

    // Find orphaned files
    for (const file of storageFiles) {
      const filePath = file.name;
      
      // Skip if file is referenced in database
      if (referencedPaths.has(filePath)) {
        continue;
      }

      // Check if file is referenced in posts table
      const { data: postsWithImage } = await supabase
        .from('posts')
        .select('image')
        .eq('image', filePath)
        .limit(1);

      if (postsWithImage && postsWithImage.length > 0) {
        continue; // File is referenced in posts
      }

      // File is orphaned
      const orphanedFile: OrphanedFile = {
        name: file.name,
        path: filePath,
        size: file.metadata?.size || 0,
        lastModified: new Date(file.updated_at || file.created_at || Date.now())
      };

      result.orphanedFiles.push(orphanedFile);
      result.cleanupSize += orphanedFile.size;
    }

    // Log results
    console.log('Storage Cleanup Analysis:', {
      totalFiles: result.totalFiles,
      referencedFiles: result.referencedFiles.length,
      orphanedFiles: result.orphanedFiles.length,
      cleanupSizeMB: Math.round(result.cleanupSize / 1024 / 1024 * 100) / 100
    });

    if (result.orphanedFiles.length > 0) {
      console.warn('Orphaned files found:', result.orphanedFiles.map(f => ({
        name: f.name,
        size: f.size,
        lastModified: f.lastModified
      })));
    }

    return result;

  } catch (error) {
    console.error('Storage cleanup analysis failed:', error);
    throw error;
  }
}

/**
 * Clean up orphaned files (with confirmation)
 */
export async function cleanupOrphanedFiles(
  orphanedFiles: OrphanedFile[], 
  confirm: boolean = false
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  
  if (!confirm) {
    console.warn('Cleanup not confirmed. Pass confirm=true to actually delete files.');
    return { success: false, deletedCount: 0, error: 'Not confirmed' };
  }

  if (orphanedFiles.length === 0) {
    return { success: true, deletedCount: 0 };
  }

  try {
    const filePaths = orphanedFiles.map(f => f.path);
    
    const { error } = await supabase.storage
      .from('gallery')
      .remove(filePaths);

    if (error) {
      throw new Error(`Failed to delete orphaned files: ${error.message}`);
    }

    console.log(`Successfully deleted ${orphanedFiles.length} orphaned files`);
    
    return { success: true, deletedCount: orphanedFiles.length };

  } catch (error) {
    console.error('Failed to cleanup orphaned files:', error);
    return { 
      success: false, 
      deletedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  averageFileSize: number;
  fileTypes: Record<string, number>;
}> {
  try {
    const { data: storageFiles, error } = await supabase.storage
      .from('gallery')
      .list('', { limit: 1000 });

    if (error) {
      throw error;
    }

    if (!storageFiles) {
      return { totalFiles: 0, totalSize: 0, averageFileSize: 0, fileTypes: {} };
    }

    const totalSize = storageFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    const fileTypes: Record<string, number> = {};

    storageFiles.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    });

    return {
      totalFiles: storageFiles.length,
      totalSize,
      averageFileSize: storageFiles.length > 0 ? totalSize / storageFiles.length : 0,
      fileTypes
    };

  } catch (error) {
    console.error('Failed to get storage stats:', error);
    throw error;
  }
}