class Sprite {
  constructor(src, w, h, pxw, pxh, frames, fps, sfps) {
    this.image = new Image();
    this.image.src = src;
    this.gameSize = {
      width: w,
      height: h,
    };
    this.pixelSize = {
      width: pxw,
      height: pxh,
    };
    this.frames = frames;
    this.fps = fps;
    this.spriteFps = sfps;
    this.currentFrame = 0;
    this.frameCounter = 1;
  }
  getSpriteCropInfo() {
    return {
      sx: this.currentFrame * this.pixelSize.width,
      sy: 0,
      swidth: this.pixelSize.width,
      sheight: this.pixelSize.height,
    }
  }
  checkFrameCount() {
    //do frame updates :D
    this.frameCounter = (this.frameCounter + 1) % Math.floor(this.fps / this.spriteFps)
    if (this.frameCounter === 0) this.currentFrame = (this.currentFrame + 1) % this.frames
  }
}
