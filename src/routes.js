import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import OrganizedController from './app/controllers/OrganizedController';
import SubscriptionController from './app/controllers/SubscriptionController';

import verificaToken from './app/middlewares/verificaToken';

import multerConfig from './configs/multer';

const upload = multer(multerConfig);

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(verificaToken);

routes.get('/organized', OrganizedController.index);
routes.get('/subscriptions', SubscriptionController.index);

routes.post('/files', upload.single('file'), FileController.store);
routes.post('/meetups', MeetupController.store);
routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);

routes.put('/users', UserController.update);
routes.put('/meetups/:id', MeetupController.update);

routes.delete('/meetups/:meetupId', MeetupController.delete);

export default routes;
