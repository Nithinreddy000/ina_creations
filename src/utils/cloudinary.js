const CLOUDINARY_CLOUD_NAME = 'dg7j00lxv';
const CLOUDINARY_UPLOAD_PRESET = 'ina_portfolio_videos';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;
const CLOUDINARY_IMAGE_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const uploadVideoToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
  // Only include allowed parameters for unsigned upload
  formData.append('folder', 'portfolio_videos');
  formData.append('resource_type', 'video');

  try {
    const xhr = new XMLHttpRequest();
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.open('POST', CLOUDINARY_UPLOAD_URL, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress?.(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          // Generate thumbnail URL using the video's public ID
          const thumbnailUrl = getVideoThumbnail(response.public_id);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
            thumbnail: thumbnailUrl,
            duration: response.duration
          });
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error?.message || 'Upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Upload thumbnail image to Cloudinary
export const uploadThumbnailToCloudinary = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
  formData.append('folder', 'portfolio_thumbnails');
  formData.append('resource_type', 'image');

  try {
    const xhr = new XMLHttpRequest();
    const uploadPromise = new Promise((resolve, reject) => {
      xhr.open('POST', CLOUDINARY_IMAGE_UPLOAD_URL, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress?.(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id
          });
        } else {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error?.message || 'Thumbnail upload failed'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during thumbnail upload'));
      };

      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    console.error('Error uploading thumbnail to Cloudinary:', error);
    throw error;
  }
};

// Function to generate a video thumbnail URL with better quality and positioning
export const getVideoThumbnail = (publicId, transformations = {}) => {
  const {
    width = 640,
    height = 360,
    quality = 80
  } = transformations;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_${quality},w_${width},h_${height},c_fill,g_auto/${publicId}.jpg`;
};

// Function to generate a Cloudinary video URL with transformations
export const getVideoUrl = (publicId, transformations = {}) => {
  const {
    width = 1280,
    height = 720,
    quality = 'auto',
    format = 'auto'
  } = transformations;

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_${quality},w_${width},h_${height}/${publicId}.${format}`;
}; 