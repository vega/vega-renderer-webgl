import {color, RGBColor} from 'd3-color';

function draw(gl, item) {
  if (!this._positions) {
    this._positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
  }
  this._itemCount = item.items.length;
  this._centers = [];
  this._scales = [];
  this._colors = [];
  for (let i = 0; i < this._itemCount; i++) {
    const {x, y, width, height, fill, fillOpacity} = item.items[i];
    this._centers.push(x, y);
    const col = color(fill);
    this._colors.push(col.r / 255, col.g / 255, col.b / 255, fillOpacity);
    this._scales.push(width, height);
  }
}

export default {
  type: 'rect',
  tag: 'path',
  nested: false,
  attr: undefined,
  bound: undefined,
  draw: draw,
  isect: undefined
};
