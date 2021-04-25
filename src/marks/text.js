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
    const [offsetx, offsety] = tfx;
    const {dpi} = this._uniforms;
    const canvas = new OffscreenCanvas(gl.canvas.width, gl.canvas.height);
    const ctx = canvas.getContext('2d');
    const DegToRad = 0.01745329251;

    for (let i = 0; i < itemCount; i++) {
        const {x: px, y: py, text, fill, font, fontSize, fontWeight, align, baseline, angle} = item.items[i];
        let [x, y] = [(px + offsetx) * dpi, (py + offsety) * dpi];
        ctx.font = `${fontWeight ? fontWeight : ''} ${fontSize * dpi}px ${font}`;
        ctx.fillStyle = fill;
        ctx.textAlign = align;
        ctx.textBaseAlign = baseline;
        if (angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle * DegToRad);
            x = y = 0;
            ctx.fillText(text, x, y);
            ctx.restore();
        } else {
            ctx.fillText(text, x, y);
        }
    }

    const programInfo = createProgramInfo(gl, [vs, fs]);
    gl.useProgram(programInfo.program);
    const buffer = {
        position: {data: positions, divisor: 0}
    };
    setUniforms(programInfo, {
        ...this._uniforms,
        t0: createTexture(gl, {src: canvas})
    });
    const bufferInfo = createBufferInfoFromArrays(gl, buffer);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    drawBufferInfo(gl, bufferInfo, gl.TRIANGLE);
}

export default {
    draw: draw
};
