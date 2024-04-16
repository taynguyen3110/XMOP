const path = require('path');

module.exports = {
  mode: 'development', // 여기에 mode 속성을 추가했습니다. 필요에 따라 'production' 또는 'none'으로 변경 가능합니다.
  entry: './src/assets/js/index.js', // 시작점 설정
  output: {
    filename: 'bundle.js', // 번들 파일 이름 설정
    path: path.resolve(__dirname, 'public/assets/js'), // 출력 경로 설정
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader', // CSS를 DOM에 삽입
          'css-loader', // CSS를 CommonJS로 변환
          'sass-loader' // Sass를 CSS로 컴파일
        ]
      }
    ]
  }
};
