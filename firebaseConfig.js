// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd83ZpxUWJc4xWorrBeeefPYaUpfuABBU",
  authDomain: "bpa-clubconnect.firebaseapp.com",
  projectId: "bpa-clubconnect",
  storageBucket: "bpa-clubconnect.firebasestorage.app",
  messagingSenderId: "836826154002",
  appId: "1:836826154002:web:ff7c3fa708437e561ac4cb"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize auth with persistence.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
