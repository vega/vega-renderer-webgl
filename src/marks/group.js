import {visit} from '../util/visit';

function draw(gl, scene, tfx) {
    visit(scene, group => {
        const gx = group.x || 0,
            gy = group.y || 0,
            fore = group.strokeForeground,
            opacity = group.opacity == null ? 1 : group.opacity;
        visit(group, item => {
            this.draw(gl, item, [tfx[0] + gx, tfx[1] + gy]);
        });
    });
}

export default {
    type: 'group',
    draw: draw
};
