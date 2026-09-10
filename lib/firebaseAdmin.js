import admin from 'firebase-admin';

function initFirebase() {
  if (admin.apps.length) return admin;

  let serviceAccount = null;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/"/g, '');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail) {
    serviceAccount = {
      projectId,
      clientEmail,
      privateKey
    };
  }

  const databaseURL = process.env.FIREBASE_DATABASE_URL || "https://strukmaker-3327d110-default-rtdb.asia-southeast1.firebasedatabase.app";

  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL
      });
    } catch (err) {
      console.error("[FIREBASE INIT ERROR]:", err.message);
    }
  }

  return admin;
}

export function getDb() {
  const app = initFirebase();
  if (app.apps.length) {
    return app.database();
  }
  return null;
}

export async function getProductsFromDb() {
  const db = getDb();
  if (!db) return {};
  try {
    const snap = await db.ref('products').once('value');
    return snap.exists() ? snap.val() : {};
  } catch (err) {
    console.error("[DB PRODUCTS ERROR]:", err.message);
    return {};
  }
}

export async function getProductById(appId) {
  const db = getDb();
  if (!db || !appId) return null;
  try {
    const snap = await db.ref(`products/${appId}`).once('value');
    return snap.exists() ? snap.val() : null;
  } catch (err) {
    console.error("[DB PRODUCT GET ERROR]:", err.message);
    return null;
  }
}

export async function getLicenseByKey(key) {
  const db = getDb();
  if (!db || !key) return null;
  try {
    const snap = await db.ref(`licenses/${key}`).once('value');
    return snap.exists() ? snap.val() : null;
  } catch (err) {
    console.error("[DB LICENSE GET ERROR]:", err.message);
    return null;
  }
}
