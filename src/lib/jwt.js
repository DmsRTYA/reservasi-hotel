import jwt from 'jsonwebtoken';
const AS = process.env.JWT_ACCESS_SECRET  || 'dev_access';
const RS = process.env.JWT_REFRESH_SECRET || 'dev_refresh';
export const generateAccessToken  = p => jwt.sign(p, AS, { expiresIn: '15m' });
export const generateRefreshToken = p => jwt.sign(p, RS, { expiresIn: '7d'  });
export const verifyAccessToken    = t => jwt.verify(t, AS);
export const verifyRefreshToken   = t => jwt.verify(t, RS);
