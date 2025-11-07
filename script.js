const canvas = document.getElementById('neural-grid');
const ctx = canvas.getContext('2d');

const config = {
  baseNodes: 70,
  maxDistance: 150,
  nodeSpeed: 0.2,
  pulseFrequency: 0.0025,
};

let nodes = [];
let width = window.innerWidth;
let height = window.innerHeight;
let mouse = { x: width / 2, y: height / 2, active: false };

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(dpr, dpr);
  seedNodes();
}

function seedNodes() {
  const count = Math.floor(config.baseNodes * (width / 1200)) + 16;
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * config.nodeSpeed,
    vy: (Math.random() - 0.5) * config.nodeSpeed,
    size: Math.random() * 2.5 + 0.4,
    phase: Math.random() * Math.PI * 2,
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  nodes.forEach((node, _, array) => {
    node.x += node.vx;
    node.y += node.vy;
    node.phase += config.pulseFrequency;

    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;

    const distToMouse = Math.hypot(node.x - mouse.x, node.y - mouse.y);
    if (mouse.active && distToMouse < 180) {
      const force = (180 - distToMouse) / 180;
      node.vx += ((node.x - mouse.x) / distToMouse) * force * 0.015;
      node.vy += ((node.y - mouse.y) / distToMouse) * force * 0.015;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(123, 255, 177, ${0.25 + Math.sin(node.phase) * 0.2})`;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(123, 255, 177, 0.45)';
    ctx.arc(node.x, node.y, node.size + Math.sin(node.phase) * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    array.forEach((target) => {
      if (node === target) return;
      const dx = node.x - target.x;
      const dy = node.y - target.y;
      const dist = Math.hypot(dx, dy);
      if (dist < config.maxDistance) {
        const opacity = 0.22 - (dist / config.maxDistance) * 0.22;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(79, 116, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(draw);
}

resizeCanvas();
draw();

window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  mouse.active = true;
});

window.addEventListener('mouseleave', () => {
  mouse.active = false;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

document.querySelectorAll('.project-card, .cap-card').forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const { left, top, width: w, height: h } = card.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const rotateX = ((y - h / 2) / h) * -8;
    const rotateY = ((x - w / 2) / w) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

document.getElementById('current-year').textContent = new Date().getFullYear();
