import {truthy} from 'vega-util';
import {pickVisit} from './visit';

export function pick(test) {
  test = test || truthy;
  return function (context, scene, x, y, gx, gy) {
    return pickVisit(scene, item => {
      const b = item.bounds;
      if ((b && !b.contains(gx, gy)) || !b) return;
      if (test(context, item, x, y, gx, gy)) return item;
    });
  };
}
