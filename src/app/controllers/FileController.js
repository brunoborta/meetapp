import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname: originalName, filename: convertedName } = req.file;
    const file = await File.create({
      originalName,
      convertedName,
    });
    return res.json(file);
  }
}

export default new FileController();
