import { Grid } from './Grid';

class Mine {
  private rowCount: number;
  private colCount: number;
  private bombCount: number;
  private grids: Grid[] = [];
  private bombSet: Set<number> = new Set();

  get gridMapper(): Grid[] {
    return this.grids;
  }

  get bombs(): Set<number> {
    return this.bombSet;
  }
  
  constructor(rowCount: number, colCount: number, bombCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.bombCount = bombCount;
  }

  index(row: number, col: number): number {
    return row * this.colCount + col;
  }

  position(index: number): [number, number] {
    return [index / this.colCount, index % this.colCount];
  }

  generateGrids(): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        // 创建格子并添加
        this.grids.push({
          open: false,
          bomb: false,
          bombCount: 0
        });
      }
    }
  }

  generateBomb(): void {
    if (this.grids.length === 0 || this.bombCount >= this.grids.length) throw new Error('bombCount <= gridCount'); 
    // 随机生成炸弹所在的坐标信息
    while(this.bombSet.size < this.bombCount) {
      this.bombSet.add(Math.floor(Math.random() * (this.grids.length - 1)));
    }
    this.bombSet.forEach((idx) => {
      this.grids[idx].bomb = true;
    });
  }
  
  isBobm(row: number, col: number): boolean {
    return this.grids[this.index(row, col)].bomb;
  }

  check(row: number, col: number): boolean {
    // 判断第一次开启是否是炸弹
    if (this.isBobm(row, col)) {
      // 将炸弹格子标记为打开
      this.grids[this.index(row, col)].open = true;
      return true;
    }
    this.find(row, col);
    return false;
  }

  effectiveGrid(row: number, col: number): boolean {
    return !((row < 0 || row > this.rowCount - 1) || (col < 0 || col > this.colCount - 1));
  }

  getAroundGrid(row: number, col: number): number[][] {
    if (!this.effectiveGrid(row, col)) return [];
    const top = [row - 1, col];
    const right = [row, col + 1];
    const bottom = [row + 1, col];
    const left = [row, col - 1];
    const leftTop = [row - 1, col - 1];
    const leftBottom = [row + 1, col - 1];
    const rightTop = [row - 1, col + 1];
    const rightBottom = [row + 1, col + 1];
    // 过滤掉无效位置
    return [
      top,
      right,
      bottom,
      left,
      leftTop,
      leftBottom,
      rightTop,
      rightBottom
    ].filter(([row, col]) => this.effectiveGrid(row, col));
  }

  find(row: number, col: number): void {
    const grid = this.grids[this.index(row, col)];
    //  检查是否被开启过，开启过直接跳过
    if (grid.open) return;
    // 标记格子为翻开过
    grid.open = true;
    this.getAroundGrid(row, col).forEach(([row, col]) => {
      // 检查周围是否是炸弹
      if (this.isBobm(row, col)) {
        // 是炸弹就增加格子的计数
        grid.bombCount += 1;
        return;
      }
      this.find(row, col);
    });
  }
}


export default Mine;