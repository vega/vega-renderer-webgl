import {color} from 'd3-color';
import {
  createProgramInfo,
  setUniforms,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  drawBufferInfo
} from 'twgl.js/dist/4.x/twgl-full.module.js';

const vs = `
    attribute vec2 position;
    attribute vec3 color;
    uniform vec2 resolution;
    uniform vec2 origin;
    varying vec3 fill;

    void main() {
      fill = color;
      vec2 pos = position + origin;
      pos /= resolution;
      pos.y = 1.0-pos.y;
      pos = pos*2.0-1.0;
      gl_Position = vec4(pos, 0, 1);
    }
`;

const fs = `
    precision mediump float;
    varying vec3 fill;
    void main() {
      gl_FragColor = vec4(fill.xyz, 1);
    }
`;

function draw(gl, item) {
  const itemCount = item.items.length;
  const positions = [];
  const colors = [];
  for (let i = 0; i < itemCount; i++) {
    const {x, y, stroke, strokeWidth: sw} = item.items[i];
    const {x: x2, y: y2} = item.items[i + 1 < itemCount ? i + 1 : i];
    positions.push(x, y, 0, x + sw, y, 0, x2, y2, 0, x2, y2, 0, x2 + sw, y2, 0, x + sw, y, 0);
    const col = color(stroke);
    colors.push(col.r / 255, col.g / 255, col.b / 255);
  }

  const programInfo = createProgramInfo(gl, [vs, fs]);
  gl.useProgram(programInfo.program);

  const buffer = {
    position: {data: positions},
    color: {data: colors, numComponents: 3}
  };

  setUniforms(programInfo, this.uniforms);
  const bufferInfo = createBufferInfoFromArrays(gl, buffer);
  bufferInfo.numElements = itemCount;
  setBuffersAndAttributes(gl, programInfo, bufferInfo);
  drawBufferInfo(gl, bufferInfo, gl.TRIANGLE);
}

export default {
  type: 'line',
  draw: draw,
};
