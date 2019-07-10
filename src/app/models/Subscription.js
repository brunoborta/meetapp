import Sequelize, { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  // Cria as conexões de chaves estrangeiras
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.Meetup, { foreignKey: 'meetupId', as: 'meetup' });
  }
}

export default Subscription;
