import imageCompression from 'browser-image-compression'

export async function compressImage(file: File, options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
}): Promise<File> {
  return await imageCompression(file, options)
}