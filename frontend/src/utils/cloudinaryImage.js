const UPLOAD_MARKER = '/upload/';

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(UPLOAD_MARKER);
}

/**
 * Inserts Cloudinary delivery transforms (auto format/quality, optional resize)
 * into an existing Cloudinary URL. Non-Cloudinary URLs are returned unchanged.
 */
export function getOptimizedImageUrl(url, { width, height, crop = 'fill' } = {}) {
  if (!isCloudinaryUrl(url)) return url;

  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${transforms.join(',')}/`);
}

/**
 * Builds a srcSet string across the given widths for responsive image loading.
 */
export function getImageSrcSet(url, widths, options = {}) {
  if (!isCloudinaryUrl(url)) return undefined;
  return widths.map((width) => `${getOptimizedImageUrl(url, { ...options, width })} ${width}w`).join(', ');
}
