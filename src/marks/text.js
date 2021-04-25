import {color} from 'd3-color';
import {
    createProgramInfo,
    setUniforms,
    createBufferInfoFromArrays,
    createTexture,
    setBuffersAndAttributes,
    drawBufferInfo
} from 'twgl.js/dist/4.x/twgl-full.module.js';

const vs = `
precision mediump float;
attribute vec2 position;
uniform vec2 resolution;
uniform vec2 origin;
uniform float dpi;

void main() {
  vec2 pos = position * resolution;
  pos /= resolution;
  pos = pos*2.0-1.0;
  gl_Position = vec4(pos, 0, 1);
}
`;

const fs = `
precision mediump float;
uniform sampler2D t0;
uniform vec2 resolution;
uniform float dpi;

void main() {
  vec2 uv = gl_FragCoord.xy/resolution/dpi;
  uv.y = 1.0-uv.y;
  vec4 col = texture2D(t0, uv);
  gl_FragColor = vec4(col);
}
`;

function draw(gl, item, tfx) {
    const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
    const itemCount = item.items.length;
    const [offsetx, offsety] = this._origin;
    const {dpi} = this._uniforms;
    const canvas = new OffscreenCanvas(gl.canvas.width, gl.canvas.height);
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < itemCount; i++) {
        const {x, y, text, fill, font, fontSize, align, baseline} = item.items[i];
        ctx.font = `${fontSize * dpi}px ${font}`;
        ctx.fillStyle = fill;
        ctx.textAlign = align;
        ctx.textBaseAlign = baseline;
        ctx.fillText(text, (x + offsetx) * dpi, (y + offsety) * dpi);
    }

    const programInfo = createProgramInfo(gl, [vs, fs]);
    gl.useProgram(programInfo.program);
    const buffer = {
        position: {data: positions, divisor: 0}
    };
    setUniforms(programInfo, {...this._uniforms, t0: createTexture(gl, {src: canvas}), origin: tfx});
    const bufferInfo = createBufferInfoFromArrays(gl, buffer);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    drawBufferInfo(gl, bufferInfo, gl.TRIANGLE);
}

export default {
    draw: draw
};
