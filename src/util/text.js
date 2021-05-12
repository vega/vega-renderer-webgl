// Utils fromm vega-scenegraph

export function fontSize(item) {
  return item.fontSize != null ? +item.fontSize || 0 : 11;
}

export function lineHeight(item) {
  return item.lineHeight != null ? item.lineHeight : fontSize(item) + 2;
}

export function offset(item) {
  // perform our own font baseline calculation
  // why? not all browsers support SVG 1.1 'alignment-baseline' :(
  // this also ensures consistent layout across renderers
  var baseline = item.baseline,
    h = fontSize(item);

  return Math.round(
    baseline === 'top'
      ? 0.79 * h
      : baseline === 'middle'
      ? 0.3 * h
      : baseline === 'bottom'
      ? -0.21 * h
      : baseline === 'line-top'
      ? 0.29 * h + 0.5 * lineHeight(item)
      : baseline === 'line-bottom'
      ? 0.29 * h - 0.5 * lineHeight(item)
      : 0
  );
}
