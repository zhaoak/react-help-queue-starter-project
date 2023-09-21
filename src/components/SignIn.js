import React, {useState} from "react";
import { auth } from "./../firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

function SignIn() {

  const [signUpSuccess, setSignUpSuccess] = useState(null);
  const [signInSuccess, setSignInSuccess] = useState(null);
  const [signOutSuccess, setSignOutSuccess] = useState(null);

  function doSignUp(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // user successfully signs up
        setSignUpSuccess(`Successfully signed up as ${userCredential.user.email}.`);
      })
      .catch((error) => {
        // error with signup
        setSignUpSuccess(`Failed to sign up: ${error.message}`);
      });
  }

  function doSignIn(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        setSignInSuccess(`Signed in as ${userCredential.user.email}.`)
      })
      .catch((error) => {
        setSignInSuccess(`Failed to sign in: ${error.message}`)
      });
  }

  function doSignOut() {
    signOut(auth)
      .then(function() {
        setSignOutSuccess("Signed out.");
      }).catch(function(error) {
        setSignOutSuccess(`Error signing out: ${error.message}`);
      });
  }

  return (
    <React.Fragment>
      <h1>Sign Out</h1>
      {signOutSuccess}
      <br/>
      <button type='button' onClick={doSignOut}>Sign out</button>
      <h1>Sign In</h1>
      {signInSuccess}
      <form onSubmit={doSignIn}>
        <input type='email' name='email' placeholder='email' />
        <input type='password' name='password' placeholder='password' />
        <button type='submit'>Sign In</button>
      </form>
      <hr/>
      <h1>Sign Up</h1>
      {signUpSuccess}
      <form onSubmit={doSignUp}>
        <input type='email' name='email' placeholder='email' />
        <input type='password' name='password' placeholder='password' />
        <button type='submit'>Sign Up</button>
      </form>
    </React.Fragment>
  );
}

export default SignIn
