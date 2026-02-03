const cluster = require('cluster');
const os = require('os');
const { logger } = require('./utils/logger');

/**
 * Cluster management for production
 */
class ClusterManager {
  constructor() {
    this.numCPUs = os.cpus().length;
    this.workers = [];
    this.isMaster = cluster.isMaster;
    this.workerRestartDelay = 1000; // 1 second
    this.maxRestarts = 10;
    this.restartCount = {};
  }

  /**
   * Start cluster
   */
  start() {
    if (this.isMaster) {
      this.startMaster();
    } else {
      this.startWorker();
    }
  }

  /**
   * Master process
   */
  startMaster() {
    logger.info(`Master ${process.pid} is running`);

    // Fork workers based on CPU count
    const numWorkers = process.env.WORKERS ? parseInt(process.env.WORKERS) : this.numCPUs;
    
    logger.info(`Starting ${numWorkers} workers`);

    for (let i = 0; i < numWorkers; i++) {
      this.forkWorker(i);
    }

    // Handle worker events
    this.setupWorkerEvents();

    // Handle master events
    this.setupMasterEvents();
  }

  /**
   * Fork a new worker
   */
  forkWorker(index) {
    const worker = cluster.fork({ WORKER_ID: index });
    
    this.workers.push(worker);
    this.restartCount[worker.id] = 0;

    logger.info(`Worker ${worker.id} (index: ${index}) started with PID ${worker.process.pid}`);

    return worker;
  }

  /**
   * Setup worker event handlers
   */
  setupWorkerEvents() {
    cluster.on('fork', (worker) => {
      logger.info(`Worker ${worker.id} forked`);
    });

    cluster.on('online', (worker) => {
      logger.info(`Worker ${worker.id} is online`);
    });

    cluster.on('listening', (worker, address) => {
      logger.info(`Worker ${worker.id} listening on ${address.address}:${address.port}`);
    });

    cluster.on('disconnect', (worker) => {
      logger.warn(`Worker ${worker.id} disconnected`);
    });

    cluster.on('exit', (worker, code, signal) => {
      this.handleWorkerExit(worker, code, signal);
    });

    cluster.on('error', (worker, error) => {
      logger.error(`Worker ${worker.id} error:`, error);
    });
  }

  /**
   * Setup master event handlers
   */
  setupMasterEvents() {
    // Handle master process signals
    process.on('SIGTERM', () => {
      logger.info('Master received SIGTERM');
      this.shutdownWorkers();
    });

    process.on('SIGINT', () => {
      logger.info('Master received SIGINT');
      this.shutdownWorkers();
    });

    process.on('SIGUSR2', () => {
      logger.info('Master received SIGUSR2 (restart)');
      this.restartWorkers();
    });

    // Handle uncaught exceptions in master
    process.on('uncaughtException', (error) => {
      logger.error('Master uncaught exception:', error);
      this.shutdownWorkers();
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Master unhandled rejection:', { reason, promise });
    });
  }

  /**
   * Handle worker exit
   */
  handleWorkerExit(worker, code, signal) {
    logger.warn(`Worker ${worker.id} died (code: ${code}, signal: ${signal})`);

    // Remove worker from list
    this.workers = this.workers.filter(w => w.id !== worker.id);

    // Check if worker should be restarted
    if (this.shouldRestartWorker(worker)) {
      logger.info(`Restarting worker ${worker.id}`);
      
      setTimeout(() => {
        this.forkWorker(worker.id);
      }, this.workerRestartDelay);
    } else {
      logger.error(`Worker ${worker.id} exceeded max restarts, not restarting`);
    }
  }

  /**
   * Check if worker should be restarted
   */
  shouldRestartWorker(worker) {
    const restartCount = this.restartCount[worker.id] || 0;
    
    // Don't restart if exited normally
    if (worker.exitedAfterDisconnect) {
      return false;
    }

    // Don't restart if killed by master
    if (worker.process.killed) {
      return false;
    }

    // Check restart count
    return restartCount < this.maxRestarts;
  }

  /**
   * Shutdown all workers gracefully
   */
  async shutdownWorkers() {
    logger.info('Shutting down all workers');

    // Tell workers to shutdown
    this.workers.forEach(worker => {
      worker.send('shutdown');
    });

    // Wait for workers to exit
    const shutdownTimeout = setTimeout(() => {
      logger.warn('Shutdown timeout, force killing workers');
      this.killWorkers();
    }, 5000);

    // Wait for all workers to exit
    await new Promise((resolve) => {
      const checkWorkers = () => {
        if (this.workers.length === 0) {
          clearTimeout(shutdownTimeout);
          resolve();
        } else {
          setTimeout(checkWorkers, 100);
        }
      };
      checkWorkers();
    });

    logger.info('All workers shut down');
    process.exit(0);
  }

  /**
   * Force kill all workers
   */
  killWorkers() {
    this.workers.forEach(worker => {
      worker.kill('SIGKILL');
    });
  }

  /**
   * Restart all workers (hot reload)
   */
  async restartWorkers() {
    logger.info('Restarting all workers');

    // Fork new workers
    const newWorkers = [];
    this.workers.forEach(worker => {
      const newWorker = this.forkWorker(worker.id);
      newWorkers.push(newWorker);
      
      // Tell old worker to shutdown
      worker.send('shutdown');
    });

    // Wait for new workers to be ready
    await new Promise((resolve) => {
      let readyCount = 0;
      const checkReady = () => {
        if (readyCount === newWorkers.length) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };

      newWorkers.forEach(worker => {
        worker.on('listening', () => {
          readyCount++;
        });
      });

      checkReady();
    });

    logger.info('All workers restarted successfully');
  }

  /**
   * Get worker statistics
   */
  getWorkerStats() {
    return {
      totalWorkers: this.workers.length,
      cpuCount: this.numCPUs,
      masterPid: process.pid,
      workers: this.workers.map(worker => ({
        id: worker.id,
        pid: worker.process.pid,
        memory: worker.process.memoryUsage(),
        uptime: worker.process.uptime(),
        restartCount: this.restartCount[worker.id] || 0
      }))
    };
  }

  /**
   * Worker process
   */
  startWorker() {
    const workerId = process.env.WORKER_ID || 0;
    
    logger.info(`Worker ${process.pid} (index: ${workerId}) started`);

    // Handle worker messages
    process.on('message', (message) => {
      if (message === 'shutdown') {
        logger.info(`Worker ${process.pid} received shutdown signal`);
        process.exit(0);
      }
    });

    // Start the application
    require('./server');
  }
}

// Start cluster if this file is run directly
if (require.main === module) {
  const clusterManager = new ClusterManager();
  clusterManager.start();
}

module.exports = ClusterManager;
