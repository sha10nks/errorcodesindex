type Particle = {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

function pickUnique<T>(arr: T[], count: number): T[] {
  if (count <= 0) return [];
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  const out: T[] = [];
  const seen = new Set<T>();
  for (const v of copy) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
    if (out.length >= count) break;
  }
  return out;
}

export function initFinderBackground(args: { root: HTMLElement; canvas: HTMLCanvasElement; codes: string[] }) {
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (prefersReduced) {
    args.canvas.style.display = 'none';
    return;
  }

  const canvas = args.canvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const codePool = pickUnique(
    args.codes
      .map((c) => String(c || '').trim())
      .filter(Boolean)
      .filter((c) => c.length <= 18),
    Math.min(Math.max(7, Math.floor(7 + Math.random() * 8)), 14)
  );

  if (!codePool.length) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let running = true;
  let last = performance.now();

  const particles: Particle[] = codePool.map((text) => {
    const size = 10 + Math.random() * 10;
    const speed = 18 + Math.random() * 38;
    const angle = Math.random() * Math.PI * 2;
    return {
      text,
      x: Math.random() * 1,
      y: Math.random() * 1,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      alpha: 0.22 + Math.random() * 0.24,
    };
  });

  const resize = () => {
    const rect = args.root.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const p of particles) {
      if (p.x <= 1) p.x = Math.random() * width;
      if (p.y <= 1) p.y = Math.random() * height;
      if (p.x > width) p.x = width - 8;
      if (p.y > height) p.y = height - 8;
    }
  };

  const draw = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const pad = 12;
      if (p.x < pad) {
        p.x = pad;
        p.vx = Math.abs(p.vx);
      }
      if (p.x > width - pad) {
        p.x = width - pad;
        p.vx = -Math.abs(p.vx);
      }
      if (p.y < pad) {
        p.y = pad;
        p.vy = Math.abs(p.vy);
      }
      if (p.y > height - pad) {
        p.y = height - pad;
        p.vy = -Math.abs(p.vy);
      }

      ctx.globalAlpha = p.alpha;
      ctx.font = `${p.size}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
      ctx.fillStyle = '#10d061';
      ctx.fillText(p.text, p.x, p.y);
    }

    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  };

  const io = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = entry.isIntersecting;
      if (next === running) return;
      running = next;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(raf);
      }
    },
    { threshold: 0.05 }
  );

  const ro = new ResizeObserver(() => resize());

  resize();
  io.observe(args.root);
  ro.observe(args.root);
  raf = requestAnimationFrame(draw);

  const cleanup = () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
  };

  window.addEventListener('pagehide', cleanup, { once: true });
}

