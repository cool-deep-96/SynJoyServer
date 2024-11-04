import express from 'express';

import { validateJwtToken } from '../utils/encryption/jwt';
import { getRefreshToken } from '../controllers/refresh_token';

export const tokenRoutes = express.Router();


tokenRoutes.route('/refresh').get(validateJwtToken, getRefreshToken);





