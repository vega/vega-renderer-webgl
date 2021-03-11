import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'build/vega-webgl-renderer.js',
    format: 'umd',
    name: 'vegaWebGLRenderer'
  },
  plugins: [resolve({browser: true}), babel({babelHelpers: 'bundled'})]
};
