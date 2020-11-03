import { Router } from 'express';
import Bot from './bot';

const botRouter = Router();
const v1Router = Router();

botRouter.post('/search', Bot.googleSearch);

v1Router.use('/api', botRouter);

export default v1Router;