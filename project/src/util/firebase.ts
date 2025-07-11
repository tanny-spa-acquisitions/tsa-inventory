import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDMYJsNVbuik9Z808zri__KyDkodr9zDWw",
  authDomain: "tsa-inventory.firebaseapp.com",
  projectId: "tsa-inventory",
  storageBucket: "tsa-inventory.firebasestorage.app",
  messagingSenderId: "804428157082",
  appId: "1:804428157082:web:70349de3dadb70497c0f23",
  measurementId: "G-RE8MMWTZSQ"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
