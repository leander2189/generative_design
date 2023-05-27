class RandomWalk
{
  step = 10;

  constructor(canvasId) 
  {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true});

    this.w = this.canvas.width;
    this.h = this.canvas.height;
    
    this.ctx.fillStyle = "#000011";
	  this.ctx.fillRect(0, 0, this.w, this.h);

	  this.x = this.w/2;
	  this.y = this.h/2;
    
    this.walk();
  }

  // Brownian walk
  walk() 
  {
    var r = Math.random()*4;
    
    if (this.x >= this.w) this.x -= this.w;
    if (this.x < 0) this.x += this.w;
    if (this.y < 0) this.y += this.h;
    if (this.y >= this.h) this.y -= this.h;
    
    this.ctx.strokeStyle = 'white';
    this.ctx.globalAlpha = 0.2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    
    if (r < 1) this.x += this.step;
    else if (r < 2) this.y -= this.step;
    else if (r < 3) this.x -= this.step;
    else this.y += this.step;
      
    this.ctx.lineTo(this.x, this.y);
    this.ctx.stroke();
    
    requestAnimationFrame(this.walk.bind(this));
  }
}
