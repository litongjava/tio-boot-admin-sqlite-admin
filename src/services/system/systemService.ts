import {request} from '@umijs/max';
import crypto from 'crypto';
// Define a type for the options parameter
interface UploadOptions {
  file: File;
  onSuccess: (response: any, file: File) => void;
  onError: (error: any) => void;
}


export async function changeUserPassword(data: any): Promise<API.Result> {
  return request<API.Result>('/api/system/changeUserPassword', {
    method: 'POST',
    data,
  });
}


export async function uploadImageToGoogle(file: any) {
  const formData = new FormData();
  formData.append('file', file);
  return request<API.Result>('/api/system/file/uploadImageToGoogle', {
    method: 'POST',
    data: formData,
  });
}

export async function customEmptyUploadRequest(options: any) {
  const {file, onSuccess, onError} = options;
  onSuccess({}, file);
}

export async function customUploadImageToGoogle(options: any) {
  const {file, onSuccess, onError} = options;
  uploadImageToGoogle(file)
    .then(response => {
      //必须回调
      onSuccess(response, file);
    })
    .catch(onError); // 上传失败
}


export async function uploadToTencent(file: any) {
  const formData = new FormData();
  formData.append('file', file);
  return request<API.Result>('/api/system/file/uploadToTencentCos', {
    method: 'POST',
    data: formData,
  });
}

export async function customUploadToTencent(options: any) {
  const {file, onSuccess, onError} = options;
  uploadToTencent(file)
    .then(response => {
      //必须回调
      onSuccess(response, file);
    })
    .catch(onError); // 上传失败
}

export async function generateSd3(file: any, formValues: any): Promise<API.Result> {
  const formData = new FormData();
  if (file) {
    formData.append('image', file);
  }
  for (let key in formValues) {
    if (formValues[key]) {
      formData.append(key, formValues[key]);
    }
  }

  return request<API.Result>('/api/sd/generateSd3', {
    method: 'POST',
    data: formData,
  });
}


export async function customUploadForEditor(file: File, insertFn: any) {
  // file 即选中的文件
  // 自己实现上传，并得到图片 url alt href
  // 最后插入图片
  uploadToTencent(file).then(response => {
    if (response.ok) {
      let url = response.data.url;
      let alt = response.data.id;
      insertFn(url, alt, url)
    } else {
      insertFn("", "fail", "")
    }
  });
}

export async function uploadFileToS3(category: string, file: any) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);
  return request<API.Result>('/api/system/file/s3/upload', {
    method: 'POST',
    data: formData,
  });
}

// Modified customUploadToS3 function
export async function customUploadToS3(category: string, options: UploadOptions) {
  const { file, onSuccess, onError } = options;

  try {
    const md5 = await calculateFileMd5(file);
    const response = await checkFileExistence(md5);

    if (response.ok && response.data) {
      // File exists, directly return the response
      const customResponse = {
        data: {
          id: response.data.id,
          url: response.data.url,
        },
      };
      onSuccess(customResponse, file);
    } else {
      // File does not exist, proceed with upload
      uploadFileToS3(category, file)
        .then(response => {
          // Must call onSuccess callback
          onSuccess(response, file);
        })
        .catch(onError); // Upload failed
    }
  } catch (error) {
    onError(error);
  }
}

// Function to calculate the MD5 hash of a file
function calculateFileMd5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      if (event.target && event.target.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const hash = crypto.createHash('md5').update(Buffer.from(arrayBuffer)).digest('hex');
        resolve(hash);
      } else {
        reject(new Error('File reading error'));
      }
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Function to check if a file exists on the server by its MD5 hash
async function checkFileExistence(md5: string) {
  return request<API.Result>(`/api/system/file/s3/url?md5=${md5}`, {
    method: 'GET',
  });
}
