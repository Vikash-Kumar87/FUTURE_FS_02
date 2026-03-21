require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const query = {
    source: { $exists: true },
    status: { $exists: true },
  };

  const result = await db.collection('users').deleteMany(query);

  const leadsCount = await db.collection('leads').countDocuments();
  const usersCount = await db.collection('users').countDocuments();

  console.log(`DELETED_FROM_USERS=${result.deletedCount}`);
  console.log(`LEADS_COUNT=${leadsCount}`);
  console.log(`USERS_COUNT=${usersCount}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Cleanup failed: ${error.message}`);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
