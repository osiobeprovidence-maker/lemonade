import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { auth } from '../lib/firebase';
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signOut,
  updateProfile,
  getAdditionalUserInfo
} from 'firebase/auth';

interface ConvexUserProfile {
  _id: string;
  firebaseUid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  coins?: number;
  role: 'reader' | 'creator' | 'admin';
  isPremium: boolean;
  bio?: string;
  genres?: string[];
  dropSomethingLink?: string;
  birthMonth?: string;
  birthDay?: number;
  birthYear?: number;
  pronouns?: string;
  marketingEmails?: boolean;
  acceptedTerms?: boolean;
  onboardingCompleted?: boolean;
}

interface AuthActionResult {
  requiresProfileCompletion: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: ConvexUserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthActionResult>;
  signInWithGoogle: () => Promise<AuthActionResult>;
  signInWithApple: () => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<ConvexUserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<ConvexUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Convex query
  const convexUser = useQuery(api.users.getUser, user ? { firebaseUid: user.uid } : "skip");
  
  // Convex mutation
  const createUser = useMutation(api.users.createUser);
  const updateUserProfileMutation = useMutation(api.users.updateUserProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sync Firebase user to Convex
  useEffect(() => {
    if (user && convexUser === null && !loading) {
      // User exists in Firebase but not in Convex, create them
      createUser({
        firebaseUid: user.uid,
        email: user.email || undefined,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      }).catch(err => console.error('Failed to create user in Convex:', err));
    } else if (convexUser) {
      setUserProfile(convexUser);
    }
  }, [user, convexUser, loading, createUser]);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
    return { requiresProfileCompletion: true };
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return {
      requiresProfileCompletion: Boolean(getAdditionalUserInfo(credential)?.isNewUser),
    };
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    const credential = await signInWithPopup(auth, provider);
    return {
      requiresProfileCompletion: Boolean(getAdditionalUserInfo(credential)?.isNewUser),
    };
  };

  const logout = async () => {
    setUserProfile(null);
    await signOut(auth);
  };

  const updateUserProfile = async (data: Partial<ConvexUserProfile>) => {
    if (!user) return;

    if ("displayName" in data || "photoURL" in data) {
      await updateProfile(user, {
        displayName: data.displayName ?? user.displayName ?? null,
        photoURL: data.photoURL ?? user.photoURL ?? null,
      });
    }

    const payload = {
      firebaseUid: user.uid,
      displayName: data.displayName,
      bio: data.bio,
      photoURL: data.photoURL,
      genres: data.genres,
      dropSomethingLink: data.dropSomethingLink,
      birthMonth: data.birthMonth,
      birthDay: data.birthDay,
      birthYear: data.birthYear,
      pronouns: data.pronouns,
      marketingEmails: data.marketingEmails,
      acceptedTerms: data.acceptedTerms,
      onboardingCompleted: data.onboardingCompleted,
    };

    await updateUserProfileMutation(payload);

    setUserProfile((current) => {
      if (!current) return current;
      return {
        ...current,
        ...data,
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
