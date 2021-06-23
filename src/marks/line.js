import {color} from 'd3-color';
import {
  createProgramInfo,
  setUniforms,
  createBufferInfoFromArrays,
  setBuffersAndAttributes,
  drawBufferInfo
} from 'twgl.js/dist/4.x/twgl-full.module.js';

const vs = `
precision mediump float;

uniform vec2 resolution;
uniform vec2 origin;

attribute float strokewidth;
attribute vec2 position;
attribute vec2 normal;

void main() {
	vec2 pos = (position + origin) / resolution;
	pos += normal * strokewidth / resolution * 0.5;
	pos.y = 1.0 - pos.y;
	pos = pos * 2.0 - 1.0;
	gl_Position = vec4(pos, 0, 1);
}
`;

const fs = `
precision mediump float;
uniform vec3 stroke;

void main() {
	gl_FragColor = vec4(stroke, 1);
}
`;

function draw(gl, scene, tfx) {
  const positions = [];
  const normals = [];
  // const colors = [];
  const strokewidths = [];

  for (let i = 0; i < scene.items.length - 1; i++) {
    const {x, y, stroke, strokeWidth} = scene.items[i];
    const {x: x2, y: y2} = scene.items[i + 1];
    const [dx, dy] = [x2 - x, y2 - y];
    let [nx, ny] = [-dy, dx];
    const vlen = Math.sqrt(nx ** 2 + ny ** 2);
    nx /= vlen;
    ny /= vlen;
    positions.push(x, y, 0, x, y, 0, x2, y2, 0, x2, y2, 0, x2, y2, 0, x, y, 0);
    normals.push(nx, ny, 0, -nx, -ny, 0, -nx, -ny, 0, -nx, -ny, 0, nx, ny, 0, nx, ny, 0);
    const sw = strokeWidth || 1;
    strokewidths.push(sw, sw, sw, sw, sw, sw);
  }
  const col = color(scene.items[0].stroke);

  const programInfo = createProgramInfo(gl, [vs, fs]);
  gl.useProgram(programInfo.program);

  const buffer = {
    position: {data: positions},
    normal: {data: normals},
    strokewidth: {data: strokewidths, numComponents: 1}
  };

  setUniforms(programInfo, {...this._uniforms, origin: tfx, stroke: [col.r / 255.0, col.g / 255.0, col.b / 255.0]});
  const bufferInfo = createBufferInfoFromArrays(gl, buffer);
  setBuffersAndAttributes(gl, programInfo, bufferInfo);
  drawBufferInfo(gl, bufferInfo, gl.TRIANGLE);
}

export default {
  type: 'line',
  draw: draw
};
