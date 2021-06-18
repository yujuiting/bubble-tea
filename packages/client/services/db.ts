import firebase from 'services/firebase';
import 'firebase/firestore';

const db = firebase.firestore();

export async function addWallet(uid: string, address: string) {
  return await db.collection(`users/${uid}/wallets`).add({ address });
}

export async function getWallets(uid: string) {
  return await db.collection(`users/${uid}/wallets`).get();
}
