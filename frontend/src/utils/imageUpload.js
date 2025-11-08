export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  
  export function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
  
    if (!validTypes.includes(file.type)) {
      return 'Please upload JPG, PNG, or WebP image';
    }
  
    if (file.size > maxSize) {
      return 'Image must be less than 5MB';
    }
  
    return null;
  }
  