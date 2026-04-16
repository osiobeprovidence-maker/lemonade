import { updateProfile, type User } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const MAX_PROFILE_PHOTO_SIZE = 5 * 1024 * 1024;

export async function uploadProfilePhoto(user: User, file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error('Profile photos must be 5MB or smaller.');
  }

  const fileExtension = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `profile-pictures/${user.uid}-${Date.now()}.${fileExtension}`);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const photoURL = await getDownloadURL(storageRef);

  await updateProfile(user, { photoURL });
  return photoURL;
}
