// taken directly from vega-scenegraph
//@ts-ignore
import {isArray, lruCache} from 'vega-util';
const dpi = window.devicePixelRatio;

// memoize text width measurement
const widthCache = lruCache();

export var textMetrics = {
  height: fontSize,
  estimateWidth: estimateWidth,
  width: estimateWidth
};

// make simple estimate if no canvas is available
function estimateWidth(item, text) {
  return _estimateWidth(textValue(item, text), fontSize(item));
}

function _estimateWidth(text, currentFontHeight) {
  return ~~(0.8 * text.length * currentFontHeight);
}

export function fontSize(item) {
  return (item.fontSize != null ? +item.fontSize || 0 : 11) * dpi;
}

export function lineHeight(item) {
  return item.lineHeight != null ? item.lineHeight : fontSize(item) + 2;
}

function lineArray(_) {
  return isArray(_) ? (_.length > 1 ? _ : _[0]) : _;
}

export function textLines(item) {
  return lineArray(item.lineBreak && item.text && !isArray(item.text) ? item.text.split(item.lineBreak) : item.text);
}

export function multiLineOffset(item) {
  const tl = textLines(item);
  return (isArray(tl) ? tl.length - 1 : 0) * lineHeight(item);
}

export function textValue(item, line) {
  const text = line == null ? '' : (line + '').trim();
  return item.limit > 0 && text.length ? truncate(item, text) : text;
}

function widthGetter(item) {
  // we are relying on estimates
  const currentFontHeight = fontSize(item);
  return text => _estimateWidth(text, currentFontHeight);
}

function truncate(item, text) {
  var limit = +item.limit,
    width = widthGetter(item);

  if (width(text) < limit) return text;

  var ellipsis = item.ellipsis || '\u2026',
    rtl = item.dir === 'rtl',
    lo = 0,
    hi = text.length,
    mid;

  limit -= width(ellipsis);

  if (rtl) {
    while (lo < hi) {
      mid = (lo + hi) >>> 1;
      if (width(text.slice(mid)) > limit) lo = mid + 1;
      else hi = mid;
    }
    return ellipsis + text.slice(lo);
  } else {
    while (lo < hi) {
      mid = 1 + ((lo + hi) >>> 1);
      if (width(text.slice(0, mid)) < limit) lo = mid;
      else hi = mid - 1;
    }
    return text.slice(0, lo) + ellipsis;
  }
}

export function fontFamily(item, quote) {
  var font = item.font;
  return (quote && font ? String(font).replace(/"/g, "'") : font) || 'sans-serif';
}

export function font(item, quote) {
  console.log(item);
  return (
    '' +
    (item.fontStyle ? item.fontStyle + ' ' : '') +
    (item.fontVariant ? item.fontVariant + ' ' : '') +
    (item.fontWeight ? item.fontWeight + ' ' : '') +
    fontSize(item) +
    'px ' +
    fontFamily(item, quote)
  );
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
