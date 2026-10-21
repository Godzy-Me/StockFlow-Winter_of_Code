import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//this is for firebase js sdk
const firebaseConfig = {
  apiKey:"AIzaSyD0cLvKJ2gEUo03q2vf2io-SpJONMetTRM",
  authDomain:"stockflow-84ac1.firebaseapp.com",
  projectId:"stockflow-84ac1",
  storageBucket:"stockflow-84ac1.firebasestorage.app",
  messagingSenderId:"619265296356",
  appId:"1:619265296356:web:411bd14b45af870a9969f1",
  measurementId:"G-XW9FV7N9TX"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
