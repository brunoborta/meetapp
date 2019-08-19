import jwt from 'jsonwebtoken';
import * as yup from 'yup';

import User from '../models/User';
import authConfig from '../../configs/auth';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    // Validações usando o yup
    const schema = yup.object().shape({
      email: yup
        .string()
        .required()
        .email(),
      password: yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({
        error: 'Problemas na validação. Verifique os campos enviados',
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({
        error: 'Usuario Inválido',
      });
    }

    const { id, name } = user;

    const token = jwt.sign({ id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token,
    });
  }
}

export default new SessionController();
