var W = 1024, H = 512;

class FractalGL extends PanZoomCanvas 
{
	constructor(canvasId) 
	{
		super(canvasId, true);

        this.initialized = false;
        this.zoomMax = 10000;

		const w = 4;
		const h = (w * this.canvas.height) / this.canvas.width;
		const axes = [-0.5-w/2, -0.5+w/2, -h/2, h/2 ];
        this.setLimits(axes[0], axes[1], axes[2], axes[3]);
  
		this.maxiterations = 10000;

        this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
        this.checkCompatibility(this.gl);

        this.init();
		this.drawCanvas();
	}

    async init()
    {
        const shader_files = [
            'mandelbrot_webgl/mandelbrot.vert',
            'mandelbrot_webgl/mandelbrot.frag'
        ];
        const files = await Promise.all(shader_files.map(this.loadFile));

        var vertex_shader = this.createShader(this.gl, this.gl.VERTEX_SHADER, files[0]);
        var render_shader = this.createShader(this.gl, this.gl.FRAGMENT_SHADER, files[1]);
        this.render_prog = this.createAndLinkProgram(this.gl, vertex_shader, render_shader);

        this.gl.useProgram(this.render_prog);
        this.loadVertexData(this.gl, this.render_prog);
        this.gl.uniform2f(this.gl.getUniformLocation(this.render_prog, "u_size"), this.canvas.width, this.canvas.height);

        const axes = this.getLimits();
        const sx = (axes[1] - axes[0])/this.canvas.width;
        const sy = (axes[3] - axes[2])/this.canvas.height;

        this.gl.uniform2f(this.gl.getUniformLocation(this.render_prog, "offset"), axes[0], axes[2]);
        this.gl.uniform2f(this.gl.getUniformLocation(this.render_prog, "scale"), sx, sy);

        this.initialized = true;
        this.drawCanvas();
    }

    drawCanvas() 
    {
        if (!this.initialized) return;

        const gl = this.gl;
        const limits = this.getLimits();
		const xmin = limits[0];
		const xmax = limits[1];
		const ymin = limits[2];
		const ymax = limits[3];
        var sx = (xmax - xmin)/this.canvas.width;
        var sy = (ymax - ymin)/this.canvas.height;

        this.gl.uniform2f(this.gl.getUniformLocation(this.render_prog, "offset"), xmin, -ymax);
        this.gl.uniform2f(this.gl.getUniformLocation(this.render_prog, "scale"), sx, sy);

        gl.useProgram(this.render_prog);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

    loadFile(url)
    {
        return fetch(url).then(res => res.text());
    }
    
    checkCompatibility(gl) {
        if (!gl) fail("WebGL is not supported");

        var float_texture_ext = gl.getExtension("OES_texture_float");
        if (!float_texture_ext) fail("Your browser does not support the WebGL extension OES_texture_float");
        window.float_texture_ext = float_texture_ext; // Hold onto it

        var max_texture_size = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        if (max_texture_size < 512) fail("Your browser only supports "+max_texture_size+"×"+max_texture_size+" WebGL textures");
    }
    
    loadVertexData(gl, prog) {
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

        var a_position = gl.getAttribLocation(prog, "a_position");
        gl.enableVertexAttribArray(a_position);
        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    }

    createAndLinkProgram(gl, vertex_shader, fragment_shader) {
        var prog = gl.createProgram();
        gl.attachShader(prog, vertex_shader);
        gl.attachShader(prog, fragment_shader);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            fail("Failed to link program: " + gl.getProgramInfoLog(prog));
        }
        return prog;
    }

    createShader(gl, shader_type, shader_text) {
        var shader = gl.createShader(shader_type);
        gl.shaderSource(shader, shader_text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var err = gl.getShaderInfoLog(shader);
            this.fail("Failed to compile shader: " + err);
        }
        return shader
    }


    fail(message) {
        var fail = document.createElement("p");
        fail.id = "fail";
        fail.appendChild(document.createTextNode(message));
        document.body.removeChild(document.getElementById("canvas"));
        document.body.appendChild(fail);
        throw message;
    }
}