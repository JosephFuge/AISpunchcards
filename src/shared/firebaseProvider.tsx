import {
  createContext,
  ReactNode,
  FC,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AppUser } from "../models/appuser";
import { Database } from "./firebase/database";
import { FileStorage } from "./firebase/fileStorage";
import { firebaseConfig } from "./firebase/firebaseConfig.js";
import { initializeApp } from "firebase/app";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";

export const app = initializeApp(firebaseConfig);
const auth = getAuth();

interface FirebaseContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  googleSignIn: () => Promise<void>;
  setNewUser: (newUser: AppUser) => Promise<void>;
  userSignOut: () => Promise<void>;
  db: Database;
  fileStorage: FileStorage;
}

interface FirebaseProviderProps {
  children: ReactNode;
}

export const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);
export const FirebaseProvider: FC<FirebaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const db = useMemo(() => new Database(app), []);
  const fileStorage = useMemo(() => new FileStorage(app), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (auth.currentUser != null) {
          console.log(`AuthUserId: ${auth.currentUser.uid}`);
        }
        if (currentUser != null) {
          console.log(`currentuserUserId: ${currentUser.uid}`);
        }
        const fetchedUser = await db.fetchUser(
          auth.currentUser != null ? auth.currentUser.uid : currentUser.uid
        );
        if (fetchedUser) {
          setUser(fetchedUser || null);
          setIsAuthenticated(fetchedUser != null && fetchedUser !== undefined);
        } else {
          setIsAuthenticated(true);
          setUser(null);
        }
      } else {
        console.log("No current user");
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [db]);

  const googleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const fetchedUser = await db.fetchUser(result.user.uid);
      setUser(fetchedUser || null);
      setIsAuthenticated(!!fetchedUser);
    } catch (error) {
      console.error(error);
    }
  }, [db]);

  const userSignOut = useCallback(async () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setIsAuthenticated(false);
        // signOutNav();
      })
      .catch((error) => {
        console.log("Signout Unsuccessful");
      });
  }, []);

  const setNewUser = useCallback(
    async (newUser: AppUser) => {
      await db.addUser(newUser); // Add the user to the database
      setUser(newUser);
    },
    [db]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      googleSignIn,
      setNewUser,
      userSignOut,
      db,
      fileStorage,
    }),
    [user, isAuthenticated, googleSignIn, setNewUser, userSignOut, db, fileStorage]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
