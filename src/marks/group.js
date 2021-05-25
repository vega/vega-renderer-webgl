import {visit} from '../util/visit';
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
attribute vec2 position;
uniform vec2 origin;
uniform vec2 scale;
uniform vec2 resolution;
varying vec2 vpos;

void main() {
      vec2 pos = position * scale;
      pos += origin;
      pos /= resolution;
      pos.y = 1.0-pos.y;
      pos = pos*2.0-1.0;
      vpos = position;
      gl_Position = vec4(pos, 0, 1);
}`;

const fs = `
precision mediump float;
uniform float strokewidth;
uniform vec2 resolution;
uniform vec2 origin;
uniform vec2 scale;
uniform vec4 stroke;
uniform vec4 fill;
varying vec2 vpos;

void main() {
    vec4 col = fill;
    //if (gl_FragCoord.x - origin.x < 5.0) {
    //    col.rgb = vec3(0,0,0);
    //}
    vec2 sw = strokewidth*2.0/resolution;
    if (vpos.x < sw.x || vpos.x > 1.0-sw.x) {
      col = stroke;
    }

    if (vpos.y < sw.y || vpos.y > 1.0-sw.y) {
      col = stroke;
    }

    gl_FragColor = col;
}`;

function draw(gl, scene, tfx) {
  visit(scene, group => {
    const {fill, stroke, width, height} = group;
    const gx = group.x || 0,
      gy = group.y || 0,
      fore = group.strokeForeground,
      opacity = group.opacity == null ? 1 : group.opacity;

    const [tx, ty] = [tfx[0] + gx, tfx[1] + gy];
    const strokeWidth = 1;

    let fillColor = [0, 0, 0, 0];
    if (fill && fill !== 'transparent') {
      const col = color(fill);
      fillColor = [col.r / 255.0, col.b / 255.0, col.g / 255.0, 1.0];
    }
    let strokeColor = [0, 0, 0, 0];
    if (stroke && stroke !== 'transparent') {
      const col = color(stroke);
      strokeColor = [col.r / 255.0, col.b / 255.0, col.g / 255.0, 1.0];
    }

    const w = width || 0,
      h = height || 0;

    const programInfo = createProgramInfo(gl, [vs, fs]);
    const bufferInfo = createBufferInfoFromArrays(gl, {
      position: {data: [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0], divisor: 0}
    });

    gl.useProgram(programInfo.program);
    setBuffersAndAttributes(gl, programInfo, bufferInfo);
    setUniforms(programInfo, {
      ...this._uniforms,
      scale: [w, h],
      origin: [tx, ty],
      strokewidth: strokeWidth,
      stroke: strokeColor,
      fill: fillColor
    });
    drawBufferInfo(gl, bufferInfo, gl.TRIANGLE);

    visit(group, item => {
      this.draw(gl, item, [tx, ty]);
    });
  });
}

export default {
  type: 'group',
  draw: draw
};
