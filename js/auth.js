import {auth,db} from "./firebase.js";

import{
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
}from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";




import{
  doc, // points to document(more like initiate pointer on doc)
  setDoc  //writes on documents
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/*REGISTER*/

const registerBtn= document.getElementById("registerBtn");

if(registerBtn){
  registerBtn.addEventListener("click", async() => {
    const email= document.getElementById("regEmail").value;
    const password= document.getElementById("regPassword").value;
    const role= document.getElementById("role").value;

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    try{
      //till user doesnt create credentials, credentials var will wait
      const cred =await createUserWithEmailAndPassword(auth,email,password);
      await setDoc(doc(db,"users",cred.user.uid),{  //creates firestone doc for the user with unique id
        email,
        role
      });

      alert("User registered");

      window.location.href = "index.html"; //redirects the browser to another page/ends the registration flow
    }catch(err){
      alert(err.message);
    }
  });
}

/*LOGIN*/

const loginBtn =document.getElementById("loginBtn");

if(loginBtn){
  loginBtn.addEventListener("click", async () => {
    const email =document.getElementById("loginEmail").value;
    const password =document.getElementById("loginPassword").value;

    if(!email || !password) {
      alert("Fill all fields");
      return;
    }try{
      await signInWithEmailAndPassword(auth,email,password);
      window.location.href ="dashboard.html";
    } catch(err) {
      alert(err.message);
    }
  });
}

/*logging out*/

window.logout =async function () {
  await signOut(auth);   //logs the user out of firebase authentication
  window.location.href = "index.html";
};
