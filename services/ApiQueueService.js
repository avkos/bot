const MAX_QUERY_PER_SECOND = 4;

class ApiQueueService {
  constructor() {
    this.queue = [];
    this.executeHistory = [];
    this.isRun = false;
  }

  executeInQueue(method, ...data) {
    return new Promise((resolve, reject) => {
      this.addToQueue(method, data, ({ err, data }) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  addToQueue(method, data, cb) {
    this.queue.push({ method, data, cb });
    this.run();
  }

  run(force = false) {
    if (this.isRun && !force) {
      return;
    }
    this.isRun = true;
    if (this.isBusy()) {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        this.run(true);
      }, 100);
      return;
    }
    const q = this.getFirst();
    if (!q) {
      this.isRun = false;
      return;
    }
    this.execute(q).finally(() => {
      this.removeFirst();
      if (this.queue.length === 0) {
        this.isRun = false;
        return;
      }
      this.run(true);
    });
  }

  getFirst() {
    return this.queue && this.queue[0];
  }

  removeFirst() {
    this.queue.splice(0, 1);
  }

  isBusy() {
    return this.getCountQueryInLastSecond() >= MAX_QUERY_PER_SECOND;
  }

  getCountQueryInLastSecond() {
    const currentTime = +new Date();
    this.executeHistory = this.executeHistory.filter((d) => d.time > (currentTime - 1000));
    return this.executeHistory.length;
  }

  execute(q) {
    this.executeHistory.push({ time: +new Date() });
    return q.method(...(q.data || [])).then((data) => {
      q.cb({ data });
    }).catch((err) => {
      q.cb({ err });
    });

  }
}

module.exports = new ApiQueueService();
