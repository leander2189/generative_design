class FractalCanvas extends PanZoomCanvas 
{
	constructor(canvasId) 
	{
		super(canvasId);

		const w = 4;
		const h = (w * this.canvas.height) / this.canvas.width;
		const axes = [-0.5-w/2, -0.5+w/2, -h/2, h/2 ];
  
		this.xmin_0 = -0.5 - w/2;
		this.xmax_0 = -0.5 + w/2;
		this.ymin_0 = -h/2;
		this.ymax_0 = +h/2;
  
		this.maxiterations = 200;

		this.drawCanvas();
	}

	drawCanvas() {

		const sx = (this.xmax_0-this.xmin_0)/this.canvas.width;
		const sy = (this.ymax_0-this.ymin_0)/this.canvas.height;
		const xmin = this.xmin_0/this.scale - this.panX*sx;
		const xmax = this.xmax_0/this.scale - this.panX*sx;
		const ymin = this.ymin_0/this.scale - this.panY*sy;
		const ymax = this.ymax_0/this.scale - this.panY*sy;


		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		const W = this.canvas.width;
		const H = this.canvas.height;

		const dx = (xmax - xmin) / W;
		const dy = (ymax - ymin) / H;

		var imageData = this.ctx.getImageData(0, 0, W, H);
		var data = imageData.data;

		for (let j = 0; j < H; j++)
		{
			let y = ymin + j*dy;
			for (let i = 0; i < W; i++)
			{
				let x = xmin + i*dx;
				// Now we test, as we iterate z = z^2 + cm does z tend towards infinity?
				//let n = this.julia(x, y, this.maxiterations);
				let n = this.mandelbrot(x, y, this.maxiterations);


				const pix = (i+j*W)*4;
				
				// We color each pixel based on how long it takes to get to infinity
				// If we never got there, let's pick the color black
				let bright = this.map(n, 0, this.maxiterations, 0, 255);
				if (n == this.maxiterations) bright = 0;

				const col = Colormaps.inferno(bright/255.0);
				data[pix + 0] = 255*col[0];
				data[pix + 1] = 255*col[1];
				data[pix + 2] = 255*col[2];
				data[pix + 3] = 255;
			}
		}
		this.ctx.putImageData(imageData, 0, 0);
	}

	map(v, xmin, xmax, zmin, zmax) 
	{
		if (Math.abs(xmax-xmin) < 1e-5) return zmin;
		
		return (v-xmin)/(xmax-xmin)*(zmax-zmin)+zmin;
	}
	
	mandelbrot(x, y, maxiterations)
	{
		let a = x;
		let b = y;
		let n = 0;
		while (n < maxiterations) {
			const aa = a * a;
			const bb = b * b;
			const twoab = 2.0 * a * b;
			a = aa - bb + x;
			b = twoab + y;
	
			// Infinty in our finite world is simple, let's just consider it 16
			if (aa + bb > 16*16) break;  // Bail
			n++;
		}
	
		return n;
	}

	julia(x, y, maxiterations)
	{
		let a = x;
		let b = y;
		let n = 0;
		while (n < maxiterations) {
			const aa = a * a;
			const bb = b * b;
			const twoab = 2.0 * a * b;
			a = aa - bb - 0.8;
			b = twoab + 0.156;

			// Infinty in our finite world is simple, let's just consider it 16
			if (aa + bb > 16*16) break;  // Bail
			n++;
		}

		return n;
	}


}