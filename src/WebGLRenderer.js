import resize from './util/resize';
import marks from './marks/index';

import {Bounds, Renderer, domClear} from 'vega-scenegraph';
import {canvas} from 'vega-canvas';
import {error, inherits} from 'vega-util';
import {
  addExtensionsToContext,
  createProgramInfo,
  createVertexArrayInfo,
  createBufferInfoFromArrays,
  resizeCanvasToDisplaySize,
  setBuffersAndAttributes,
  setUniforms,
  drawBufferInfo
} from 'twgl.js/dist/4.x/twgl-full.module.js';

export default function WebGLRenderer(loader) {
  Renderer.call(this, loader);
  this._options = {};
  this._redraw = false;
  this._dirty = new Bounds();
  this._tempb = new Bounds();
}

const base = Renderer.prototype;

const viewBounds = (origin, width, height) => new Bounds().set(0, 0, width, height).translate(-origin[0], -origin[1]);

inherits(WebGLRenderer, Renderer, {
  initialize(el, width, height, origin, scaleFactor, options) {
    this._options = options || {};

    this._canvas = canvas(1, 1, this._options.type); // instantiate a small canvas
    this._context = this._canvas.getContext('webgl', {
      alpha: false,
      depth: false,
      antialias: true
    });
    if (el && this._canvas) {
      domClear(el, 0).appendChild(this._canvas);
      this._canvas.setAttribute('class', 'marks');
    }

    // this method will invoke resize to size the canvas appropriately
    return base.initialize.call(this, el, width, height, origin, scaleFactor);
  },

  resize(width, height, origin, scaleFactor) {
    base.resize.call(this, width, height, origin, scaleFactor);

    if (this._canvas) {
      // configure canvas size and transform
      resize(this._canvas, this._width, this._height, this._origin, this._scale, this._options.context);
    } else {
      // external context needs to be scaled and positioned to origin
      const gl = this._options.externalContext;
      if (!gl) error('WebGLRenderer is missing a valid canvas or context.');
      gl.scale(this._scale, this._scale);
      gl.translate(this._origin[0], this._origin[1]);
    }

    this._redraw = true;
    return this;
  },

  canvas() {
    return this._canvas;
  },

  context() {
    return this._canvas
      ? this._canvas.getContext('webgl', {
          alpha: false,
          depth: false,
          antialias: true
        })
      : null;
  },

  dirty(item) {
    const b = this._tempb.clear().union(item.bounds);
    let g = item.mark.group;

    while (g) {
      b.translate(g.x || 0, g.y || 0);
      g = g.mark.group;
    }

    this._dirty.union(b);
  },

  _render(scene) {
    let c = this._canvas,
      o = this._origin,
      w = this._width,
      h = this._height,
      db = this._dirty,
      vb = viewBounds(o, w, h);

    const gl = this.context();

    if (gl) {
      addExtensionsToContext(gl);

      const vs = /*glsl*/ `
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

      const fs = /*glsl*/ `
          precision mediump float;
          varying vec4 fill;
          void main() {
            gl_FragColor = vec4(fill.xyz, fill.w);
          }
      `;

      const programInfo = createProgramInfo(gl, [vs, fs]);

      this.programInfo = programInfo;
      this.draw(gl, scene, vb);
      const bufferInfo = createBufferInfoFromArrays(gl, this._buffer);
      const vertexInfo = createVertexArrayInfo(gl, programInfo, bufferInfo);
      const uniforms = {
        resolution: [w, h]
      };

      resizeCanvasToDisplaySize(gl.canvas, 1);
      gl.viewport(0, 0, w, h);
      // setup blending so that all the points aren't opaque
      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.useProgram(programInfo.program);
      setBuffersAndAttributes(gl, programInfo, vertexInfo);
      setUniforms(programInfo, uniforms);
      drawBufferInfo(gl, vertexInfo, gl.TRIANGLES, vertexInfo.numElements, 0, this._itemCount);
    } else {
      error('Failed to construct WebGL instance.');
    }

    return this;
  },

  draw(ctx, scene, bounds) {
    const mark = marks[scene.marktype];
    //if (scene.clip) clip(ctx, scene);
    mark.draw.call(this, ctx, scene, bounds);
    //if (scene.clip) ctx.restore();
  }
});
