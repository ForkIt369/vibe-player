import ObjectPool from './object-pool.js';

class ParticlePool {
  constructor() {
    this.pool = new ObjectPool(
      () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        life: 1,
        color: '#fff',
        connections: []
      }),
      (particle) => {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.size = 2;
        particle.life = 1;
        particle.color = '#fff';
        particle.connections.length = 0;
      },
      { initialSize: 100, maxSize: 500 }
    );
  }

  create(x, y, vx, vy, options = {}) {
    const particle = this.pool.acquire();
    if (particle) {
      particle.x = x;
      particle.y = y;
      particle.vx = vx;
      particle.vy = vy;
      particle.size = options.size || 2;
      particle.life = options.life || 1;
      particle.color = options.color || '#fff';
    }
    return particle;
  }

  destroy(particle) {
    this.pool.release(particle);
  }
}

export default ParticlePool;