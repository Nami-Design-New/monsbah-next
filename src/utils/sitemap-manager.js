// Sitemap Cache Manager
// This module handles sitemap caching, chunking, and incremental updates

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = path.join(process.cwd(), '.sitemap-cache');
const MAX_URLS_PER_SITEMAP = 50000;
const MAX_BYTES_PER_SITEMAP = 50 * 1024 * 1024; // 50 MB

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

// Generate hash for content
function generateHash(content) {
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
}

// Load cached sitemap data
export async function loadSitemapCache(cacheKey) {
  try {
    await ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    const data = await fs.readFile(cachePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Cache doesn't exist or is corrupted, return null to trigger full regeneration
    return null;
  }
}

// Save sitemap cache
export async function saveSitemapCache(cacheKey, data) {
  try {
    await ensureCacheDir();
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

// Calculate XML size in bytes
function calculateXMLSize(entries) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const xmlFooter = `</urlset>`;
  
  const entriesXML = entries.map(entry => {
    return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
  }).join('\n');
  
  return Buffer.byteLength(xmlHeader + entriesXML + xmlFooter, 'utf8');
}

// Chunk sitemap entries based on limits
export function chunkSitemapEntries(entries) {
  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;
  
  // XML header and footer overhead
  const overhead = Buffer.byteLength(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`, 'utf8');
  
  for (const entry of entries) {
    const entryXML = `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>\n`;
    
    const entrySize = Buffer.byteLength(entryXML, 'utf8');
    const projectedSize = currentSize + entrySize + overhead;
    
    // Check if adding this entry would exceed limits
    if (currentChunk.length >= MAX_URLS_PER_SITEMAP || 
        projectedSize >= MAX_BYTES_PER_SITEMAP) {
      chunks.push(currentChunk);
      currentChunk = [entry];
      currentSize = entrySize;
    } else {
      currentChunk.push(entry);
      currentSize += entrySize;
    }
  }
  
  // Add remaining entries
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

// Detect changes in sitemap entries
export function detectSitemapChanges(oldEntries, newEntries) {
  const oldMap = new Map(oldEntries.map(e => [e.url, e]));
  const newMap = new Map(newEntries.map(e => [e.url, e]));
  
  const added = [];
  const updated = [];
  const deleted = [];
  const unchanged = [];
  
  // Find added and updated entries
  for (const [url, newEntry] of newMap) {
    const oldEntry = oldMap.get(url);
    
    if (!oldEntry) {
      added.push(newEntry);
    } else {
      const oldHash = generateHash(oldEntry);
      const newHash = generateHash(newEntry);
      
      if (oldHash !== newHash) {
        updated.push(newEntry);
      } else {
        unchanged.push(newEntry);
      }
    }
  }
  
  // Find deleted entries
  for (const [url, oldEntry] of oldMap) {
    if (!newMap.has(url)) {
      deleted.push(oldEntry);
    }
  }
  
  return { added, updated, deleted, unchanged };
}

// Merge changes into existing chunks efficiently
export function mergeChangesIntoChunks(oldChunks, changes) {
  const { added, updated, deleted } = changes;
  
  // Create a map of URLs to delete
  const deletedUrls = new Set(deleted.map(e => e.url));
  
  // Start with unchanged entries from old chunks (excluding deleted)
  let allEntries = [];
  
  for (const chunk of oldChunks) {
    const validEntries = chunk.filter(e => !deletedUrls.has(e.url));
    allEntries.push(...validEntries);
  }
  
  // Update existing entries with new data
  const updateMap = new Map(updated.map(e => [e.url, e]));
  allEntries = allEntries.map(entry => {
    const updatedEntry = updateMap.get(entry.url);
    return updatedEntry || entry;
  });
  
  // Add new entries
  allEntries.push(...added);
  
  // Sort by URL for consistency
  allEntries.sort((a, b) => a.url.localeCompare(b.url));
  
  // Rechunk based on limits
  return chunkSitemapEntries(allEntries);
}

// Generate sitemap XML from entries
export function generateSitemapXML(entries, xmlns = {}) {
  const namespaces = {
    'xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
    ...xmlns
  };
  
  const namespaceStr = Object.entries(namespaces)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset ${namespaceStr}>
${entries.map(entry => {
  let urlXml = `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>`;
  
  // Add additional fields if present
  if (entry.images) {
    urlXml += '\n' + entry.images.map(img => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      ${img.caption ? `<image:caption><![CDATA[${img.caption}]]></image:caption>` : ''}
      ${img.title ? `<image:title><![CDATA[${img.title}]]></image:title>` : ''}
    </image:image>`).join('\n');
  }
  
  urlXml += '\n  </url>';
  return urlXml;
}).join('\n')}
</urlset>`;
  
  return xml;
}

// Escape XML special characters
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Calculate statistics for sitemap
export function calculateSitemapStats(chunks) {
  const totalUrls = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const totalSize = chunks.reduce((sum, chunk) => sum + calculateXMLSize(chunk), 0);
  const avgUrlsPerChunk = chunks.length > 0 ? Math.round(totalUrls / chunks.length) : 0;
  
  return {
    totalChunks: chunks.length,
    totalUrls,
    totalSize,
    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    avgUrlsPerChunk,
    maxUrlsPerChunk: Math.max(...chunks.map(c => c.length)),
    minUrlsPerChunk: Math.min(...chunks.map(c => c.length)),
  };
}

// Validate sitemap entry
export function validateSitemapEntry(entry) {
  const errors = [];
  
  if (!entry.url) {
    errors.push('URL is required');
  } else if (entry.url.length > 2048) {
    errors.push('URL exceeds 2048 characters');
  }
  
  if (!entry.lastModified) {
    errors.push('lastModified is required');
  } else {
    const date = new Date(entry.lastModified);
    if (isNaN(date.getTime())) {
      errors.push('lastModified is not a valid date');
    }
  }
  
  const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  if (!validFrequencies.includes(entry.changeFrequency)) {
    errors.push(`changeFrequency must be one of: ${validFrequencies.join(', ')}`);
  }
  
  if (typeof entry.priority !== 'number' || entry.priority < 0 || entry.priority > 1) {
    errors.push('priority must be a number between 0 and 1');
  }
  
  return errors;
}

export const SitemapLimits = {
  MAX_URLS_PER_SITEMAP,
  MAX_BYTES_PER_SITEMAP,
  MAX_URL_LENGTH: 2048,
  MAX_SITEMAPS_IN_INDEX: 50000,
};
