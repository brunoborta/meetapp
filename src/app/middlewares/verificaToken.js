import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../configs/auth';

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não existe' });
  }
  const [, token] = authorization.split(' ');

  try {
    const decodedToken = await promisify(jwt.verify)(token, authConfig.secret);

    req.userId = decodedToken.id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalido' });
  }
};
