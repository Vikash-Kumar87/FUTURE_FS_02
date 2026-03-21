require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const run = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  const collectionName = (process.env.MONGODB_LEADS_COLLECTION || 'leads').trim();
  const docs = await db.collection(collectionName).find({}).toArray();

  const outDir = path.resolve(process.cwd(), 'backups');
  await fs.mkdir(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[.:]/g, '-');
  const outPath = path.join(outDir, `${collectionName}-${stamp}.json`);

  await fs.writeFile(outPath, JSON.stringify(docs, null, 2), 'utf8');

  console.log(`Exported ${docs.length} documents from '${collectionName}' to ${outPath}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Export failed: ${error.message}`);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors after a failed connect
  }
  process.exit(1);
});
