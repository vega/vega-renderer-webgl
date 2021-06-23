import {font, lineHeight, textLines, offset, textValue} from '../util/text';
import {blend, fill, stroke} from '../util/canvas';
import {HalfPi, DegToRad} from '../util/constants';
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

function anchorPoint(item) {
  let x = item.x || 0,
    y = item.y || 0,
    r = item.radius || 0,
    t;
  if (r) {
    t = (item.theta || 0) - HalfPi;
    x += r * Math.cos(t);
    y += r * Math.sin(t);
  }
  return {x1: x, y1: y};
}

function draw(gl, scene, tfx) {
  const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
  const [offsetx, offsety] = tfx;
  const dpi = this._uniforms.dpi;
  const [w, h] = this._uniforms.resolution;
  const canvas = new OffscreenCanvas(w * dpi, h * dpi);
  const octx = canvas.getContext('2d');
  for (let i = 0; i < scene.items.length; i++) {
    const item = scene.items[i];
    let opacity = item.opacity == null ? 1 : item.opacity,
      p,
      x,
      y,
      j,
      lh,
      tl,
      str;
    octx.font = font(item);
    octx.textAlign = item.align || 'left';

    p = anchorPoint(item);
    x = (p.x1 + offsetx) * dpi;
    y = (p.y1 + offsety) * dpi;

    if (item.angle) {
      octx.save();
      octx.translate(x, y);
      octx.rotate(item.angle * DegToRad);
      x = y = 0; // reset x, y
    }
    x += item.dx * dpi || 0;
    y += (item.dy * dpi || 0) + offset(item);
    tl = textLines(item);
    blend(octx, item);
    if (Array.isArray(tl)) {
      lh = lineHeight(item);
      for (j = 0; j < tl.length; ++j) {
        str = textValue(item, tl[j]);
        if (item.fill && fill(octx, item, opacity)) {
          octx.fillText(str, x, y);
        }
        if (item.stroke && stroke(octx, item, opacity)) {
          octx.strokeText(str, x, y);
        }
        y += lh;
      }
    } else {
      str = textValue(item, tl);
      if (item.fill && fill(octx, item, opacity)) {
        octx.fillText(str, x, y);
      }
      if (item.stroke && stroke(octx, item, opacity)) {
        octx.strokeText(str, x, y);
      }
    }

    if (item.angle) octx.restore();
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
