import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpB6wVvOiBv0GkH1I_-Qt0TE7kU9be804",
  authDomain: "wallnexa.firebaseapp.com",
  projectId: "wallnexa",
  storageBucket: "wallnexa.firebasestorage.app",
  messagingSenderId: "90196327552",
  appId: "1:90196327552:web:f3ca225b96a6d888d8ba65",
  measurementId: "G-9YW2KX9FCV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;