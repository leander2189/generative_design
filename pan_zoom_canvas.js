class PanZoomCanvas 
{
	constructor(canvasId, webgl = false) 
    {
        this.canvas = document.getElementById(canvasId);
		if (!webgl)
        	this.ctx = this.canvas.getContext("2d", { willReadFrequently: true});
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.panStartX = undefined;
        this.panStartY = undefined;
        
        this.canvas.addEventListener("wheel", this.handleZoom.bind(this));
        this.canvas.addEventListener("mousedown", this.handlePanStart.bind(this));
        this.canvas.addEventListener("mousemove", this.handlePanMove.bind(this));
        this.canvas.addEventListener("mouseup", this.handlePanEnd.bind(this));
        this.canvas.addEventListener("touchstart", this.handlePanStart.bind(this));
        this.canvas.addEventListener("touchmove", this.handlePanMove.bind(this));
        this.canvas.addEventListener("touchend", this.handlePanEnd.bind(this));

		this.zoomMin = 0.5;
		this.zoomMax = 1000.0;
        // Should be called from the child class
	    //this.drawCanvas();
	}

	setLimits(xmin, xmax, ymin, ymax)
	{
		this.xMin = xmin;
		this.xMax = xmax;
		this.yMin = ymin;
		this.yMax = ymax;
	}
	
	handleZoom(event) {
		event.preventDefault();
		
		const zoomSpeed = 1.1;

		
		const deltaY = event.deltaY;

		var cursorPos = this.getCursorPos(event);
		var prevScale = this.scale;

		if (deltaY < 0) {
			// Zoom in
			this.scale = Math.min(this.scale * zoomSpeed, this.zoomMax);
		} else {
			// Zoom out
			this.scale = Math.max(this.scale / zoomSpeed, this.zoomMin);
		}

		this.panX += cursorPos[0]*(1.0/this.scale - 1.0/prevScale);
		this.panY += cursorPos[1]*(1.0/this.scale - 1.0/prevScale);

	  	this.drawCanvas();
	}
	
	getCursorPos(event)
	{
		let x, y
		if (event.touches) {
			// For touch events
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		} 
		else
		{
			// For mouse events
			var rect = event.target.getBoundingClientRect();
			x = event.clientX - rect.left;
			y = event.clientY - rect.top;
		}
		return [x, y];
	}

	getCursorReal(event)
	{
		let px = this.getCursorPos(event);
		let real = this.transformPoint(px[0], px[1]);

		//console.log(real);
		return real;
	}

	transformPoint(px, py)
	{
		let x = px/this.scale - this.panX;
		x = x / this.canvas.clientWidth*(this.xMax - this.xMin) + this.xMin;

		let y = py/this.scale - this.panY;
		y = y/this.canvas.clientHeight*(this.yMax - this.yMin) + this.yMin;

		return [x, y];
	}

	getLimits()
	{
		var pmin = this.transformPoint(0, 0);
		var pmax = this.transformPoint(this.canvas.clientWidth, this.canvas.clientHeight);

		return [pmin[0], pmax[0], pmin[1], pmax[1]];
	}


	handlePanStart(event) {
	  event.preventDefault();
	
		var cursorPos = this.getCursorPos(event);
		this.panStartX = cursorPos[0];
		this.panStartY = cursorPos[1];
/*
	  if (event.touches) {
		// For touch events
		this.panStartX = event.touches[0].clientX;
		this.panStartY = event.touches[0].clientY;
	  } else {
		// For mouse events
		this.panStartX = event.clientX - this.canvas.x;
		this.panStartY = event.clientY;
	  }
	*/
	  this.canvas.style.cursor = "grabbing";
	}
	
	handlePanMove(event) {
	  event.preventDefault();
	
		var xy = this.getCursorPos(event);
		this.getCursorReal(event);
		//console.log(xy);

	  if (this.panStartX === undefined || this.panStartY === undefined) {
		return;
	  }
		/*
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
	  */
	
	  const panSpeed = 1;
	
	  // Calculate the difference in X and Y positions
	  const dx = (xy[0] - this.panStartX) / this.scale;
	  const dy = (xy[1] - this.panStartY) / this.scale;
	
	  // Update the pan values
	  this.panX += dx * panSpeed;
	  this.panY += dy * panSpeed;
	
	  // Set the start positions for the next move
	  this.panStartX = xy[0];
	  this.panStartY = xy[1];

	  this.drawCanvas();
	}
	
	handlePanEnd(event) {
	  event.preventDefault();
	
	  this.panStartX = undefined;
	  this.panStartY = undefined;
	
	  this.canvas.style.cursor = "grab";
	}
	
	drawCanvas() 
    {

	}
}