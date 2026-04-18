import { updateProfile, type User } from 'firebase/auth';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';

const MAX_PROFILE_PHOTO_SIZE = 10 * 1024 * 1024;
const rawConvexUrl = import.meta.env.VITE_CONVEX_URL || 'https://strong-salamander-825.eu-west-1.convex.cloud';
const convexUrl = rawConvexUrl.replace(/\/$/, '');
const convex = new ConvexHttpClient(convexUrl);

export async function uploadProfilePhoto(user: User, file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_PROFILE_PHOTO_SIZE) {
    throw new Error('Profile photos must be 10MB or smaller.');
  }

  const uploadUrl = await convex.mutation(api.users.generateProfilePhotoUploadUrl, {
    firebaseUid: user.uid,
  });

  const uploadResult = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResult.ok) {
    throw new Error('Could not upload the selected profile photo.');
  }

  const { storageId } = await uploadResult.json();
  if (!storageId) {
    throw new Error('Profile photo upload did not return a valid storage id.');
  }

  const savedPhoto = await convex.mutation(api.users.saveProfilePhoto, {
    firebaseUid: user.uid,
    storageId,
  });

  await updateProfile(user, { photoURL: savedPhoto.photoURL });
  return savedPhoto.photoURL;
}
