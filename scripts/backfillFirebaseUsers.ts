// @ts-nocheck
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { initializeApp, cert, getApps, AppOptions } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv();

type FirebaseUserRecord = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
};

function loadServiceAccount(): AppOptions["credential"] {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const filePath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return cert(JSON.parse(readFileSync(filePath, "utf8")));
  }

  throw new Error(
    "Missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
}

async function listFirebaseUsers(): Promise<FirebaseUserRecord[]> {
  if (!getApps().length) {
    initializeApp({
      credential: loadServiceAccount(),
    });
  }

  const auth = getAuth();
  const users: FirebaseUserRecord[] = [];
  let nextPageToken: string | undefined;

  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const user of result.users) {
      users.push({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  return users;
}

function createConvexUser(user: FirebaseUserRecord) {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing Convex URL. Set VITE_CONVEX_URL or CONVEX_URL.");
  }

  const client = new ConvexHttpClient(convexUrl);

  return client.mutation(api.users.createUser, {
    firebaseUid: user.uid,
    email: user.email ?? undefined,
    displayName: user.displayName ?? undefined,
    photoURL: user.photoURL ?? undefined,
  });
}

async function main() {
  const users = await listFirebaseUsers();

  if (users.length === 0) {
    console.log("No Firebase Auth users found.");
    return;
  }

  let synced = 0;
  for (const user of users) {
    await createConvexUser(user);
    synced += 1;
  }

  console.log(`Backfilled ${synced} Firebase Auth users into Convex.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
