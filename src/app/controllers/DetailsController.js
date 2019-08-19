import Meetup from '../models/Meetup';
import File from '../models/File';

class DetailsController {
  async index(req, res) {
    const { meetupId } = req.params;
    const meetup = await Meetup.findOne({
      where: {
        userId: req.userId,
        id: meetupId,
      },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'convertedName', 'url'],
        },
      ],
    });

    return res.json(meetup);
  }
}

export default new DetailsController();
