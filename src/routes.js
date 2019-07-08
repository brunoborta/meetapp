import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import verificaToken from './app/middlewares/verificaToken';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(verificaToken);

routes.put('/users', UserController.update);

export default routes;
