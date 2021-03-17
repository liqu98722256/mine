module.exports = {
  parser: '@typescript-eslint/parser', //定义ESLint的解析器
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],//定义文件继承的子规范
  plugins: ['@typescript-eslint'],//定义了该eslint文件所依赖的插件
  env: {                          //指定代码的运行环境
    browser: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/indent': [2, 2],
    'semi': [1, 'always'],
    'eqeqeq': 1,
    'camelcase': 1,
    "prefer-const": 0,
    "template-curly-spacing": 1,
    "array-bracket-spacing": [1, "never"]
  }
};