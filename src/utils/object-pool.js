class ObjectPool {
  constructor(factory, reset, options = {}) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    this.active = new Set();
    
    this.options = {
      initialSize: options.initialSize || 50,
      maxSize: options.maxSize || 500,
      growthFactor: options.growthFactor || 2
    };
    
    // Pre-allocate initial objects
    this.grow(this.options.initialSize);
  }

  grow(count) {
    for (let i = 0; i < count; i++) {
      if (this.pool.length + this.active.size >= this.options.maxSize) {
        break;
      }
      this.pool.push(this.factory());
    }
  }

  acquire() {
    if (this.pool.length === 0) {
      if (this.active.size < this.options.maxSize) {
        this.grow(Math.min(
          this.options.growthFactor,
          this.options.maxSize - this.active.size
        ));
      }
    }
    
    if (this.pool.length > 0) {
      const obj = this.pool.pop();
      this.active.add(obj);
      return obj;
    }
    
    return null;
  }

  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    this.active.forEach(obj => {
      this.reset(obj);
      this.pool.push(obj);
    });
    this.active.clear();
  }

  getStats() {
    return {
      pooled: this.pool.length,
      active: this.active.size,
      total: this.pool.length + this.active.size,
      utilization: this.active.size / (this.pool.length + this.active.size)
    };
  }
}

export default ObjectPool;