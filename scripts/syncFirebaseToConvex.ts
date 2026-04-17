// @ts-nocheck
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { ConvexHttpClient } from "convex/browser";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv();

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const filePath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    return cert(JSON.parse(readFileSync(filePath, "utf8")));
  }

  throw new Error(
    "Missing Firebase admin credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.",
  );
}

function getAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: loadServiceAccount(),
    });
  }

  return getApps()[0];
}

function getFirebaseDb() {
  const app = getAdminApp();
  const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;
  return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

function getConvexClient() {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

  if (!convexUrl) {
    throw new Error("Missing Convex URL. Set VITE_CONVEX_URL or CONVEX_URL.");
  }

  return new ConvexHttpClient(convexUrl);
}

function asMillis(value) {
  if (!value) return undefined;
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?._seconds === "number") return value._seconds * 1000;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function normalizeUserRole(role) {
  if (role === "creator" || role === "admin") return role;
  return "reader";
}

function normalizeSeriesType(type) {
  return type === "novel" ? "novel" : "webtoon";
}

function normalizeSeriesStatus(status) {
  if (status === "completed" || status === "hiatus") return status;
  return "ongoing";
}

function normalizeCampaignStatus(status) {
  if (status === "active" || status === "paused" || status === "ended") return status;
  return "scheduled";
}

function normalizeNotificationType(type) {
  if (type === "comment" || type === "like") return type;
  if (type === "update") return "new_chapter";
  return "system";
}

function notificationTitle(data) {
  if (typeof data.title === "string" && data.title.trim()) return data.title;
  switch (data.type) {
    case "comment":
      return "New comment";
    case "like":
      return "New like";
    case "update":
      return "Series update";
    case "milestone":
      return "Milestone reached";
    default:
      return "Notification";
  }
}

async function syncUsers(client, db) {
  const auth = getAuth(getAdminApp());
  const authUsers = [];
  let nextPageToken;

  do {
    const result = await auth.listUsers(1000, nextPageToken);
    authUsers.push(...result.users);
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  const authByUid = new Map(authUsers.map((user) => [user.uid, user]));
  const userSnapshot = await db.collection("users").get();
  const firestoreByUid = new Map(userSnapshot.docs.map((doc) => [doc.id, doc.data()]));
  const allUids = new Set([...authByUid.keys(), ...firestoreByUid.keys()]);

  let synced = 0;
  for (const uid of allUids) {
    const authUser = authByUid.get(uid);
    const firestoreUser = firestoreByUid.get(uid) ?? {};
    await client.mutation("firebaseSync:upsertUserFromFirebase", {
      firebaseUid: uid,
      email: firestoreUser.email ?? authUser?.email ?? undefined,
      displayName: firestoreUser.displayName ?? authUser?.displayName ?? undefined,
      photoURL: firestoreUser.photoURL ?? authUser?.photoURL ?? undefined,
      firebaseCreatedAt: asMillis(authUser?.metadata?.creationTime),
      firebaseLastSignInAt: asMillis(authUser?.metadata?.lastSignInTime),
      role: normalizeUserRole(firestoreUser.role),
      isPremium: firestoreUser.isPremium ?? undefined,
      bio: firestoreUser.bio ?? undefined,
      genres: Array.isArray(firestoreUser.genres) ? firestoreUser.genres : undefined,
      dropSomethingLink: firestoreUser.dropSomethingLink ?? undefined,
      birthMonth: firestoreUser.birthMonth ?? undefined,
      birthDay: typeof firestoreUser.birthDay === "number" ? firestoreUser.birthDay : undefined,
      birthYear: typeof firestoreUser.birthYear === "number" ? firestoreUser.birthYear : undefined,
      pronouns: firestoreUser.pronouns ?? undefined,
      marketingEmails: typeof firestoreUser.marketingEmails === "boolean" ? firestoreUser.marketingEmails : undefined,
      acceptedTerms: typeof firestoreUser.acceptedTerms === "boolean" ? firestoreUser.acceptedTerms : undefined,
      onboardingCompleted: typeof firestoreUser.onboardingCompleted === "boolean" ? firestoreUser.onboardingCompleted : undefined,
      coins: typeof firestoreUser.coins === "number" ? firestoreUser.coins : undefined,
    });
    synced += 1;
  }

  return synced;
}

async function syncSeries(client, db) {
  const snapshot = await db.collection("series").get();
  let synced = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const createdAt = asMillis(data.createdAt);
    const creatorFirebaseUid =
      typeof data.creatorId === "string" && data.creatorId.trim()
        ? data.creatorId
        : `firebase-series-creator:${doc.id}`;
    const genre =
      typeof data.genre === "string" && data.genre.trim()
        ? data.genre
        : Array.isArray(data.tags) && typeof data.tags[0] === "string"
          ? data.tags[0]
          : "General";
    await client.mutation("firebaseSync:upsertSeriesFromFirebase", {
      firebaseId: doc.id,
      creatorFirebaseUid,
      creatorName: data.creatorName ?? "Unknown creator",
      title: data.title ?? "Untitled series",
      type: normalizeSeriesType(data.type),
      genre,
      emotion: data.emotion ?? undefined,
      summary: data.summary ?? data.description ?? undefined,
      coverImageUrl: data.coverImage ?? data.coverImageUrl ?? undefined,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      views: data.views ?? data.viewCount ?? 0,
      likes: data.likes ?? 0,
      isOriginal: Boolean(data.isOriginal),
      isNew: typeof data.isNew === "boolean" ? data.isNew : Boolean(createdAt && Date.now() - createdAt < 1000 * 60 * 60 * 24 * 30),
      releaseDay: data.releaseDay ?? undefined,
      status: normalizeSeriesStatus(data.status),
      subscriberCount: typeof data.subscriberCount === "number" ? data.subscriberCount : undefined,
    });
    synced += 1;
  }

  return synced;
}

async function syncChapters(client, db) {
  const seriesSnapshot = await db.collection("series").get();
  let synced = 0;

  for (const seriesDoc of seriesSnapshot.docs) {
    const chaptersSnapshot = await seriesDoc.ref.collection("chapters").get();
    for (const chapterDoc of chaptersSnapshot.docs) {
      const data = chapterDoc.data();
      const pageUrls = Array.isArray(data.pages) ? data.pages.filter((item) => typeof item === "string") : undefined;
      await client.mutation("firebaseSync:upsertChapterFromFirebase", {
        firebaseId: chapterDoc.id,
        firebaseSeriesId: seriesDoc.id,
        chapterNumber: data.chapterNumber ?? 1,
        title: data.title ?? "Untitled chapter",
        content: typeof data.content === "string" ? data.content : undefined,
        pageUrls,
        publishedAt: asMillis(data.publishDate) ?? asMillis(data.createdAt) ?? Date.now(),
        isLocked: Boolean(data.isPremium),
        coinCost: typeof data.coinCost === "number" ? data.coinCost : 0,
      });
      synced += 1;
    }
  }

  return synced;
}

async function syncComments(client, db) {
  const snapshot = await db.collection("comments").get();
  let synced = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const firebaseUserId =
      typeof data.userId === "string" && data.userId.trim()
        ? data.userId
        : `firebase-comment-user:${doc.id}`;
    await client.mutation("firebaseSync:upsertCommentFromFirebase", {
      firebaseId: doc.id,
      firebaseUserId,
      userName: data.userName ?? "Anonymous",
      userPhoto: data.userPhoto ?? undefined,
      text: data.text ?? "",
      likes: typeof data.likes === "number" ? data.likes : 0,
      createdAt: asMillis(data.createdAt) ?? Date.now(),
      firebaseSeriesId: data.type === "series" ? data.targetId : undefined,
      firebaseChapterId: data.type === "chapter" ? data.targetId : undefined,
    });
    synced += 1;
  }

  return synced;
}

async function syncCampaigns(client, db) {
  const snapshot = await db.collection("ads").get();
  let synced = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    await client.mutation("firebaseSync:upsertCampaignFromFirebase", {
      firebaseId: doc.id,
      title: data.title ?? "Untitled campaign",
      imageUrl: data.imageUrl ?? undefined,
      targetUrl: data.targetUrl ?? undefined,
      adType: data.type ?? undefined,
      status: normalizeCampaignStatus(data.status),
      budget: typeof data.budget === "number" ? data.budget : 0,
      spent: typeof data.spent === "number" ? data.spent : 0,
      views: typeof data.impressions === "number" ? data.impressions : (typeof data.views === "number" ? data.views : 0),
      clicks: typeof data.clicks === "number" ? data.clicks : 0,
      startDate: asMillis(data.createdAt) ?? Date.now(),
      endDate: asMillis(data.endDate),
      creatorFirebaseUid: data.creatorId ?? undefined,
    });
    synced += 1;
  }

  return synced;
}

async function syncNotifications(client, db) {
  const snapshot = await db.collection("notifications").get();
  let synced = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const firebaseUserId =
      typeof data.userId === "string" && data.userId.trim()
        ? data.userId
        : `firebase-notification-user:${doc.id}`;
    await client.mutation("firebaseSync:upsertNotificationFromFirebase", {
      firebaseId: doc.id,
      firebaseUserId,
      type: normalizeNotificationType(data.type),
      title: notificationTitle(data),
      message: data.message ?? notificationTitle(data),
      isRead: Boolean(data.read),
      createdAt: asMillis(data.createdAt) ?? Date.now(),
      firebaseSeriesId: data.seriesId ?? undefined,
    });
    synced += 1;
  }

  return synced;
}

async function main() {
  const db = getFirebaseDb();
  const client = getConvexClient();

  const users = await syncUsers(client, db);
  const series = await syncSeries(client, db);
  const chapters = await syncChapters(client, db);
  const comments = await syncComments(client, db);
  const campaigns = await syncCampaigns(client, db);
  const notifications = await syncNotifications(client, db);

  console.log(
    `Synced Firebase to Convex: users=${users}, series=${series}, chapters=${chapters}, comments=${comments}, campaigns=${campaigns}, notifications=${notifications}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
