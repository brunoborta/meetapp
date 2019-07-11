import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

import Queue from '../../libs/Queue';

import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscriptionController {
  async store(req, res) {
    const { meetupId } = req.params;

    const meetup = await Meetup.findByPk(meetupId);

    if (!meetup) {
      return res.status(400).json({ error: 'Esta meetup não existe' });
    }

    if (meetup.userId === req.userId) {
      return res.status(401).json({
        error: 'Não é possível se inscrever em uma meetup que você organiza',
      });
    }

    if (meetup.past) {
      return res.status(401).json({
        error: 'Não é possível se inscrever em uma meetup que já aconteceu',
      });
    }

    const isSubscribed = await Subscription.findOne({
      where: {
        meetupId,
        userId: req.userId,
      },
    });

    if (isSubscribed) {
      return res.status(401).json({
        error: 'Você já está inscrito nesta meetup',
      });
    }

    const isSubscribedSameTime = await Subscription.findOne({
      where: {
        userId: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (isSubscribedSameTime) {
      return res.status(401).json({
        error:
          'Você não pode se inscrever em duas meetups marcadas para a mesma hora',
      });
    }
    const subscription = await Subscription.create({
      date: new Date(),
      userId: req.userId,
      meetupId,
    });

    // Envia Email
    const user = await User.findOne({ where: { id: req.userId } });
    await Queue.add(SubscriptionMail.key, { user, meetup });

    return res.json(subscription);
  }

  async index(req, res) {
    const meetups = await Subscription.findAll({
      where: {
        userId: req.userId,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      include: [
        {
          model: Meetup,
          as: 'meetup',
          attributes: ['id', 'name', 'description', 'date', 'location'],
          where: {
            date: {
              [Op.gt]: new Date(),
            },
          },
          include: [
            {
              model: User,
              as: 'organizer',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new SubscriptionController();
