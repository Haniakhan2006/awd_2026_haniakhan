import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocFromServer
} from "firebase/firestore";

// Read Firebase Config from generated config file
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
// Note: set_up_firebase creates a dedicated custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();

// Test Firebase connection as requested in SKILL.md
export async function testFirebaseConnection() {
  try {
    const testDoc = doc(db, "test", "connection");
    await getDocFromServer(testDoc);
    console.log("Firebase connection verified and active.");
    return true;
  } catch (error: any) {
    const errStr = error?.message || String(error);
    if (errStr.includes("offline")) {
      console.warn("Firebase client appears to be offline. Caching queries.");
    } else if (errStr.includes("permission") || errStr.includes("denied") || errStr.includes("Permission")) {
      console.log("Firebase server handshake verified successfully (security rules active).");
      return true;
    } else {
      console.warn("Firebase connection test notice:", errStr);
    }
    return false;
  }
}

// Safely test connection in background after app mount
if (typeof window !== "undefined") {
  setTimeout(() => {
    testFirebaseConnection().catch(() => {});
  }, 1000);
}

export interface OfflineWrite {
  collectionName: string;
  data: any;
}

export function queueOfflineWrite(collectionName: string, data: any) {
  try {
    const queue: OfflineWrite[] = JSON.parse(localStorage.getItem("offline-write-queue") || "[]");
    queue.push({ collectionName, data });
    localStorage.setItem("offline-write-queue", JSON.stringify(queue));
    console.log(`[Firebase Offline] Queued offline write for ${collectionName}:`, data);
  } catch (err) {
    console.error("[Firebase Offline] Failed to queue offline write:", err);
  }
}

export async function processOfflineQueue() {
  if (typeof window === "undefined" || !navigator.onLine) return;
  
  try {
    const queue: OfflineWrite[] = JSON.parse(localStorage.getItem("offline-write-queue") || "[]");
    if (queue.length === 0) return;
    
    console.log(`[Firebase Sync] Processing offline queue with ${queue.length} items...`);
    const remaining: OfflineWrite[] = [];
    
    for (const item of queue) {
      try {
        await addDoc(collection(db, item.collectionName), item.data);
        console.log(`[Firebase Sync] Successfully synced offline write to ${item.collectionName}`);
      } catch (err) {
        console.error(`[Firebase Sync] Failed to sync offline item to ${item.collectionName}, re-queuing:`, err);
        remaining.push(item);
      }
    }
    
    localStorage.setItem("offline-write-queue", JSON.stringify(remaining));
  } catch (err) {
    console.error("[Firebase Sync] Error processing offline queue:", err);
  }
}

// Global window listener to auto-sync when online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[Network] Connection restored. Starting offline sync...");
    processOfflineQueue();
  });
}

export async function safeAddDoc(collectionName: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log(`[Firebase] Document successfully written to ${collectionName}:`, docRef.id);
    return docRef;
  } catch (error) {
    console.warn(`[Firebase] Write to ${collectionName} failed. Caching locally:`, error);
    queueOfflineWrite(collectionName, data);
    return null;
  }
}

// ==========================================
// OFFLINE CACHE HELPER (MODULE 16)
// ==========================================
// We will implement local storage synchronization so farmers can use the app offline!
export function getLocalStorageCache<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorageCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Local Storage cache write failed:", error);
  }
}
