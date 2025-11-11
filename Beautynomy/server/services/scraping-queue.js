/**
 * In-Memory Job Queue for Scraping Agent
 * Manages scraping jobs with priority, retry, and concurrency control
 */

class ScrapingQueue {
  constructor(options = {}) {
    this.jobs = [];
    this.processing = new Map(); // jobId -> job
    this.completed = [];
    this.failed = [];

    this.maxConcurrent = options.maxConcurrent || 3;
    this.currentlyProcessing = 0;

    this.stats = {
      totalEnqueued: 0,
      totalProcessed: 0,
      totalFailed: 0,
      totalRetried: 0
    };
  }

  /**
   * Add job to queue
   */
  enqueue(job) {
    const jobWithMetadata = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...job,
      priority: job.priority || 5, // 1-10, higher = more important
      attempts: 0,
      maxRetries: job.maxRetries || 3,
      status: 'queued',
      enqueuedAt: new Date(),
      data: job.data || {}
    };

    // Insert based on priority (higher priority first)
    const insertIndex = this.jobs.findIndex(j => j.priority < jobWithMetadata.priority);
    if (insertIndex === -1) {
      this.jobs.push(jobWithMetadata);
    } else {
      this.jobs.splice(insertIndex, 0, jobWithMetadata);
    }

    this.stats.totalEnqueued++;
    console.log(`📥 Job enqueued: ${jobWithMetadata.id} (${job.productName}) - Priority: ${job.priority}`);

    return jobWithMetadata.id;
  }

  /**
   * Get next job from queue
   */
  dequeue() {
    if (this.currentlyProcessing >= this.maxConcurrent) {
      return null;
    }

    const job = this.jobs.shift();
    if (!job) return null;

    job.status = 'processing';
    job.startedAt = new Date();
    this.processing.set(job.id, job);
    this.currentlyProcessing++;

    return job;
  }

  /**
   * Mark job as completed
   */
  complete(jobId, result) {
    const job = this.processing.get(jobId);
    if (!job) return;

    job.status = 'completed';
    job.completedAt = new Date();
    job.result = result;
    job.duration = job.completedAt - job.startedAt;

    this.processing.delete(jobId);
    this.completed.push(job);
    this.currentlyProcessing--;
    this.stats.totalProcessed++;

    // Keep only last 100 completed jobs
    if (this.completed.length > 100) {
      this.completed.shift();
    }

    console.log(`✅ Job completed: ${jobId} (${job.productName}) - ${job.duration}ms`);
  }

  /**
   * Mark job as failed and retry if possible
   */
  fail(jobId, error) {
    const job = this.processing.get(jobId);
    if (!job) return;

    job.attempts++;
    job.lastError = error.message;
    job.lastAttemptAt = new Date();

    // Retry if not exceeded max retries
    if (job.attempts < job.maxRetries) {
      job.status = 'queued';
      job.priority = Math.max(1, job.priority - 1); // Lower priority on retry

      this.processing.delete(jobId);
      this.currentlyProcessing--;

      // Re-enqueue with delay
      const delay = Math.min(1000 * Math.pow(2, job.attempts), 30000); // Max 30 seconds
      setTimeout(() => {
        this.jobs.push(job);
        this.stats.totalRetried++;
        console.log(`🔄 Job retried: ${jobId} (Attempt ${job.attempts}/${job.maxRetries})`);
      }, delay);

    } else {
      // Max retries exceeded
      job.status = 'failed';
      job.failedAt = new Date();

      this.processing.delete(jobId);
      this.failed.push(job);
      this.currentlyProcessing--;
      this.stats.totalFailed++;

      // Keep only last 50 failed jobs
      if (this.failed.length > 50) {
        this.failed.shift();
      }

      console.log(`❌ Job failed permanently: ${jobId} (${job.productName}) - ${error.message}`);
    }
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queued: this.jobs.length,
      processing: this.processing.size,
      completed: this.completed.length,
      failed: this.failed.length,
      ...this.stats,
      concurrency: {
        current: this.currentlyProcessing,
        max: this.maxConcurrent
      }
    };
  }

  /**
   * Get all jobs by status
   */
  getJobs(status = null) {
    if (!status) {
      return {
        queued: this.jobs,
        processing: Array.from(this.processing.values()),
        completed: this.completed,
        failed: this.failed
      };
    }

    switch (status) {
      case 'queued':
        return this.jobs;
      case 'processing':
        return Array.from(this.processing.values());
      case 'completed':
        return this.completed;
      case 'failed':
        return this.failed;
      default:
        return [];
    }
  }

  /**
   * Clear completed and failed jobs
   */
  clear() {
    this.completed = [];
    this.failed = [];
    console.log('🧹 Queue cleared (completed and failed jobs removed)');
  }

  /**
   * Pause queue processing
   */
  pause() {
    this.paused = true;
    console.log('⏸️  Queue paused');
  }

  /**
   * Resume queue processing
   */
  resume() {
    this.paused = false;
    console.log('▶️  Queue resumed');
  }

  /**
   * Check if job exists in queue
   */
  hasJob(productName) {
    return this.jobs.some(job => job.productName === productName) ||
           Array.from(this.processing.values()).some(job => job.productName === productName);
  }
}

export default ScrapingQueue;
