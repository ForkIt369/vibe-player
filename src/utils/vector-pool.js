import ObjectPool from './object-pool.js';

class VectorPool {
  constructor() {
    this.pool = new ObjectPool(
      () => ({ x: 0, y: 0 }),
      (vec) => { vec.x = 0; vec.y = 0; },
      { initialSize: 200, maxSize: 1000 }
    );
  }

  create(x = 0, y = 0) {
    const vec = this.pool.acquire();
    if (vec) {
      vec.x = x;
      vec.y = y;
    }
    return vec;
  }

  release(vec) {
    this.pool.release(vec);
  }
}

export default VectorPool;