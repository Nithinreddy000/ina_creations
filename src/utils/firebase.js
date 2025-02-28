import { initializeApp } from 'firebase/app';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  getFirestore
} from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCESj7lM5z3JZqRAlOq84ob1Otm8XhKd0k",
  authDomain: "inacreations-6ada9.firebaseapp.com",
  projectId: "inacreations-6ada9",
  storageBucket: "inacreations-6ada9.firebasestorage.app",
  messagingSenderId: "692311035508",
  appId: "1:692311035508:web:ebc12e16c15094c1fe8b21",
  measurementId: "G-G9XH30KPDC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Set auth persistence
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Auth persistence error:", error);
});

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});

// Try to enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (error) {
  console.error("Error enabling persistence:", error);
}

// Portfolio items collection reference
const portfolioCollection = collection(db, 'portfolio');

// Add a new portfolio item with retry logic
export const addPortfolioItem = async (itemData) => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to add portfolio items');
  }

  const maxRetries = 3;
  let currentAttempt = 0;

  const tryUpload = async () => {
    try {
      const docRef = await addDoc(portfolioCollection, {
        ...itemData,
        createdAt: new Date(),
        userId: auth.currentUser.uid
      });
      return docRef.id;
    } catch (error) {
      currentAttempt++;
      console.error(`Error adding portfolio item (attempt ${currentAttempt}/${maxRetries}):`, error);
      
      if (currentAttempt === maxRetries) {
        throw new Error('Failed to add portfolio item after multiple attempts');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentAttempt)));
      return tryUpload();
    }
  };

  return tryUpload();
};

// Get all portfolio items with retry logic
export const getPortfolioItems = async () => {
  const maxRetries = 3;
  let currentAttempt = 0;

  const tryFetch = async () => {
    try {
      const querySnapshot = await getDocs(portfolioCollection);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      currentAttempt++;
      console.error(`Error getting portfolio items (attempt ${currentAttempt}/${maxRetries}):`, error);
      
      if (currentAttempt === maxRetries) {
        throw new Error('Failed to get portfolio items after multiple attempts');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentAttempt)));
      return tryFetch();
    }
  };

  return tryFetch();
};

// Delete a portfolio item with retry logic
export const deletePortfolioItem = async (itemId) => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to delete portfolio items');
  }

  const maxRetries = 3;
  let currentAttempt = 0;

  const tryDelete = async () => {
    try {
      await deleteDoc(doc(db, 'portfolio', itemId));
      return true;
    } catch (error) {
      currentAttempt++;
      console.error(`Error deleting portfolio item (attempt ${currentAttempt}/${maxRetries}):`, error);
      
      if (currentAttempt === maxRetries) {
        throw new Error('Failed to delete portfolio item after multiple attempts');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, currentAttempt)));
      return tryDelete();
    }
  };

  return tryDelete();
}; 