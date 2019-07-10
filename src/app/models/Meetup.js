import Sequelize, { Model } from 'sequelize';
import { isBefore } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING,
        date: Sequelize.DATE,
        location: Sequelize.STRING,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }

  // Cria as conexões de chaves estrangeiras
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'organizer' });
    this.belongsTo(models.File, { foreignKey: 'bannerId', as: 'banner' });
  }
}

export default Meetup;
