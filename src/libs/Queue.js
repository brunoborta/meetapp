import Bee from 'bee-queue';

import SubscriptionMail from '../app/jobs/SubscriptionMail';

import redisConfig from '../configs/redis';

const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  // Cria filas de background jobs. Cada fila tem uma instancia do Bee
  // para aquela fila (com a key) e o handler daquele job
  init() {
    jobs.forEach(job => {
      this.queues[job.key] = {
        bee: new Bee(job.key, {
          redis: redisConfig,
        }),
        handle: job.handle,
      };
    });
  }

  // Adiciona um job à fila, passando o tipo de job e as informações
  // que serão passados ao handler
  add(jobKey, data) {
    return this.queues[jobKey].bee.createJob(data).save();
  }

  // Processa os jobs que foram criados por meio do metodo add
  process() {
    Object.values(this.queues).forEach(queue => {
      const { bee, handle } = queue;
      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`${job.queue.name} FAILED`, err);
  }
}

export default new Queue();
