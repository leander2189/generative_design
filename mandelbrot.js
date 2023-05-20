var maxiterations = 2;

function load()
{
	var canvas = document.getElementById('canvas');
	//canvas.width  = window.innerWidth;
	//canvas.height = window.innerHeight;
	
	window.requestAnimationFrame(draw);
}

function draw()
{
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	const w = 4;
	const h = (w * canvas.height) / canvas.width;
  
	// Start at negative half the width and height
	const xmin = -0.5 -w/2;
	const ymin = -h/2;
	const xmax = xmin + w;
	const ymax = ymin + h;

	// Calculate amount we increment x,y for each pixel
	const dx = (xmax - xmin) / (canvas.width);
	const dy = (ymax - ymin) / (canvas.height);

	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	
	for (let j = 0; j < canvas.height; j++)
	{
		let y = ymin + j*dy;
		for (let i = 0; i < canvas.width; i++)
		{
			let x = xmin + i*dx;
			// Now we test, as we iterate z = z^2 + cm does z tend towards infinity?
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
				if (dist2(aa, bb, 0, 0) > 16*16) {
					break;  // Bail
				}
				n++;
			}

			// We color each pixel based on how long it takes to get to infinity
			// If we never got there, let's pick the color black
			const pix = (i+j*canvas.width)*4;
			
			// Negro sobre blanco
			const norm = map(n, 0, maxiterations, 1, 0);
			// Blanco sobre negro
			//const norm = map(n, 0, maxiterations, 0, 1);
			
			let min_value = Math.max(0, 255-maxiterations);
			let bright = 255 - map(norm*norm, 0, 1, min_value, 255);
			
			if (n == maxiterations) bright = 0;
			else {
				// Gosh, we could make fancy colors here if we wanted
				data[pix + 0] = bright;
				data[pix + 1] = bright;
				data[pix + 2] = bright;
				data[pix + 3] = 255;
			}
		}
	}
	ctx.putImageData(imageData, 0, 0);
	maxiterations = Math.ceil(maxiterations*1.2);
	
	if (maxiterations < 400)
	window.requestAnimationFrame(draw);
}

function dist(x1, y1, x2, y2) {
	return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

function dist2(x1, y1, x2, y2) {
	return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}

function map(v, xmin, xmax, zmin, zmax) {
	if (Math.abs(xmax-xmin) < 1e-5) return zmin;
	
	return (v-xmin)/(xmax-xmin)*(zmax-zmin)+zmin;
}