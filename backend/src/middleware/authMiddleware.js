const { createRemoteJWKSet, jwtVerify } = require('jose');

const jwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

const getFirebaseProjectId = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!projectId || !projectId.trim()) {
    return null;
  }

  return projectId.trim();
};

const verifyFirebaseToken = async (token) => {
  const projectId = getFirebaseProjectId();

  if (!projectId) {
    const error = new Error('FIREBASE_PROJECT_ID is missing in backend/.env');
    error.statusCode = 500;
    throw error;
  }

  const issuer = `https://securetoken.google.com/${projectId}`;

  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: projectId,
    algorithms: ['RS256'],
  });

  const uid = String(payload.user_id || payload.sub || '');

  if (!uid) {
    throw new Error('Unauthorized: Invalid token payload');
  }

  return {
    ...payload,
    uid,
  };
};

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Missing access token' });
    }

    const decoded = await verifyFirebaseToken(token);
    req.user = decoded;

    return next();
  } catch (error) {
    if (error.statusCode === 500) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(401).json({ message: 'Unauthorized: Invalid access token' });
  }
};

module.exports = {
  authenticate,
};
