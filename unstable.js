class Unstable {
	r = 4;
	N = 10;
	//let points, f, v;
	scale = 20;

	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.ctx = this.canvas.getContext('2d');
		this.w = this.canvas.width;
		this.h = this.canvas.height;

		// Setup cell state:
		this.points = new Array(this.N);
		this.f = new Array(this.N);
		this.v = new Array(this.N);
		for (var i = 0; i < this.N; i++) {
			this.points[i] = new Array(2);
			this.f[i] = new Array(2);
			this.v[i] = new Array(2);

			this.points[i][0] = this.r * Math.cos(i * 2.0 * Math.PI / this.N);
			this.points[i][1] = this.r * Math.sin(i * 2.0 * Math.PI / this.N);


			//this.v[i][0] = 0; v[i][1] = 0;
			let noise = 0.01;
			this.v[i][0] = noise * (Math.random() - 0.5);
			this.v[i][1] = noise * (Math.random() - 0.5);
		}

		this.draw();
	}

	getNextState() {
		let k = 1;
		let l0 = 2;
		let dt = 0.1;

		let eps = 0.01;

		// Calculate "forces"
		for (var i = 0; i < this.N; i++) {
			let ii = (i - 1 + this.N) % this.N;
			var x1 = this.points[ii][0] - this.points[i][0];
			var y1 = this.points[ii][1] - this.points[i][1];
			var m1 = Math.sqrt(x1 * x1 + y1 * y1);

			var x2 = this.points[(i + 1) % this.N][0] - this.points[i][0];
			var y2 = this.points[(i + 1) % this.N][1] - this.points[i][1];
			var m2 = Math.sqrt(x2 * x2 + y2 * y2);

			this.f[i][0] = k * x1 / (m1 + eps) * (m1 - l0) + k * x2 / (m2 + eps) * (m2 - l0);
			this.f[i][1] = k * y1 / (m1 + eps) * (m1 - l0) + k * y2 / (m2 + eps) * (m2 - l0);
		}

		// Update velocities and positions
		for (var i = 0; i < this.N; i++) {
			this.f[i][0] *= 0.99;
			this.f[i][1] *= 0.99;

			this.points[i][0] += this.v[i][0] * dt + 0.5 * this.f[i][0] * dt * dt;
			this.points[i][1] += this.v[i][1] * dt + 0.5 * this.f[i][1] * dt * dt;
			this.v[i][0] += this.f[i][0] * dt;
			this.v[i][1] += this.f[i][1] * dt;

			var vabs = Math.sqrt(this.v[i][0] * this.v[i][0] + this.v[i][1] * this.v[i][1]);
			if (vabs / 5 > 1.0) {
				this.v[i][0] *= 5 / vabs;
				this.v[i][1] *= 5 / vabs;
			}
			//v[i][0] *= 0.999;
			//v[i][1] *= 0.999;
		}


	}


	draw() {
		// Limpiamos el canvas
		this.ctx.beginPath();
		this.ctx.globalAlpha = 0.2;
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.w, this.h);

		var xCen = this.w / 2;
		var yCen = this.h / 2;

		this.ctx.globalAlpha = 1.0;
		this.ctx.beginPath();
		this.ctx.strokeStyle = 'white';
		this.ctx.lineWidth = 1;

		for (let i = 0; i < this.N; i++) {

			this.ctx.moveTo(xCen + this.scale * this.points[i][0], yCen - this.scale * this.points[i][1]);
			this.ctx.lineTo(xCen + this.scale * this.points[(i + 1) % this.N][0], yCen - this.scale * this.points[(i + 1) % this.N][1]);
			this.ctx.stroke();
		}

		this.getNextState();
		window.requestAnimationFrame(this.draw.bind(this));
	}
}

