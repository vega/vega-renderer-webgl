export function blend(ctx, item) {
  ctx.globalCompositeOperation = item.blend || 'source-over';
}

export function isGradient(value) {
  return value && value.gradient;
}

function addStops(gradient, stops) {
  const n = stops.length;
  for (let i = 0; i < n; ++i) {
    gradient.addColorStop(stops[i].offset, stops[i].color);
  }
  return gradient;
}

/*
export function gradient(context, spec, bounds) {
  const w = bounds.width(),
    h = bounds.height();
  let gradient;

  if (spec.gradient === 'radial') {
    gradient = context.createRadialGradient(
      bounds.x1 + value(spec.x1, 0.5) * w,
      bounds.y1 + value(spec.y1, 0.5) * h,
      Math.max(w, h) * value(spec.r1, 0),
      bounds.x1 + value(spec.x2, 0.5) * w,
      bounds.y1 + value(spec.y2, 0.5) * h,
      Math.max(w, h) * value(spec.r2, 0.5)
    );
  } else {
    // linear gradient
    const x1 = value(spec.x1, 0),
      y1 = value(spec.y1, 0),
      x2 = value(spec.x2, 1),
      y2 = value(spec.y2, 0);

    if (x1 === x2 || y1 === y2 || w === h) {
      // axis aligned: use normal gradient
      gradient = context.createLinearGradient(
        bounds.x1 + x1 * w,
        bounds.y1 + y1 * h,
        bounds.x1 + x2 * w,
        bounds.y1 + y2 * h
      );
    } else {
      // not axis aligned: render gradient into a pattern (#2365)
      // this allows us to use normalized bounding box coordinates
      const image = canvas(Math.ceil(w), Math.ceil(h)),
        ictx = image.getContext('2d');

      ictx.scale(w, h);
      ictx.fillStyle = addStops(ictx.createLinearGradient(x1, y1, x2, y2), spec.stops);
      ictx.fillRect(0, 0, w, h);

      return context.createPattern(image, 'no-repeat');
    }
  }

  return addStops(gradient, spec.stops);
}
*/

export function color(context, item, value) {
  return value; //isGradient(value) ? gradient(context, value, item.bounds) : value;
}

export function fill(ctx, item, opacity) {
  opacity *= item.fillOpacity == null ? 1 : item.fillOpacity;
  if (opacity > 0) {
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color(ctx, item, item.fill);
    return true;
  } else {
    return false;
  }
}

const Empty = [];

export function stroke(ctx, item, opacity) {
  var lw = (lw = item.strokeWidth) != null ? lw : 1;
  if (lw <= 0) return false;

  opacity *= item.strokeOpacity == null ? 1 : item.strokeOpacity;
  if (opacity > 0) {
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color(ctx, item, item.stroke);

    ctx.lineWidth = lw;
    ctx.lineCap = item.strokeCap || 'butt';
    ctx.lineJoin = item.strokeJoin || 'miter';
    ctx.miterLimit = item.strokeMiterLimit || 10;

    if (ctx.setLineDash) {
      ctx.setLineDash(item.strokeDash || Empty);
      ctx.lineDashOffset = item.strokeDashOffset || 0;
    }
    return true;
  } else {
    return false;
  }
}
