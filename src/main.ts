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
// 获取渲染上下文
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
// 初始化游戏核心对象
const mine = new Mine(rowCount, colCount, bombCount);
const gridWidth = canvas.width / rowCount;
const gridHeight = canvas.height / colCount;

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
            textColor
          });
        }
      } else {
        drawGrid({
          x,
          y,
          width,
          height,
          fillStyle: '#b2bec3',
          strokeStyle,
          text: '',
          lineWidth,
          textColor
        });
      }
    }
  }
};

const onClick = (e: MouseEvent) => {
  const { offsetX, offsetY } = e;
  // 转换坐标轴
  const x = Math.floor(offsetX / canvas.width * colCount);
  const y = Math.floor(offsetY / canvas.height * rowCount);
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
    console.log('game over');
  }
};

const onRest = () => {
  // 重置所有格子状态
  mine.resetGridMappers();
  // 重置所有炸弹
  mine.resetBombs();
  one = true;
};

const requestAnimationFrameDraw = () => {
  // 渲染画面
  draw();
  requestAnimationFrame(requestAnimationFrameDraw);
};

// 监听点击
canvas.addEventListener('click', onClick);
// 监听重置
reset.addEventListener('click', onRest);
// 生成格子
mine.generateGridMapper();
// 运行渲染方法
requestAnimationFrameDraw();
