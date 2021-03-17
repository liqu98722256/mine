import Mine from '../Mine';

describe('创建对象是否符合预期', () => {
  const row = 10;
  const col = 10;
  const bombCount = 10;
  let mine: Mine;

  beforeEach(() => {
    mine = new Mine(row, col, bombCount);
    mine.generateGrids();
    mine.generateBomb();
  });

  test('测试创建格子列表是否正确', () => {
    expect(mine.gridMapper.length).toBe(row * col);
    expect(mine.bombs.size).toBe(bombCount);
  });

  test('测试格子是否正确的被标记', () => {
    mine.bombs.forEach((idx) => {
      expect(mine.gridMapper[idx].bomb).toBeTruthy();
    });
  });

  test('测试获取目标周围格子是否正确', () => {
    expect(mine.getAroundGrid(-1, -1).length).toBe(0);
    expect(mine.getAroundGrid(0, 0).length).toBe(3);
    expect(mine.getAroundGrid(0, col - 1).length).toBe(3);
    expect(mine.getAroundGrid(row - 1, 0).length).toBe(3);
    expect(mine.getAroundGrid(row - 1, col -1).length).toBe(3);
    expect(mine.getAroundGrid(1, 1).length).toBe(8);
  });

  test('测试格子是否打开', () => {
    mine.check(0, 0);
    expect(mine.gridMapper[mine.index(0, 0)].open).toBeTruthy();
  });
});