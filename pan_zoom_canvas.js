class PanZoomCanvas 
{
	constructor(canvasId) 
    {
        this.canvas = document.getElementById(canvasId);
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

        // Should be called from the child class
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
	
	drawCanvas() 
    {

	}
}