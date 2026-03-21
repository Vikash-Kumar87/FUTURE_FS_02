require('dotenv').config();
const { connectMongo } = require('./config/mongodb');

const app = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`CRM API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

start();
