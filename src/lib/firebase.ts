// src/lib/firebase.ts
    import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    const firebaseConfig = {
        apiKey: "AIzaSyB_HzRrVdysW3o-UXUdCkPqW9rH4fWWjyY",
        authDomain: "rankpilot-h3jpc.firebaseapp.com",
        projectId: "rankpilot-h3jpc",
        storageBucket: "rankpilot-h3jpc.firebasestorage.app",
        messagingSenderId: "283736429782",
        appId: "1:283736429782:web:a3e387a3a79a592121e577"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication and get a reference to the service
    export const auth = getAuth(app);

    // Initialize Cloud Firestore and get a reference to the service
    export const db = getFirestore(app);
