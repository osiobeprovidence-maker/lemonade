import { updateProfile, type User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const MAX_PROFILE_PHOTO_SIZE = 100 * 1024 * 1024;
const MAX_INLINE_PROFILE_PHOTO_SIZE = 2 * 1024 * 1024;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Could not read the selected image.'));
    };
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadProfilePhoto(user: User, file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error('Profile photos must be 100MB or smaller.');
  }

  const fileExtension = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `profile-pictures/${user.uid}-${Date.now()}.${fileExtension}`);

  let photoURL: string;

  try {
    await uploadBytes(storageRef, file, { contentType: file.type });
    photoURL = await getDownloadURL(storageRef);
  } catch (error) {
    if (file.size > MAX_INLINE_PROFILE_PHOTO_SIZE) {
      throw new Error('Profile photo upload failed. Please try a smaller image (2MB or less).');
    }

    photoURL = await readFileAsDataUrl(file);
    console.warn('Falling back to inline profile photo storage.', error);
  }

  await updateProfile(user, { photoURL });
  return photoURL;
}
