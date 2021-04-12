export default function (canvas, width, height, origin, scaleFactor, opt) {
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  if (pixelRatio !== 1) {
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }

  return canvas;
}
