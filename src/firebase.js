import firebase from "firebase/app"
import "firebase/auth"
import "firebase/firestore";
import "firebase/storage";

const app = firebase.initializeApp({
  apiKey: "AIzaSyC4rYbtAA4lj15UzY1nEnfpCqbMzlHcqBo",
  authDomain: "travelini-1.firebaseapp.com",
  databaseURL: "https://travelini-1.firebaseio.com",
  projectId: "travelini-1",
  storageBucket: "travelini-1.appspot.com",
  messagingSenderId: "1019338652262",
  appId: "1:1019338652262:web:7a68705dbc477654bbcba7",
  measurementId: "G-1QP6KFZHS5"
  // apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  // authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  // projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.REACT_APP_FIREBASE_APP_ID
})

export const auth = app.auth()
export const firestore = app.firestore()
export const storage = app.storage()
export default app
