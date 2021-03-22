import Mine from '../Mine';

const printMine = (mine: Mine, row: number, col: number) => {
  let table = '';
  for (let i = 0; i < row; i++) {
    let line = ' | ';
    for (let j = 0; j < col; j++) {
      const grid = mine.getGrid(i, j);
      line += ` ${(grid.bomb ? '*' : grid.bombCount)} `  + ' | ';
    }
    table += line + '\n';
  }
  return table;
};

describe('创建对象是否符合预期', () => {
  const row = 10;
  const col = 10;
  const bombCount = 10;
  let mine: Mine;

  beforeEach(() => {
    mine = new Mine(row, col, bombCount);
    mine.generateGridMapper();
    mine.generateBombs();
  });

  test('测试创建格子列表是否成功', () => {
    expect(mine.gridMappers.length).toBe(row * col);
    expect(mine.bombSet.size).toBe(bombCount);
  });

  test('测试炸弹格子是否正确的被标记', () => {
    mine.bombSet.forEach((idx) => {
      expect(mine.getGrid(idx).bomb).toBeTruthy();
    });
  });

  test('测试获取目标周围格子是否正确', () => {
    expect(mine.getAroundGrid(0, 0).length).toBe(3);
    expect(mine.getAroundGrid(0, col - 1).length).toBe(3);
    expect(mine.getAroundGrid(row - 1, 0).length).toBe(3);
    expect(mine.getAroundGrid(row - 1, col -1).length).toBe(3);
    expect(mine.getAroundGrid(1, 1).length).toBe(8);
    expect(mine.getAroundGrid(0, 1).length).toBe(5);
  });

  test('测试格子开启状态是否正确', () => {
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        mine.check(i, j);
        expect(mine.getGrid(i, j)).toBeTruthy();
      }
    }
  });

  test('测试炸弹周围的格子计数是否大于 0', () => {
    // 打开所有非炸弹的格子
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        // 跳过炸弹
        if (mine.isBobm(i, j)) continue;
        mine.check(i, j);
      }
    }
    console.log(printMine(mine, row, col));
    // 获取炸弹周围格子
    mine.bombSet.forEach((idx) => {
      mine.getAroundGrid(...mine.parseDimension(idx)).forEach((val) => {
        const grid = mine.getGrid(val as [number, number]);
        // 炸弹格子的周围可能还是炸弹，需要排除炸弹
        if (grid.bomb) return;
        expect(grid.bombCount).toBeGreaterThan(0);
      });
    });
  });

  test('测试格子是否重置成功', () => {
    mine.resetGridMappers();
    mine.gridMappers.forEach(grid => {
      expect(grid.bomb).toBeFalsy();
      expect(grid.open).toBeFalsy();
      expect(grid.bombCount).toBe(0);
    });
  });

  test('测试炸弹是否重置成功', () => {
    mine.resetBombs();
    expect(mine.bombSet.size).toBe(0);
  });
});