// ── IndexedDB file storage for delivered order files ──────────────────────────
// Stores actual file Blobs keyed by "orderId::fileName".
// Much larger capacity than localStorage — safe for images, PDFs, videos, ZIPs.

const DB_NAME  = "tll_files_db";
const DB_STORE = "order_files";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(DB_STORE);
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

export async function storeFile(orderId, fileName, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(blob, `${orderId}::${fileName}`);
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}

export async function getFile(orderId, fileName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(`${orderId}::${fileName}`);
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror   = (e) => reject(e.target.error);
  });
}
