import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        originalName: Sequelize.STRING,
        convertedName: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.convertedName}`;
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default File;
