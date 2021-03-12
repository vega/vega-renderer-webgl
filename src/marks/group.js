import {visit} from '../util/visit';

function draw(gl, scene, bounds) {
  visit(scene, group => {
    const gx = group.x || 0,
      gy = group.y || 0,
      fore = group.strokeForeground,
      opacity = group.opacity == null ? 1 : group.opacity;
    visit(group, item => {
      this.draw(gl, item, bounds);
    });
  });
}

export default {
  type: 'group',
  tag: 'g',
  nested: false,
  draw: draw
};
