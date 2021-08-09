import React, { useContext, useState, useEffect } from "react";
import { auth, firestore } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [privileges, setPrivileges] = useState();
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    await auth.createUserWithEmailAndPassword(email, password);
    if (auth.currentUser) {
      auth.currentUser.updateProfile({ displayName: name })
      uploadAdminDataFirst(name, email, new Date())
    }
  }

  async function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function logout() {
    return auth.signOut();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return currentUser.updateEmail(email);
  }

  function updatePassword(password) {
    return currentUser.updatePassword(password);
  }

  function uploadAdminDataFirst(name, email, lastLogin) {
    return firestore.collection("Admins").doc(auth.currentUser.uid).set({
      name: name,
      email: email,
      staycationCount: 0,
      lastLogin: lastLogin,
      createdAt: lastLogin,
      privileges: "None",
    }, { merge: true })
  }

  function uploadAdminData(name, email, staycationCount, lastLogin) {
    return firestore.collection("Admins").doc(auth.currentUser.uid).update({
      name: name,
      email: email,
      staycationCount: staycationCount,
      lastLogin: lastLogin
    }, { merge: true }).catch(e => {
      console.log("FIRST");
      return uploadAdminDataFirst(name, email, lastLogin)
    });
  }

  async function getPrivileges() {
    let privileges = "None";
    if (auth.currentUser != null) {
      const doc = await firestore.collection("Admins").doc(auth.currentUser.uid).get()
      privileges = doc.get("privileges") || "None"
    }
    return privileges
  }

  async function getPrivilegesBeforeLogin(email) {

    //await (await firestore.collection("Admins").where("email","==",email).get()).docs[0].get()
    //return "NA";
    /*onSnapshot({
      next: snapshot => {
        console.log(snapshot)
        let doc = snapshot.docs[0].get()
        let prevs = doc.get("privileges") || "None"
        return prevs
      }
  });*/
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const privileges = await getPrivileges();
      setCurrentUser(user);
      setPrivileges(privileges);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    privileges,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
    uploadAdminData,
    getPrivileges
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
