import assert from 'assert';
import firebase from 'services/firebase';

export async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const credential = await firebase.auth().signInWithPopup(provider);
  assert(credential.user, 'sign in fail');
  const { uid } = credential.user;
  return uid;
}
