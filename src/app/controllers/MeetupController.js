import { parseISO, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as yup from 'yup';

import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupController {
  async store(req, res) {
    // Validações usando o yup
    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().required(),
      location: yup.string().required(),
      date: yup.date().required(),
      userId: yup.number().required(),
      bannerId: yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Problemas na validação. Verifique os campos enviados',
      });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(401).json({
        error: 'Cadastrar Meetups com datas passadas não é permitido',
      });
    }

    const meetup = await Meetup.create(req.body);

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = yup.object().shape({
      name: yup.string(),
      description: yup.string(),
      location: yup.string(),
      date: yup.date(),
      userId: yup.number(),
      bannerId: yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Problemas na validação. Verifique os campos enviados',
      });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup não encontrada' });
    }

    if (meetup.userId !== req.userId) {
      return res.status(401).json({
        error: 'Você deve ser o organizador para alterar uma meetup',
      });
    }

    if (meetup.past) {
      return res.status(400).json({
        error: 'Você só pode alterar uma meetup que ainda nao aconteceu',
      });
    }

    const { name, description, date, location } = await meetup.update(req.body);

    return res.json({
      name,
      description,
      date,
      location,
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (meetup.userId !== req.userId) {
      return res.status(401).json({
        error: 'Você deve ser o organizador para cancelar uma meetup',
      });
    }

    if (meetup.past) {
      return res.status(400).json({
        error: 'Não é possível cancelar uma meetup que já aconteceu',
      });
    }

    await meetup.destroy();
    return res.json();
  }

  async index(req, res) {
    const { page = 1, date } = req.query;
    const ITEMS_PER_PAGE = 10;
    const offset = ITEMS_PER_PAGE * page - ITEMS_PER_PAGE;

    const where = {};
    if (date) {
      const searchedDate = parseISO(date);
      where.date = {
        [Op.between]: [startOfDay(searchedDate), endOfDay(searchedDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: ITEMS_PER_PAGE,
      offset,
    });
    return res.json(meetups);
  }
}

export default new MeetupController();
