import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const ADMIN_UID = 'Wz0F3s9GetRRmXkAcHATpW6UiK13';
export const authReady = new Promise((resolve, reject) => {
  const unsubscribe = onAuthStateChanged(auth, user => { unsubscribe(); resolve(user); }, error => { unsubscribe(); reject(error); });
});
let anonymousPromise = null;
export async function ensureAnonymousUser() {
  await authReady;
  if (auth.currentUser) return auth.currentUser;
  if (!anonymousPromise) {
    anonymousPromise = signInAnonymously(auth).then(result => result.user).finally(() => { anonymousPromise = null; });
  }
  return anonymousPromise;
}
