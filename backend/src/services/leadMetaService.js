const { db, isFirebaseAdminConfigured } = require('../config/firebaseAdmin');

const LEAD_META_COLLECTION = 'lead_meta';

const asIsoDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const normalizeTag = (value) => String(value || '').trim();

const dedupeTags = (tags = []) => {
  const seen = new Set();
  const result = [];

  for (const rawTag of tags) {
    const tag = normalizeTag(rawTag);

    if (!tag) {
      continue;
    }

    const key = tag.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(tag);
  }

  return result;
};

const getLeadMetaDocId = (userId, leadId) => `${userId}__${leadId}`;

const getLeadMetaRef = (userId, leadId) => {
  if (!isFirebaseAdminConfigured || !db) {
    return null;
  }

  return db.collection(LEAD_META_COLLECTION).doc(getLeadMetaDocId(userId, leadId));
};

const createActivityEvent = ({ type, message, createdBy, metadata = {} }) => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
  type,
  message,
  createdBy: String(createdBy || 'system'),
  createdAt: asIsoDate(),
  metadata,
});

const getDefaultMeta = ({ userId, leadId }) => ({
  userId,
  leadId,
  tags: [],
  notes: [],
  files: [],
  activity: [],
  createdAt: asIsoDate(),
  updatedAt: asIsoDate(),
});

const sanitizeMeta = (data = {}) => ({
  tags: dedupeTags(Array.isArray(data.tags) ? data.tags : []),
  notes: Array.isArray(data.notes) ? data.notes : [],
  files: Array.isArray(data.files) ? data.files : [],
  activity: Array.isArray(data.activity) ? data.activity : [],
});

const ensureLeadMeta = async ({ userId, leadId, seed = {} }) => {
  const ref = getLeadMetaRef(userId, leadId);

  if (!ref) {
    return getDefaultMeta({ userId, leadId });
  }

  const snapshot = await ref.get();

  if (!snapshot.exists) {
    const payload = {
      ...getDefaultMeta({ userId, leadId }),
      ...seed,
      tags: dedupeTags(seed.tags || []),
      updatedAt: asIsoDate(),
    };

    await ref.set(payload, { merge: true });
    return payload;
  }

  const data = snapshot.data() || {};

  return {
    ...getDefaultMeta({ userId, leadId }),
    ...data,
    ...sanitizeMeta(data),
  };
};

const upsertLeadMeta = async ({ userId, leadId, updates = {} }) => {
  const ref = getLeadMetaRef(userId, leadId);

  if (!ref) {
    return null;
  }

  const payload = {
    ...updates,
    updatedAt: asIsoDate(),
  };

  if (payload.tags) {
    payload.tags = dedupeTags(payload.tags);
  }

  await ref.set(payload, { merge: true });

  const snapshot = await ref.get();
  return snapshot.data() || null;
};

const addLeadNote = async ({ userId, leadId, text, createdBy }) => {
  const meta = await ensureLeadMeta({ userId, leadId });

  const note = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    text: String(text || '').trim(),
    createdAt: asIsoDate(),
    createdBy: String(createdBy || 'unknown'),
  };

  const notes = [...meta.notes, note];

  await upsertLeadMeta({ userId, leadId, updates: { notes } });

  return note;
};

const addLeadActivity = async ({ userId, leadId, event }) => {
  const meta = await ensureLeadMeta({ userId, leadId });
  const activity = [...meta.activity, event];

  await upsertLeadMeta({ userId, leadId, updates: { activity } });

  return event;
};

const addLeadFile = async ({ userId, leadId, file }) => {
  const meta = await ensureLeadMeta({ userId, leadId });
  const files = [...meta.files, file];

  await upsertLeadMeta({ userId, leadId, updates: { files } });

  return file;
};

const getLeadMetaMap = async ({ userId, leadIds = [] }) => {
  if (!isFirebaseAdminConfigured || !db || !leadIds.length) {
    return new Map();
  }

  const refs = leadIds.map((leadId) => getLeadMetaRef(userId, leadId)).filter(Boolean);

  if (!refs.length) {
    return new Map();
  }

  const snapshots = await db.getAll(...refs);
  const map = new Map();

  snapshots.forEach((snapshot) => {
    if (!snapshot.exists) {
      return;
    }

    const data = snapshot.data() || {};
    const key = String(data.leadId || '').trim();

    if (!key) {
      return;
    }

    map.set(key, {
      ...getDefaultMeta({ userId, leadId: key }),
      ...data,
      ...sanitizeMeta(data),
    });
  });

  return map;
};

module.exports = {
  createActivityEvent,
  dedupeTags,
  ensureLeadMeta,
  upsertLeadMeta,
  addLeadNote,
  addLeadActivity,
  addLeadFile,
  getLeadMetaMap,
};
