export const FILE_BUCKETS = ['applications', 'proofs', 'fsot', 'weiss-applications', 'weiss-attendance-proof', 'weiss-intern-proof', 'butts-applications', 'butts-attendance-proof', 'butts-requirements', 'lemoine-applications', 'lemoine-resumes', 'lemoine-transcripts', 'lemoine-recommendations'] as const
export const UPLOAD_BUCKETS = ['applications', 'proofs', 'fsot', 'butts-applications', 'butts-attendance-proof', 'butts-requirements'] as const
export function filePath(bucket: string | null, path: string | null) {
  if (!bucket || !(FILE_BUCKETS as readonly string[]).includes(bucket) || !path || path.includes('..') || path.startsWith('/') || path.length > 1024 || /[\r\n\\]/.test(path)) return null
  return `${bucket}/${path}`
}
