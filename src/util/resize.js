function devicePixelRatio() {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
}
const pixelRatio = devicePixelRatio();

export default function (canvas, width, height, origin, scaleFactor, opt) {
  const inDOM = typeof HTMLElement !== 'undefined' && canvas instanceof HTMLElement && canvas.parentNode != null,
    ratio = inDOM ? pixelRatio : scaleFactor;

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  if (inDOM && ratio !== 1) {
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  return canvas;
}
