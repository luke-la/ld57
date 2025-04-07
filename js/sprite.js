class Sprite {
  constructor(src, w, h, pxw, pxh, frames, sfps) {
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
    this.spriteFps = sfps;
    this.currentFrame = 0;
    this.lastFrame = 1;
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
    if (Date.now() - this.lastFrame > 1000 / this.spriteFps) {
      this.currentFrame = (this.currentFrame + 1) % this.frames
      this.lastFrame = Date.now()
    }
  }
}
