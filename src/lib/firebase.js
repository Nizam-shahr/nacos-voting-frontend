
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import Authentication SDK

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB9PLKf1nRqWCpHK1AxJVSCLzBFH0Uy6kE', // Use env variable
  authDomain: 'alhikmahvotingplatform.firebaseapp.com',
  projectId: 'alhikmahvotingplatform',
  storageBucket: 'alhikmahvotingplatform.firebasestorage.app',
  messagingSenderId: '676675263675',
  appId: '1:676675263675:web:0f94bf49c9f880cec75d9e',
  measurementId: 'G-S0J9JFBMD8',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

export { app, auth };
