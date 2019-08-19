import * as yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    // Validações usando o yup
    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup
        .string()
        .required()
        .email(),
      password: yup
        .string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Problemas na validação. Verifique os campos enviados',
      });
    }

    // Se usuario existe
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuario ja existe!' });
    }

    const { id, email, passwordHash } = await User.create(req.body);

    return res.json({
      User: {
        id,
        email,
        passwordHash,
      },
    });
  }

  async update(req, res) {
    const schema = yup.object().shape({
      name: yup.string(),
      email: yup.string().email(),
      oldPassword: yup.string().min(6),
      password: yup
        .string()
        .min(6)
        .when('oldPassword', (oldPassword, password) => {
          return oldPassword ? password.required() : password;
        }),
      confirmPassword: yup
        .string()
        .min(6)
        .when('password', (password, confirmPassword) => {
          return password
            ? confirmPassword.required().oneOf([yup.ref('password')])
            : confirmPassword;
        }),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Problemas na validação. Verifique os campos enviados',
      });
    }

    const { email, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Ja existe usuario com este email' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
