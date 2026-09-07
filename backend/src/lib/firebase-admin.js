import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    projectId: "fortflux-edf82",
  });
}

const adminAuth = getAuth();

export default { auth: () => adminAuth };
