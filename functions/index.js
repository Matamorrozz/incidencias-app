// functions/index.js

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
  // Verify that the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated.",
    );
  }

  // Extract data
  const {
    email,
    password,
    nombreCompleto,
    apellidoPaterno,
    apellidoMaterno,
    areaTrabajo,
  } = data;

  try {
    // Create the user without signing in
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${nombreCompleto} ${apellidoPaterno} ${apellidoMaterno}`,
    });

    // Save additional user data to Firestore
    await admin
        .firestore()
        .collection("usuarios")
        .doc(userRecord.uid)
        .set({
          nombre: nombreCompleto,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          area: areaTrabajo,
          correo: email,
          fecha_creado: admin.firestore.FieldValue.serverTimestamp(),
        });

    return {uid: userRecord.uid};
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
