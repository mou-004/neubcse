import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzsvE9G_NXXKb_MfnKu4gusWd3z_Jnryw",
  authDomain: "neub-cse-management-840ae.firebaseapp.com",
  projectId: "neub-cse-management-840ae",
  storageBucket: "neub-cse-management-840ae.firebasestorage.app",
  messagingSenderId: "496700338766",
  appId: "1:496700338766:web:7e8dfdd61818e198f6091f",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
//export const storage = getStorage(app);
export const storage = getStorage(
  app,
  "gs://neub-cse-management-840ae.firebasestorage.app"
);
export default app;