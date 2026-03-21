const fs = require('fs/promises');
const path = require('path');
const Lead = require('../models/Lead');
const { bucket, isFirebaseAdminConfigured } = require('../config/firebaseAdmin');
const {
  createActivityEvent,
  dedupeTags,
  ensureLeadMeta,
  upsertLeadMeta,
  addLeadNote,
  addLeadActivity,
  addLeadFile,
  getLeadMetaMap,
} = require('../services/leadMetaService');

const ALLOWED_STATUSES = new Set(['New', 'Contacted', 'Converted']);
const ALLOWED_PRIORITIES = new Set(['Low', 'Medium', 'High']);

const normalizeLeadInput = (payload = {}) => ({
  name: typeof payload.name === 'string' ? payload.name.trim() : '',
  email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '',
  source: typeof payload.source === 'string' ? payload.source.trim() : '',
  status: typeof payload.status === 'string' ? payload.status.trim() : 'New',
  priority: typeof payload.priority === 'string' ? payload.priority.trim() : 'Medium',
  notes: typeof payload.notes === 'string' ? payload.notes.trim() : '',
  tags: dedupeTags(Array.isArray(payload.tags) ? payload.tags : []),
});

const validateLeadInput = (lead) => {
  if (!lead.name) {
    return 'Name is required';
  }

  if (!lead.email || !/^\S+@\S+\.\S+$/.test(lead.email)) {
    return 'A valid email is required';
  }

  if (!lead.source) {
    return 'Source is required';
  }

  if (!ALLOWED_STATUSES.has(lead.status)) {
    return 'Invalid status value';
  }

  if (!ALLOWED_PRIORITIES.has(lead.priority)) {
    return 'Invalid priority value';
  }

  return null;
};

const isViewerRequest = (req) => String(req.user?.role || '').toLowerCase() === 'viewer';

const ensureEditAccess = (req, res) => {
  if (isViewerRequest(req)) {
    res.status(403).json({ message: 'Viewer role is read-only' });
    return false;
  }

  return true;
};

const normalizeStoragePath = (value) => String(value || '').replace(/\\/g, '/');

const getAbsoluteStoragePath = (storagePath) => path.resolve(process.cwd(), storagePath);

const removeStoredAttachment = async (storagePath) => {
  if (!storagePath) {
    return;
  }

  try {
    await fs.unlink(getAbsoluteStoragePath(storagePath));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const mapAttachment = (attachment) => {
  if (!attachment || !attachment.storagePath) {
    return null;
  }

  return {
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    size: attachment.size,
    uploadedAt: attachment.uploadedAt,
  };
};

const mapLeadDoc = (doc) => {
  return {
    id: String(doc._id),
    userId: doc.userId,
    name: doc.name,
    email: doc.email,
    source: doc.source,
    status: doc.status,
    priority: doc.priority || 'Medium',
    notes: doc.notes || '',
    attachment: mapAttachment(doc.attachment),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
};

const mergeLeadMeta = (lead, meta) => {
  if (!meta) {
    return {
      ...lead,
      tags: [],
      notes: lead.notes ? [{ id: 'legacy', text: lead.notes, createdAt: lead.updatedAt || lead.createdAt, createdBy: 'legacy' }] : [],
      activity: [],
      files: [],
    };
  }

  const notes = Array.isArray(meta.notes) ? meta.notes : [];

  return {
    ...lead,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    notes: notes.length
      ? notes
      : lead.notes
        ? [{ id: 'legacy', text: lead.notes, createdAt: lead.updatedAt || lead.createdAt, createdBy: 'legacy' }]
        : [],
    activity: Array.isArray(meta.activity) ? meta.activity : [],
    files: Array.isArray(meta.files) ? meta.files : [],
    noteCount: notes.length,
  };
};

const createCsvContent = (leads = []) => {
  const headers = ['Name', 'Email', 'Source', 'Status', 'Priority', 'Tags', 'CreatedAt'];

  const rows = leads.map((lead) => [
    lead.name,
    lead.email,
    lead.source,
    lead.status,
    lead.priority,
    (lead.tags || []).join('|'),
    lead.createdAt || '',
  ]);

  const sanitize = (value) => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  return [headers, ...rows].map((row) => row.map(sanitize).join(',')).join('\n');
};

const uploadToFirebaseStorage = async ({ localPath, contentType, originalname, userId, leadId }) => {
  if (!isFirebaseAdminConfigured || !bucket) {
    return {
      destination: normalizeStoragePath(path.relative(process.cwd(), localPath)),
      url: null,
      provider: 'local',
    };
  }

  const safeName = String(originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  const destination = `leads/${userId}/${leadId}/${Date.now()}_${safeName}`;

  await bucket.upload(localPath, {
    destination,
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  });

  const [signedUrl] = await bucket.file(destination).getSignedUrl({
    action: 'read',
    expires: '2100-01-01',
  });

  return {
    destination,
    url: signedUrl,
    provider: 'firebase',
  };
};

const getLeads = async (req, res, next) => {
  try {
    const { status = '', search = '', priority = '', tag = '' } = req.query;
    const uid = req.user.uid;

    const docs = await Lead.find({ userId: uid }).sort({ createdAt: -1 }).lean();
    const leadIds = docs.map((doc) => String(doc._id));
    const metaMap = await getLeadMetaMap({ userId: uid, leadIds });

    const text = String(search || '').trim().toLowerCase();
    const tagFilter = String(tag || '').trim().toLowerCase();

    const leads = docs
      .map((doc) => {
        const mapped = mapLeadDoc(doc);
        const meta = metaMap.get(mapped.id);
        return mergeLeadMeta(mapped, meta);
      })
      .filter((lead) => (status ? lead.status === status : true))
      .filter((lead) => (priority ? lead.priority === priority : true))
      .filter((lead) => {
        if (!text) {
          return true;
        }

        return (
          lead.name.toLowerCase().includes(text) ||
          lead.email.toLowerCase().includes(text) ||
          lead.source.toLowerCase().includes(text)
        );
      })
      .filter((lead) => {
        if (!tagFilter) {
          return true;
        }

        return (lead.tags || []).some((item) => String(item).toLowerCase() === tagFilter);
      });

    return res.json({ data: leads });
  } catch (error) {
    return next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    if (!ensureEditAccess(req, res)) {
      return;
    }

    const payload = normalizeLeadInput(req.body);
    const validationError = validateLeadInput(payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const lead = {
      ...payload,
      userId: req.user.uid,
      attachment: null,
    };

    const doc = await Lead.create(lead);

    await ensureLeadMeta({ userId: req.user.uid, leadId: String(doc._id), seed: { tags: payload.tags } });
    await addLeadActivity({
      userId: req.user.uid,
      leadId: String(doc._id),
      event: createActivityEvent({
        type: 'created',
        message: `Lead created with status ${doc.status}`,
        createdBy: req.user.email || req.user.uid,
      }),
    });

    if (payload.notes) {
      await addLeadNote({
        userId: req.user.uid,
        leadId: String(doc._id),
        text: payload.notes,
        createdBy: req.user.email || req.user.uid,
      });

      await addLeadActivity({
        userId: req.user.uid,
        leadId: String(doc._id),
        event: createActivityEvent({
          type: 'note',
          message: 'Initial note added',
          createdBy: req.user.email || req.user.uid,
        }),
      });
    }

    return res.status(201).json({ data: mapLeadDoc(doc) });
  } catch (error) {
    return next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    if (!ensureEditAccess(req, res)) {
      return;
    }

    const { id } = req.params;
    const existingLead = await Lead.findById(id);

    if (!existingLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (existingLead.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = {};
    const allowedKeys = ['name', 'email', 'source', 'status', 'notes', 'priority'];

    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        updates[key] = key === 'email' ? String(req.body[key]).trim().toLowerCase() : String(req.body[key]).trim();
      }
    }

    const hasTagsUpdate = Array.isArray(req.body.tags);

    if (Object.keys(updates).length === 0 && !hasTagsUpdate) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const mergedLead = normalizeLeadInput({ ...existingLead, ...updates });
    const validationError = Object.keys(updates).length ? validateLeadInput(mergedLead) : null;

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const previousStatus = existingLead.status;

    if (Object.keys(updates).length) {
      Object.assign(existingLead, updates);
      await existingLead.save();
    }

    if (hasTagsUpdate) {
      await upsertLeadMeta({
        userId: req.user.uid,
        leadId: String(existingLead._id),
        updates: { tags: dedupeTags(req.body.tags) },
      });
    }

    if (updates.status && updates.status !== previousStatus) {
      await addLeadActivity({
        userId: req.user.uid,
        leadId: String(existingLead._id),
        event: createActivityEvent({
          type: 'status',
          message: `Status changed to ${updates.status}`,
          createdBy: req.user.email || req.user.uid,
          metadata: { status: updates.status },
        }),
      });
    }

    return res.json({ data: mapLeadDoc(existingLead) });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    if (!ensureEditAccess(req, res)) {
      return;
    }

    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await removeStoredAttachment(lead.attachment?.storagePath);

    await lead.deleteOne();

    return res.status(204).send();
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return next(error);
  }
};

const uploadLeadAttachment = async (req, res, next) => {
  try {
    if (!ensureEditAccess(req, res)) {
      return;
    }

    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadResult = await uploadToFirebaseStorage({
      localPath: req.file.path,
      contentType: req.file.mimetype,
      originalname: req.file.originalname,
      userId: req.user.uid,
      leadId: id,
    });

    const storagePath = normalizeStoragePath(path.relative(process.cwd(), req.file.path));

    await removeStoredAttachment(lead.attachment?.storagePath);

    lead.attachment = {
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      storagePath,
      uploadedAt: new Date(),
    };

    await lead.save();

    const fileMeta = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      storagePath: uploadResult.destination,
      url: uploadResult.url,
      provider: uploadResult.provider || 'firebase',
      uploadedAt: new Date().toISOString(),
      uploadedBy: req.user.email || req.user.uid,
    };

    await addLeadFile({ userId: req.user.uid, leadId: id, file: fileMeta });
    await addLeadActivity({
      userId: req.user.uid,
      leadId: id,
      event: createActivityEvent({
        type: 'file',
        message: `Attachment uploaded: ${req.file.originalname}`,
        createdBy: req.user.email || req.user.uid,
      }),
    });

    return res.json({ data: mapLeadDoc(lead) });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return next(error);
  }
};

const getLeadAttachment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!lead.attachment?.storagePath) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const absolutePath = getAbsoluteStoragePath(lead.attachment.storagePath);

    await fs.access(absolutePath);

    res.setHeader('Content-Type', lead.attachment.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(lead.attachment.fileName)}"`);
    return res.sendFile(absolutePath);
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (error?.code === 'ENOENT') {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    return next(error);
  }
};

const addLeadNoteById = async (req, res, next) => {
  try {
    if (!ensureEditAccess(req, res)) {
      return;
    }

    const { id } = req.params;
    const text = String(req.body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ message: 'Note text is required' });
    }

    const lead = await Lead.findById(id).lean();

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (lead.userId !== req.user.uid) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const note = await addLeadNote({
      userId: req.user.uid,
      leadId: id,
      text,
      createdBy: req.user.email || req.user.uid,
    });

    await addLeadActivity({
      userId: req.user.uid,
      leadId: id,
      event: createActivityEvent({
        type: 'note',
        message: 'Note added',
        createdBy: req.user.email || req.user.uid,
      }),
    });

    return res.status(201).json({ data: note });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(404).json({ message: 'Lead not found' });
    }

    return next(error);
  }
};

const exportLeadsCsv = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const docs = await Lead.find({ userId: uid }).sort({ createdAt: -1 }).lean();
    const leadIds = docs.map((doc) => String(doc._id));
    const metaMap = await getLeadMetaMap({ userId: uid, leadIds });
    const merged = docs.map((doc) => {
      const mapped = mapLeadDoc(doc);
      return mergeLeadMeta(mapped, metaMap.get(mapped.id));
    });

    const csv = createCsvContent(merged);
    const fileName = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  uploadLeadAttachment,
  getLeadAttachment,
  addLeadNoteById,
  exportLeadsCsv,
};
