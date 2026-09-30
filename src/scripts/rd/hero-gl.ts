/**
 * Hero background: topographic contour lines (a blueprint of a landscape)
 * that swell around the pointer. Raw WebGL2, no dependencies.
 * Desktop only, paused when off-screen or when the tab is hidden.
 * The contours drift on their own for 4 s, then glide to a stop within 5 s (WCAG 2.2.2 Pause, Stop, Hide);
 * after that they only move in answer to the pointer, and settle again 1.5 s after it stops.
 * The hill under the pointer is "the hard part" of the headline.
 */

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPull;
uniform vec3 uInk;
uniform vec3 uAccent;
out vec4 outColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}
float contour(float k, float width) {
  float f = abs(fract(k + 0.5) - 0.5);
  float w = fwidth(k) * width;
  return 1.0 - smoothstep(0.0, w, f);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.y;
  vec2 m = uMouse / uRes.y;
  float d = distance(uv, m);
  // a wide hill rises under the pointer and pushes the lines apart
  float bump = exp(-d * d * 5.0) * uPull;

  float h = fbm(uv * 1.35 + vec2(uTime * 0.018, uTime * 0.011)) + bump * 0.55;
  float k = h * 18.0;
  float minor = contour(k, 1.2);
  float major = contour(k / 5.0, 2.0);
  // hypsometric bands in the accent, only on the hill
  float band = step(0.5, fract(k / 2.0));

  // fade towards the headline on the left, keep the right side lively; fade out at the bottom so
  // the hero has no hard edge and the lead, buttons and spec labels sit on a quiet ground
  float vignette = (smoothstep(0.25, 0.85, gl_FragCoord.x / uRes.x) * 0.85 + 0.15)
                 * smoothstep(0.0, 0.3, gl_FragCoord.y / uRes.y);
  float a = (minor * 0.34 + major * 0.62 + bump * minor * 0.5 + band * bump * 0.10) * vignette;
  vec3 col = mix(uInk, uAccent, clamp(bump * 1.8, 0.0, 1.0));
  outColor = vec4(col * a, a);
}`;

const hexToRgb = (value: string): [number, number, number] => {
  const probe = document.createElement("span");
  probe.style.color = value;
  document.body.append(probe);
  const [r, g, b] = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g)!.map(Number);
  probe.remove();
  return [r / 255, g / 255, b / 255];
};

export function initHeroGL(host: HTMLElement): () => void {
  let disposed = false;
  let dispose = () => { disposed = true; };
  // Compile in the background (KHR_parallel_shader_compile) so the main thread never stalls.
  build(host).then((cleanup) => {
    if (disposed) cleanup();
    else dispose = cleanup;
  });
  return () => { disposed = true; dispose(); };
}

async function build(host: HTMLElement): Promise<() => void> {
  const canvas = document.createElement("canvas");
  canvas.className = "hero-gl";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
  if (!gl) return () => {};
  host.prepend(canvas);

  const shader = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  const parallel = gl.getExtension("KHR_parallel_shader_compile");
  if (parallel) {
    while (!gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
      await new Promise((r) => setTimeout(r, 32));
    }
  }
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.remove();
    return () => {};
  }
  gl.useProgram(prog);

  // one big triangle covering the viewport
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse"), uPull = u("uPull"), uInk = u("uInk"), uAccent = u("uAccent");

  const syncColors = () => {
    const styles = getComputedStyle(document.documentElement);
    gl.uniform3fv(uInk, hexToRgb(styles.getPropertyValue("--ink").trim()));
    gl.uniform3fv(uAccent, hexToRgb(styles.getPropertyValue("--accent").trim()));
  };
  syncColors();
  const themeObserver = new MutationObserver(() => { syncColors(); loop(); }); // redraw even when at rest
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-accent"] });

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize();
  const ro = new ResizeObserver(() => { resize(); loop(); });
  ro.observe(host);

  // pointer, eased
  const mouse = { x: -1e4, y: -1e4, tx: -1e4, ty: -1e4, pull: 0, target: 0 };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) * dpr;
    mouse.ty = (r.bottom - e.clientY) * dpr;
    if (mouse.x < -1e3) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    mouse.target = 1;
    calmAt = Math.max(calmAt, performance.now() + 1500);
    loop();
  };
  const onLeave = () => { mouse.target = 0; loop(); };
  host.addEventListener("pointermove", onMove, { passive: true });
  host.addEventListener("pointerleave", onLeave);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) loop(); });
  io.observe(host);

  let raf = 0;
  let last = performance.now();
  let calmAt = last + 4000; // autonomous drift ends here, then a 1 s glide to rest
  let t = 0; // drift clock: advances only while there is energy
  const frame = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(now - last, 50) / 1000;
    last = now;
    const energy = Math.min(1, Math.max(0, (calmAt + 1000 - now) / 1000)) ** 2;
    t += dt * energy;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    mouse.pull += (mouse.target - mouse.pull) * 0.04;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uPull, mouse.pull);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const settled = energy === 0 && Math.abs(mouse.target - mouse.pull) < 0.002 &&
      Math.abs(mouse.tx - mouse.x) < 0.5 && Math.abs(mouse.ty - mouse.y) < 0.5;
    if (!settled) loop(); // at rest: stop drawing until the pointer moves again
  };
  const loop = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };
  const onVisibility = () => loop();
  document.addEventListener("visibilitychange", onVisibility);
  loop();

  requestAnimationFrame(() => {
    canvas.classList.add("is-on");
    host.classList.add("has-terrain"); // shows the "point anywhere" hint, where there is one
  });

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    themeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerleave", onLeave);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
    host.classList.remove("has-terrain");
  };
}
