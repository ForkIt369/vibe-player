class CircularBuffer {
  constructor(size) {
    this.size = size;
    this.buffer = new Float32Array(size);
    this.pointer = 0;
    this.filled = false;
  }

  push(value) {
    this.buffer[this.pointer] = value;
    this.pointer = (this.pointer + 1) % this.size;
    
    if (this.pointer === 0) {
      this.filled = true;
    }
  }

  get(index) {
    const actualIndex = (this.pointer - 1 - index + this.size) % this.size;
    return this.buffer[actualIndex];
  }

  average() {
    const count = this.filled ? this.size : this.pointer;
    if (count === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < count; i++) {
      sum += this.buffer[i];
    }
    return sum / count;
  }

  variance() {
    const avg = this.average();
    const count = this.filled ? this.size : this.pointer;
    if (count === 0) return 0;
    
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const diff = this.buffer[i] - avg;
      sum += diff * diff;
    }
    return Math.sqrt(sum / count);
  }

  max() {
    const count = this.filled ? this.size : this.pointer;
    if (count === 0) return 0;
    
    let max = this.buffer[0];
    for (let i = 1; i < count; i++) {
      if (this.buffer[i] > max) {
        max = this.buffer[i];
      }
    }
    return max;
  }

  clear() {
    this.pointer = 0;
    this.filled = false;
    this.buffer.fill(0);
  }
}

export default CircularBuffer;