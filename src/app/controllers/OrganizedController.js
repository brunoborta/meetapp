import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizedController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        userId: req.userId,
        date: {
          [Op.gt]: new Date(),
        },
      },
      attributes: ['name', 'description', 'date', 'location'],
      order: ['date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'convertedName', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }
}

export default new OrganizedController();
