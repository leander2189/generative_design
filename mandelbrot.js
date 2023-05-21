class PanZoomCanvas 
{
	constructor(canvasId) {
	  this.canvas = document.getElementById(canvasId);
	  this.ctx = this.canvas.getContext("2d", { willReadFrequently: true});
	  this.scale = 1;
	  this.panX = 0;
	  this.panY = 0;
	  this.panStartX = undefined;
	  this.panStartY = undefined;
	  
	  const w = 4;
	  const h = (w * this.canvas.height) / this.canvas.width;
	  const axes = [-0.5-w/2, -0.5+w/2, -h/2, h/2 ];

	  this.xmin_0 = -0.5 - w/2;
	  this.xmax_0 = -0.5 + w/2;
	  this.ymin_0 = -h/2;
	  this.ymax_0 = +h/2;

	  this.maxiterations = 200;

	  this.canvas.addEventListener("wheel", this.handleZoom.bind(this));
	  this.canvas.addEventListener("mousedown", this.handlePanStart.bind(this));
	  this.canvas.addEventListener("mousemove", this.handlePanMove.bind(this));
	  this.canvas.addEventListener("mouseup", this.handlePanEnd.bind(this));
	  this.canvas.addEventListener("touchstart", this.handlePanStart.bind(this));
	  this.canvas.addEventListener("touchmove", this.handlePanMove.bind(this));
	  this.canvas.addEventListener("touchend", this.handlePanEnd.bind(this));

	  this.drawCanvas();



	}
	
	handleZoom(event) {
	  event.preventDefault();
	
	  const zoomSpeed = 1.1;
	  const zoomMin = 0.5;
	  const zoomMax = 500.0;
	
	  const deltaY = event.deltaY;
	
	  if (deltaY < 0) {
		// Zoom in
		this.scale = Math.min(this.scale * zoomSpeed, zoomMax);
	  } else {
		// Zoom out
		this.scale = Math.max(this.scale / zoomSpeed, zoomMin);
	  }
	
	  this.drawCanvas();
	}
	
	handlePanStart(event) {
	  event.preventDefault();
	
	  if (event.touches) {
		// For touch events
		this.panStartX = event.touches[0].clientX;
		this.panStartY = event.touches[0].clientY;
	  } else {
		// For mouse events
		this.panStartX = event.clientX;
		this.panStartY = event.clientY;
	  }
	
	  this.canvas.style.cursor = "grabbing";
	}
	
	handlePanMove(event) {
	  event.preventDefault();
	
	  if (this.panStartX === undefined || this.panStartY === undefined) {
		return;
	  }
	
	  let x, y;
	
	  if (event.touches) {
		// For touch events
		x = event.touches[0].clientX;
		y = event.touches[0].clientY;
	  } else {
		// For mouse events
		x = event.clientX;
		y = event.clientY;
	  }
	
	  const panSpeed = 1;
	
	  // Calculate the difference in X and Y positions
	  const dx = (x - this.panStartX) / this.scale;
	  const dy = (y - this.panStartY) / this.scale;
	
	  // Update the pan values
	  this.panX += dx * panSpeed;
	  this.panY += dy * panSpeed;
	
	  // Set the start positions for the next move
	  this.panStartX = x;
	  this.panStartY = y;
	
	  this.drawCanvas();
	}
	
	handlePanEnd(event) {
	  event.preventDefault();
	
	  this.panStartX = undefined;
	  this.panStartY = undefined;
	
	  this.canvas.style.cursor = "grab";
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
				
				data[pix + 0] = bright;
				data[pix + 1] = bright;
				data[pix + 2] = bright;
				data[pix + 3] = 255;
			}
		}
		this.ctx.putImageData(imageData, 0, 0);
	}

	map(v, xmin, xmax, zmin, zmax) {
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