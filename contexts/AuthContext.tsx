import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { switchDatabase, migrateToUserDatabase } from '@/utils/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MIGRATION_KEY = 'database_migration_completed';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User signed in - switch to their database first (this initializes tables)
          console.log('User signed in:', user.uid);
          await switchDatabase(user.uid);

          // Check if migration is needed (first time login after update)
          const migrationCompleted = await AsyncStorage.getItem(`${MIGRATION_KEY}_${user.uid}`);

          if (!migrationCompleted) {
            console.log('First login for user, attempting migration...');
            await migrateToUserDatabase(user.uid);
            await AsyncStorage.setItem(`${MIGRATION_KEY}_${user.uid}`, 'true');
          }
        } else {
          // User signed out - switch to default database
          console.log('User signed out');
          await switchDatabase(null);
        }

        setUser(user);
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(user);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
