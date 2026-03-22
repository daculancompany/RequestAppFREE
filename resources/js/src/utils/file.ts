import { message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

export const beforeUpload = (file: UploadFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG files!');
    return false;
  }
  
  const isLt2M = file.size! / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must be smaller than 2MB!');
    return false;
  }
  
  return true;
};

export const getBase64 = (file: File, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(file);
};