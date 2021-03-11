import {visit} from '../util/visit';

function draw(gl, scene, bounds) {
  this._aspect = this._height / this._width;

  visit(scene, group => {
    const gx = group.x || 0,
      gy = group.y || 0,
      fore = group.strokeForeground,
      opacity = group.opacity == null ? 1 : group.opacity;
    visit(group, item => {
      this.draw(gl, item, bounds);
    });
  });
  this._buffer = {
    position: {data: this._positions},
    center: {data: this._centers, numComponents: 2, divisor: 1},
    scale: {data: this._scales, numComponents: 2, divisor: 1},
    color: {data: this._colors, numComponents: 4, divisor: 1}
  };
}

export default {
  type: 'group',
  tag: 'g',
  nested: false,
  draw: draw
};
