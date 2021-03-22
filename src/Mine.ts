import { Grid } from './Grid';
const gridMappers = Symbol('gridMappers');
const bombSet = Symbol('bombSet');
class Mine {
  private rowCount: number;
  private colCount: number;
  private bombCount: number;
  private [gridMappers]: Grid[] = [];
  private [bombSet]: Set<number> = new Set();

  constructor(rowCount: number, colCount: number, bombCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.bombCount = bombCount;
  }

  get gridMappers(): Grid[] {
    return this[gridMappers];
  }

  get bombSet(): Set<number> {
    return this[bombSet];
  }

  parseDimension(x: number): [number, number]
  parseDimension(x: [number, number]): number
  parseDimension(x: number, y: number): number
  parseDimension(x: unknown, y?: unknown): unknown {
    let val: unknown;
    if (typeof x === 'number' && typeof y === 'undefined') {
      val = [Math.floor(x / this.colCount), x % this.colCount];
    } else if (Array.isArray(x) && typeof y === 'undefined') {
      val = x[0] * this.colCount + x[1];
    }else if (typeof x === 'number' && typeof y === 'number') {
      val = x * this.colCount + y;
    }
    return val;
  }

  generateGridMapper(): void {
    const len = this.rowCount * this.colCount;
    while(this.gridMappers.length < len) {
      this.gridMappers.push({
        open: false,
        bomb: false,
        bombCount: 0
      });
    }
  }

  resetGridMappers(): void {
    this[gridMappers].forEach(grid => {
      grid.bomb = false;
      grid.bombCount = 0;
      grid.open = false;
    });
  }

  resetBombs(): void {
    this[bombSet].clear();
  }

  generateBombs(): void {
    // 格子数量为 0，或者炸弹数量大于等于格子数，抛出异常
    if (this.gridMappers.length === 0 || this.bombCount >= this.gridMappers.length)
      throw new Error('炸弹不能大于或等于格子数');
    // 索引最大范围
    const len = this.gridMappers.length - 1;
    // 随机生成炸弹索引
    while(this.bombSet.size < this.bombCount) {
      const idx = Math.floor(Math.random() * len);
      // 如果格子已经被打开过，那么排除这个格子
      if (this.getGrid(idx).open) continue;
      this.bombSet.add(idx);
    }
    // 标记对应格子状态为炸弹
    this.bombSet.forEach((idx) => this.getGrid(idx).bomb = true);
  }
  
  getGrid(x: number): Grid
  getGrid(x: [number, number]): Grid
  getGrid(x: number, y: number): Grid
  getGrid(x: unknown, y?: unknown): unknown {
    let idx!: number;
    if (typeof x === 'number' && typeof y === 'undefined') {
      idx = x;
    } else if (Array.isArray(x) && typeof y === 'undefined') {
      idx = this.parseDimension(x as [number, number]);
    } else if (typeof x === 'number' && typeof y === 'number') {
      idx = this.parseDimension(x, y);
    }
    return this.gridMappers[idx];
  }

  isBobm(x: number): boolean
  isBobm(x: [number, number]): boolean
  isBobm(x: number, y: number): boolean
  isBobm(x: unknown, y?: unknown): unknown {
    let idx!: number;
    if (typeof x === 'number' && typeof y === 'undefined') {
      idx = x;
    } else if (Array.isArray(x) && typeof y === 'undefined') {
      idx = this.parseDimension(x as [number, number]);
    } else if (typeof x === 'number' && typeof y === 'number') {
      idx = this.parseDimension(x, y);
    }
    return this.bombSet.has(idx);
  }

  openGrid(x: number, y: number): boolean {
    return this.getGrid(x, y).open = true;
  }

  check(x: number, y: number): boolean {
    // 判断格子坐标是否有效
    if (!this.effectiveGrid(x, y)) throw Error('坐标范围无效');
    // 判断是否是炸弹
    if (this.isBobm(x, y)) {
      // 打开格子
      this.openGrid(x, y);
      return true;
    }
    // 不是炸弹则进行其他操作
    this.find(x, y);
    return false;
  }

  effectiveGrid(x: number, y: number): boolean {
    return !((x < 0 || x > this.rowCount - 1) || (y < 0 || y > this.colCount - 1));
  }

  getAroundGrid(x: number, y: number): [number, number][] {
    const top = [x - 1, y];
    const right = [x, y + 1];
    const bottom = [x + 1, y];
    const left = [x, y - 1] ;
    const leftTop = [x - 1, y - 1];
    const leftBottom = [x + 1, y - 1];
    const rightTop = [x - 1, y + 1];
    const rightBottom = [x + 1, y + 1];
    // 过滤掉无效位置
    return ([
      top,
      right,
      bottom,
      left,
      leftTop,
      leftBottom,
      rightTop,
      rightBottom
    ] as [number, number][]).filter(([x, y]) => this.effectiveGrid(x, y));
  }

  private find(x: number, y: number): void {
    const grid = this.getGrid(x, y);
    //  检查是否被开启过，开启过终止查找
    if (grid.open) return;
    // 打开格子
    this.openGrid(x, y);
    // 获取当前坐标周围格子的坐标
    const aroundGrids = this.getAroundGrid(x, y);
    // 遍历周围格子
    aroundGrids.forEach(idx => {
      // 如果是周围格子是炸弹，那么就增加当前格子计数
      if (this.getGrid(idx).bomb) grid.bombCount += 1;
    });
    // 当周围有炸弹时停止继续查找
    if (grid.bombCount > 0) return;
    // 没有炸弹时继续查找其他格子
    aroundGrids.forEach(idx => this.find(...idx));
  }
}


export default Mine;