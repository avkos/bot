class AsyncQueue {
  constructor(options = {}) {
    const { log, error } = options;
    this.log = log || console.log;
    this.error = error || console.error;
    this.queue = [];
    this.isRunning = false;
  }

  addToQueue(func, data) {
    this.queue.push({ func, data });
  }

  emitInQueue = (func, data) => {
    this.addToQueue(func, data);
    this.runQueue();
  };

  runQueue() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.runNext().catch((e) => this.error('runQueue error', e));
  }

  async runNext() {
    if (this.queue.length === 0) {
      this.isRunning = false;
      return;
    }
    const { func, data } = this.queue.splice(0, 1)[0];
    if (typeof func === 'function') {
      await func(data);
    } else {
      this.log('function in queue not found', { func, data });
    }
    await this.runNext();
  }
}

module.exports = AsyncQueue;
