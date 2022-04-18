// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// import { getFirestore } from 'firebase/firestore'
// import { getStorage } from 'firebase/storage'
import { getAuth } from "firebase/auth";
// import { GoogleAuthProvider } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr2540mZ0QC4sVGKD5FYwOBaHP1GBNj3c",
  authDomain: "oursphones.firebaseapp.com",
  projectId: "oursphones",
  storageBucket: "oursphones.appspot.com",
  messagingSenderId: "385046268445",
  appId: "1:385046268445:web:8ab76cdb8d9a35592694f4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// const db = getFirestore();
// const storage = getStorage();
const auth = getAuth(app);
// const provider = new GoogleAuthProvider();

// export { db, storage, auth, provider }; 
export { auth }; 