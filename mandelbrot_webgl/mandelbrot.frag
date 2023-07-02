precision highp float;
uniform vec2 u_size;
uniform vec2 offset;
uniform vec2 scale;

const int maxiterations = 100;

vec3 inferno(float t) {

    const vec3 c0 = vec3(0.0002189403691192265, 0.001651004631001012, -0.01948089843709184);
    const vec3 c1 = vec3(0.1065134194856116, 0.5639564367884091, 3.932712388889277);
    const vec3 c2 = vec3(11.60249308247187, -3.972853965665698, -15.9423941062914);
    const vec3 c3 = vec3(-41.70399613139459, 17.43639888205313, 44.35414519872813);
    const vec3 c4 = vec3(77.162935699427, -33.40235894210092, -81.80730925738993);
    const vec3 c5 = vec3(-71.31942824499214, 32.62606426397723, 73.20951985803202);
    const vec3 c6 = vec3(25.13112622477341, -12.24266895238567, -23.07032500287172);

    return c0+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))));

}

int mandelbrot(vec2 p)
{
	float a = p.x;
	float b = p.y;
	for (int n = 0; n < maxiterations; n++)
	{
		float aa = a * a;
		float bb = b * b;
		float twoab = 2.0 * a * b;
		a = aa - bb + p.x;
		b = twoab + p.y;

		if (aa + bb > 16.0*16.0) return n;
	}
	return maxiterations;
}

void main() 
{
	float x = (gl_FragCoord.x * scale.x) + offset.x;
	float y = (gl_FragCoord.y * scale.y) + offset.y;

	int n = mandelbrot(vec2(x, y));
	float v = 0.0;
	if (n < maxiterations - 1)
		v = float(n) / float(maxiterations);

	vec3 col = inferno(v);
	gl_FragColor = vec4(col, 1);
}