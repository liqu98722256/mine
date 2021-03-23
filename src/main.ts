import './css/main.css';
import Mine from './Mine';

const width = 600;
const height = 600;

// html 模板
const template = `
  <div class="game-container" style="width: ${width}px; height: ${height}px;">
    <div class="controller">
      <ul>
        <li><button id="reset">reset</button></li>
        <li><button id="show">show</button></li>
      </ul>
    <div/>
    <canvas width="${width}" height="${height}"></canvas>
  </div>
`;

// 添加模板
document.body.innerHTML = template;

// 表示游戏第一次运行状态
let one = true;
// 格子参数配置
const rowCount = 20;
const colCount = 20;
const bombCount = 80;
// 获取 canvas节点
const canvas = document.querySelector<HTMLCanvasElement>('canvas') as HTMLCanvasElement;
// 重置按钮
const reset = document.querySelector('#reset') as HTMLButtonElement;
// 查看按钮
const show = document.querySelector('#show') as HTMLButtonElement;
// 获取渲染上下文
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
// 初始化游戏核心对象
const mine = new Mine(rowCount, colCount, bombCount);
const gridWidth = canvas.width / rowCount;
const gridHeight = canvas.height / colCount;
// 旗帜集合
const flagSet = new Set<number>();
// 将屏幕坐标转换为格子坐标
const parseCoordinate = (e: MouseEvent): [number, number] => 
  [Math.floor(e.offsetX / canvas.width * colCount), Math.floor(e.offsetY / canvas.height * rowCount)];
let showBomb = false;
let gameOver = false;
let gameWin = false;

interface DrawGridConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  lineWidth: number;
  fillStyle: string;
  strokeStyle: string;
  text: string;
  textColor: string
}

const drawGrid = ({fillStyle, strokeStyle, lineWidth, x, y, width, height, text, textColor}: DrawGridConfig) => {
  ctx.beginPath();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.rect(x, y, width, height);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.fillText(text, x + gridWidth / 2, y + gridHeight / 2);
  ctx.closePath();
};

const draw = () => {
  const width = gridWidth;
  const height = gridHeight;
  const lineWidth = 1;
  const textColor = 'black';
  const strokeStyle = '#636e72';
  // 清除上一帧画面
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 绘制方格
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < colCount; j++) {
      // 获取当前坐标的格子映射对象
      const grid = mine.getGrid(i, j);
      const x = i * gridWidth;
      const y = j * gridHeight;
      const flag = flagSet.has(mine.parseDimension(i, j));
      // 判断格子是否被点击过
      if (grid.open) {
        if (grid.bomb) {
          drawGrid({
            x,
            y,
            width,
            height,
            fillStyle: '#b2bec3',
            strokeStyle,
            text: '💣',
            lineWidth,
            textColor
          });
          gameOver = true;
          gameWin = false;
        } else {
          drawGrid({
            x,
            y,
            width,
            height,
            fillStyle: '#dfe6e9',
            strokeStyle,
            text: grid.bombCount > 0 ? grid.bombCount.toString() : '',
            lineWidth,
            textColor: flag ? 'red' : textColor
          });
        }
      } else {
        let fillStyle = '#b2bec3';
        if (!one && showBomb && mine.isBomb(i, j)){
          fillStyle = '#ff7675';
        }
        // 有一个非炸弹格子没打开那么就是没有赢
        if (!mine.isBomb(i, j)) gameWin = false;

        drawGrid({
          x,
          y,
          width,
          height,
          fillStyle,
          strokeStyle,
          text: flag ? '⛳' : '',
          lineWidth,
          textColor
        });
      }
    }
  }
};

const onClick = (e: MouseEvent) => {
  // 转换坐标轴
  const [x, y] = parseCoordinate(e);
  // 当第一次点击过后再生成炸弹
  if (one) {
    // 打开当前点击的格子
    mine.openGrid(x, y);
    // 生成炸弹
    mine.generateBombs();
    one = false;
  }
  // 检查是否是炸弹
  if (mine.check(x, y)) {
    // 打开所有格子
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        mine.check(i, j);
      }
    }
  }
};

const onRest = () => {
  // 重置所有格子状态
  mine.resetGridMappers();
  // 重置所有炸弹
  mine.resetBombs();
  // 重置旗帜
  flagSet.clear();
  one = true;
  showBomb = false;
  gameOver = false;
  requestAnimationFrameDraw();
};

const onFlag = (e: MouseEvent) => {
  e.preventDefault();
  // 转换坐标轴
  const [x, y] = parseCoordinate(e);
  const oneDimension = mine.parseDimension(x, y);
  if (flagSet.has(oneDimension)) {
    flagSet.delete(oneDimension);
  } else {
    flagSet.add(oneDimension);
  }
};

const onShowBomb = () => {
  showBomb = !showBomb;
};

const requestAnimationFrameDraw = () => {
  if (gameOver) {
    alert(gameWin ? '你赢了' : '你输了');
    return;
  }
  // 渲染画面
  gameWin = true;
  draw();
  if (gameWin) gameOver = true;
  requestAnimationFrame(requestAnimationFrameDraw);
};

// 监听点击
canvas.addEventListener('click', onClick);
// 监听重置
reset.addEventListener('click', onRest);
// 监听查看
show.addEventListener('click', onShowBomb);
// 监听旗帜标记
canvas.addEventListener('contextmenu', onFlag);
// 生成格子
mine.generateGridMapper();
// 运行渲染方法
requestAnimationFrameDraw();
