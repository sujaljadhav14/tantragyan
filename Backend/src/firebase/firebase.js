import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = require('../../service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

export const auth = getAuth();