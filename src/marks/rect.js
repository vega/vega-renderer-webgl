import {color} from 'd3-color';
import {
  createProgramInfo,
  setUniforms,
  createBufferInfoFromArrays,
  createVertexArrayInfo,
  setBuffersAndAttributes,
  drawBufferInfo
} from 'twgl.js/dist/4.x/twgl-full.module.js';

const vs = `
    attribute vec2 position;
    attribute vec2 center;
    attribute vec2 scale;
    attribute vec4 color;
    uniform vec2 resolution;
    varying vec4 fill;

    void main() {
      fill = color;
      vec2 pos = position * scale;
      pos += center;
      pos /= resolution;
      pos.y = 1.0-pos.y;
      pos = pos*2.0-1.0;
      gl_Position = vec4(pos, 0, 1);
    }
`;

const fs = `
    precision mediump float;
    varying vec4 fill;
    void main() {
      gl_FragColor = vec4(fill.xyz, fill.w);
    }
`;

function draw(gl, item) {
  const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
  const itemCount = item.items.length;
  const centers = [];
  const scales = [];
  const colors = [];
  for (let i = 0; i < itemCount; i++) {
    const {x, y, width, height, fill, fillOpacity} = item.items[i];
    centers.push(x, y);
    const col = color(fill);
    colors.push(col.r / 255, col.g / 255, col.b / 255, fillOpacity ?? 1);
    scales.push(width, height);
  }
  const programInfo = createProgramInfo(gl, [vs, fs]);
  gl.useProgram(programInfo.program);
  const buffer = {
    position: {data: positions},
    center: {data: centers, numComponents: 2, divisor: 1},
    scale: {data: scales, numComponents: 2, divisor: 1},
    color: {data: colors, numComponents: 4, divisor: 1}
  };
  setUniforms(programInfo, this.uniforms);
  const bufferInfo = createBufferInfoFromArrays(gl, buffer);
  const vertexInfo = createVertexArrayInfo(gl, programInfo, bufferInfo);
  setBuffersAndAttributes(gl, programInfo, vertexInfo);
  drawBufferInfo(gl, vertexInfo, gl.TRIANGLES, vertexInfo.numElements, 0, itemCount);
}

export default {
  type: 'rect',
  draw: draw
};
