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
    uniform vec2 origin;
    varying vec4 fill;

    void main() {
      fill = color;
      vec2 pos = position * scale;
      pos += center;
      pos += origin;
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

function draw(gl, item, tfx) {
    const segments = 32;
    const angles = Array.from({length: segments}, (_, i) => (!i ? 0 : ((Math.PI * 2.0) / segments) * i));
    const positions = [];
    for (let i = 0; i < segments; i++) {
        const ang1 = angles[i];
        const ang2 = angles[(i + 1) % segments];
        const x1 = Math.cos(ang1);
        const y1 = Math.sin(ang1);
        const x2 = Math.cos(ang2);
        const y2 = Math.sin(ang2);
        positions.push(x1, y1, 0, 0, 0, 0, x2, y2, 0);
    }
    const itemCount = item.items.length;
    const centers = [];
    const scales = [];
    const colors = [];
    for (let i = 0; i < itemCount; i++) {
        const {x, y, size, fill, fillOpacity} = item.items[i];
        centers.push(x, y);
        const col = color(fill);
        colors.push(col.r / 255, col.g / 255, col.b / 255, fillOpacity);
        const r = Math.sqrt(size) / 2;
        scales.push(r, r);
    }
    const programInfo = createProgramInfo(gl, [vs, fs]);
    const buffer = {
        position: {data: positions},
        center: {data: centers, numComponents: 2, divisor: 1},
        scale: {data: scales, numComponents: 2, divisor: 1},
        color: {data: colors, numComponents: 4, divisor: 1}
    };
    gl.useProgram(programInfo.program);
    setUniforms(programInfo, {...this._uniforms, origin: tfx});
    const bufferInfo = createBufferInfoFromArrays(gl, buffer);
    const vertexInfo = createVertexArrayInfo(gl, programInfo, bufferInfo);
    setBuffersAndAttributes(gl, programInfo, vertexInfo);
    drawBufferInfo(gl, vertexInfo, gl.TRIANGLES, vertexInfo.numElements, 0, itemCount);
}

export default {
    type: 'symbol',
    draw: draw
};
