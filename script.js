/* ==========================================================================
   Ahmad (oye-ahmad) - Interactive Portfolio Logic
   Features: Particle Swarm Canvas, Boustrophedon Path Planner Sim, Typing Effect,
             Skills Filter, Project Modals, Contact Toast
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. DYNAMIC YEAR IN FOOTER
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. HERO TYPING EFFECT
  const typingEl = document.getElementById('typing-text');
  const roles = [
    'Autonomous UAV Swarms 🚁',
    'ROS2 Robotics Architectures 🤖',
    'Embedded ESP32 Systems ⚡',
    'Computer Vision & AI 🧠',
    'Full-Stack Web & Mobile Apps 🌐'
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function typeRole() {
    if (!typingEl) return;
    const currentRole = roles[roleIdx];
    
    if (isDeleting) {
      typingEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 50;
    } else {
      typingEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      typeSpeed = 1800; // Pause at end
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400; // Pause before new word
    }

    setTimeout(typeRole, typeSpeed);
  }
  typeRole();

  // 3. BACKGROUND NETWORK PARTICLE CANVAS
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width, height;
    let particles = [];
    const maxParticles = 45;
    const maxDist = 130;

    function resizeBgCanvas() {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    }
    resizeBgCanvas();
    window.addEventListener('resize', resizeBgCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 242, 254, 0.5)';
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animateBg() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }

  // 4. INTERACTIVE UAV SWARM & BOUSTROPHEDON SIMULATOR CANVAS
  const simCanvas = document.getElementById('swarm-sim-canvas');
  if (simCanvas) {
    const sCtx = simCanvas.getContext('2d');
    let sWidth, sHeight;
    let mode = 'swarm'; // 'swarm' or 'sweep'
    let drones = [];
    let obstacles = [];
    let sweepLines = [];
    let sweepProgress = 0;

    function resizeSimCanvas() {
      const rect = simCanvas.parentElement.getBoundingClientRect();
      sWidth = simCanvas.width = rect.width;
      sHeight = simCanvas.height = rect.height;
      initSim();
    }

    class Drone {
      constructor(x, y) {
        this.x = x || Math.random() * (sWidth - 100) + 50;
        this.y = y || Math.random() * (sHeight - 100) + 50;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.targetX = this.x;
        this.targetY = this.y;
        this.haloRadius = 25;
        this.angle = 0;
      }

      update() {
        if (mode === 'swarm') {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 30 || this.x > sWidth - 30) this.vx *= -1;
          if (this.y < 30 || this.y > sHeight - 30) this.vy *= -1;

          // Avoid obstacles
          obstacles.forEach(obs => {
            const dx = this.x - obs.x;
            const dy = this.y - obs.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < obs.r + 30) {
              this.vx += (dx / dist) * 0.5;
              this.vy += (dy / dist) * 0.5;
            }
          });
        } else if (mode === 'sweep') {
          // Move smoothly along sweep path
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          this.x += dx * 0.05;
          this.y += dy * 0.05;
        }

        this.angle += 0.05;
      }

      draw() {
        // Draw Radar halo
        sCtx.beginPath();
        sCtx.arc(this.x, this.y, this.haloRadius, 0, Math.PI * 2);
        sCtx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
        sCtx.lineWidth = 1;
        sCtx.stroke();

        // Draw quadcopter arms
        sCtx.save();
        sCtx.translate(this.x, this.y);
        sCtx.rotate(this.angle);

        sCtx.strokeStyle = '#00f2fe';
        sCtx.lineWidth = 2;
        sCtx.beginPath();
        sCtx.moveTo(-12, -12); sCtx.lineTo(12, 12);
        sCtx.moveTo(12, -12); sCtx.lineTo(-12, 12);
        sCtx.stroke();

        // Rotors
        sCtx.fillStyle = '#10b981';
        [[-12, -12], [12, -12], [-12, 12], [12, 12]].forEach(([rx, ry]) => {
          sCtx.beginPath();
          sCtx.arc(rx, ry, 4, 0, Math.PI * 2);
          sCtx.fill();
        });

        // Center hub
        sCtx.beginPath();
        sCtx.arc(0, 0, 5, 0, Math.PI * 2);
        sCtx.fillStyle = '#7928ca';
        sCtx.fill();

        sCtx.restore();
      }
    }

    function generateSweepPath() {
      sweepLines = [];
      const step = 35;
      let direction = 1;

      for (let x = 40; x < sWidth - 40; x += step) {
        if (direction === 1) {
          sweepLines.push({ x1: x, y1: 40, x2: x, y2: sHeight - 40 });
        } else {
          sweepLines.push({ x1: x, y1: sHeight - 40, x2: x, y2: 40 });
        }
        direction *= -1;
      }
    }

    function initSim() {
      drones = [
        new Drone(sWidth * 0.2, sHeight * 0.3),
        new Drone(sWidth * 0.4, sHeight * 0.6),
        new Drone(sWidth * 0.6, sHeight * 0.2),
        new Drone(sWidth * 0.8, sHeight * 0.7),
        new Drone(sWidth * 0.5, sHeight * 0.5)
      ];
      obstacles = [
        { x: sWidth * 0.35, y: sHeight * 0.45, r: 35 },
        { x: sWidth * 0.7, y: sHeight * 0.35, r: 40 }
      ];
      generateSweepPath();
    }

    resizeSimCanvas();
    window.addEventListener('resize', resizeSimCanvas);

    // Canvas click to add obstacle
    simCanvas.addEventListener('click', (e) => {
      const rect = simCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      obstacles.push({ x: clickX, y: clickY, r: Math.random() * 20 + 25 });
    });

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    function renderSim() {
      sCtx.clearRect(0, 0, sWidth, sHeight);

      // Grid background pattern
      sCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      sCtx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < sWidth; x += gridSize) {
        sCtx.beginPath(); sCtx.moveTo(x, 0); sCtx.lineTo(x, sHeight); sCtx.stroke();
      }
      for (let y = 0; y < sHeight; y += gridSize) {
        sCtx.beginPath(); sCtx.moveTo(0, y); sCtx.lineTo(sWidth, y); sCtx.stroke();
      }

      // Draw Obstacles
      obstacles.forEach(obs => {
        sCtx.beginPath();
        sCtx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
        sCtx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        sCtx.fill();
        sCtx.strokeStyle = '#ef4444';
        sCtx.lineWidth = 2;
        sCtx.stroke();

        sCtx.fillStyle = '#ef4444';
        sCtx.font = '11px Space Grotesk';
        sCtx.fillText('Obstacle', obs.x - 22, obs.y + 4);
      });

      if (mode === 'sweep') {
        // Draw Lawnmower Boustrophedon sweep lines
        sCtx.beginPath();
        sCtx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        sCtx.lineWidth = 2;
        sCtx.setLineDash([5, 5]);

        sweepLines.forEach(line => {
          sCtx.moveTo(line.x1, line.y1);
          sCtx.lineTo(line.x2, line.y2);
        });
        sCtx.stroke();
        sCtx.setLineDash([]);

        // Update target positions along sweep
        sweepProgress = (sweepProgress + 0.005) % 1;
        drones.forEach((drone, idx) => {
          const targetLineIdx = Math.floor((sweepProgress * sweepLines.length + idx * 2) % sweepLines.length);
          const targetLine = sweepLines[targetLineIdx];
          if (targetLine) {
            drone.targetX = targetLine.x1;
            drone.targetY = targetLine.y1;
          }
        });
      }

      // Draw Drone Mesh Connections
      let commLinks = 0;
      for (let i = 0; i < drones.length; i++) {
        for (let j = i + 1; j < drones.length; j++) {
          const dx = drones[i].x - drones[j].x;
          const dy = drones[i].y - drones[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220) {
            commLinks++;
            sCtx.beginPath();
            sCtx.moveTo(drones[i].x, drones[i].y);
            sCtx.lineTo(drones[j].x, drones[j].y);
            sCtx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
            sCtx.lineWidth = 1.5;
            sCtx.stroke();
          }
        }
      }

      // Draw & Update Drones
      drones.forEach(drone => {
        drone.update();
        drone.draw();
      });

      // Update UI Metrics
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;
        const fpsEl = document.getElementById('sim-fps');
        if (fpsEl) fpsEl.textContent = `${fps} FPS`;
      }

      const activeNodesEl = document.getElementById('active-nodes-count');
      const meshLinksEl = document.getElementById('mesh-links-count');
      if (activeNodesEl) activeNodesEl.textContent = drones.length;
      if (meshLinksEl) meshLinksEl.textContent = commLinks;

      requestAnimationFrame(renderSim);
    }
    renderSim();

    // Controls Buttons Event Listeners
    const modeSwarmBtn = document.getElementById('mode-swarm-btn');
    const modeSweepBtn = document.getElementById('mode-sweep-btn');
    const addDroneBtn = document.getElementById('add-drone-btn');
    const resetSimBtn = document.getElementById('reset-sim-btn');

    if (modeSwarmBtn && modeSweepBtn) {
      modeSwarmBtn.addEventListener('click', () => {
        mode = 'swarm';
        modeSwarmBtn.classList.add('active');
        modeSweepBtn.classList.remove('active');
      });

      modeSweepBtn.addEventListener('click', () => {
        mode = 'sweep';
        modeSweepBtn.classList.add('active');
        modeSwarmBtn.classList.remove('active');
      });
    }

    if (addDroneBtn) {
      addDroneBtn.addEventListener('click', () => {
        if (drones.length < 15) {
          drones.push(new Drone());
        }
      });
    }

    if (resetSimBtn) {
      resetSimBtn.addEventListener('click', () => {
        initSim();
      });
    }
  }

  // 5. SKILLS FILTERING
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-category-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'block';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // 6. PROJECT MODAL POPUP DETAILS DATA & CONTROLLER
  const projectDetailsMap = {
    'uav-swarm': {
      title: 'AI-Powered Cooperative Drone Swarm (FYP)',
      subtitle: 'Multi-Agent Autonomous Area Coverage & Vision Pipeline',
      badge: 'Final Year Project',
      tech: ['ROS2', 'ArduPilot SITL', 'Gazebo', 'MAVSDK', 'YOLO', 'Python', 'C++'],
      repo: 'https://github.com/oye-ahmad/UAV_SWARM',
      content: `
        <p>Architected a decentralized cooperative drone swarm algorithm capable of autonomous area coverage and real-time object detection in dynamic search-and-rescue scenarios.</p>
        <h4 style="color: var(--accent-cyan); margin: 1.2rem 0 0.5rem;">Key Architecture Highlights:</h4>
        <ul style="color: var(--text-secondary); margin-left: 1.2rem; line-height: 1.7;">
          <li><strong>ROS2 Communication Mesh:</strong> Implemented publisher-subscriber topology for inter-drone state synchronization.</li>
          <li><strong>Boustrophedon Cellular Decomposition:</strong> Optimized sweep trajectory calculation avoiding polygonal obstacles.</li>
          <li><strong>Gazebo Multi-Vehicle SITL:</strong> Simulated 5+ UAV nodes with realistic aerodynamics and sensor payloads.</li>
          <li><strong>AI Vision Pipeline:</strong> Deployed lightweight YOLO detection models on simulated camera streams.</li>
        </ul>
      `
    },
    'boustrophedon': {
      title: 'Boustrophedon Coverage Algorithm with Obstacles',
      subtitle: 'Grid & Polygon Path Planning for Autonomous Field Sweeps',
      badge: 'Robotics Algorithm',
      tech: ['Python', 'Shapely', 'Matplotlib', 'Path Planning', 'Geometry'],
      repo: 'https://github.com/oye-ahmad/Boustrophedon-Coverage-Algorithm-with-obstacles',
      content: `
        <p>A high-efficiency coverage path planning algorithm designed for autonomous mobile robots and agricultural/surveillance UAV sweeps.</p>
        <h4 style="color: var(--accent-cyan); margin: 1.2rem 0 0.5rem;">Core Features:</h4>
        <ul style="color: var(--text-secondary); margin-left: 1.2rem; line-height: 1.7;">
          <li>Decomposes non-convex polygonal spaces into simple sub-cells.</li>
          <li>Generates back-and-forth lawnmower paths around complex obstacles.</li>
          <li>Provides mathematical proof of complete area coverage with minimal overlap.</li>
        </ul>
      `
    },
    'nisacare': {
      title: 'NisaCare - AI Health Companion for Women',
      subtitle: 'Accessible Healthcare Support & Medical AI Assistant',
      badge: 'Healthcare AI App',
      tech: ['JavaScript', 'HTML5', 'CSS3', 'REST API', 'UI/UX Design'],
      repo: 'https://github.com/oye-ahmad/NisaCare',
      content: `
        <p>NisaCare is an AI-empowered health assistance platform designed to provide accessible, empathetic, and confidential healthcare support tailored specifically for women's wellness.</p>
        <h4 style="color: var(--accent-cyan); margin: 1.2rem 0 0.5rem;">Platform Capabilities:</h4>
        <ul style="color: var(--text-secondary); margin-left: 1.2rem; line-height: 1.7;">
          <li>Interactive AI symptom checker and health guidance modules.</li>
          <li>Privacy-first data architecture with seamless user workflow.</li>
          <li>Responsive, modern dark/light glassmorphic user interface.</li>
        </ul>
      `
    },
    'firstaid': {
      title: 'Smart First-Aid Guide App',
      subtitle: 'AI-Assisted Emergency Guide & Step-by-Step Response',
      badge: 'Mobile App',
      tech: ['JavaScript', 'Mobile UX', 'AI Assistant', 'JSON Data'],
      repo: 'https://github.com/oye-ahmad/Smart-FirstAid-Guide-App',
      content: `
        <p>A modern, user-friendly mobile guide application engineered to assist users during critical emergency scenarios with instant visual safety instructions.</p>
        <h4 style="color: var(--accent-cyan); margin: 1.2rem 0 0.5rem;">Key Innovations:</h4>
        <ul style="color: var(--text-secondary); margin-left: 1.2rem; line-height: 1.7;">
          <li>Fast decision-tree emergency search for CPR, burns, fractures, and bites.</li>
          <li>Offline accessibility for remote field and outdoor emergencies.</li>
          <li>Voice and visual step prompts to guide non-medical responders.</li>
        </ul>
      `
    },
    'passport': {
      title: 'Passport Studio',
      subtitle: 'Browser-based Image Processing & ID Photo Tool',
      badge: 'Web Utility Tool',
      tech: ['JavaScript', 'HTML5 Canvas API', 'CSS3', 'Image Processing'],
      repo: 'https://github.com/oye-ahmad/Passport-Studio',
      content: `
        <p>A web browser utility allowing users to effortlessly prepare official passport-size photographs compliant with international standards.</p>
        <h4 style="color: var(--accent-cyan); margin: 1.2rem 0 0.5rem;">Features & Tech:</h4>
        <ul style="color: var(--text-secondary); margin-left: 1.2rem; line-height: 1.7;">
          <li>Client-side Canvas image scaling, aspect ratio lock, and background background adjustment.</li>
          <li>Zero server upload requirement — total user photo privacy.</li>
        </ul>
      `
    },
    'blender': {
      title: 'Blender 3D Hardware & CAD Work',
      subtitle: '3D Mechanical Concepts & UAV Component Renderings',
      badge: '3D Modeling Suite',
      tech: ['Blender', '3D CAD Modeling', 'Cycles Renderer', 'Animation'],
      repo: 'https://github.com/oye-ahmad/Blender-Work',
      content: `
        <p>A creative portfolio showcase of 3D mechanical models, UAV frame designs, hardware renders, and promotional animations created in Blender.</p>
        <h4 style="color: var(--accent-cyan); margin: 1.2rem 0 0.5rem;">Visual Portfolio:</h4>
        <ul style="color: var(--text-secondary); margin-left: 1.2rem; line-height: 1.7;">
          <li>Detailed quadcopter frame mechanical models with motor mount specifications.</li>
          <li>PBR materials, realistic lighting setups, and hardware exploded views.</li>
        </ul>
      `
    }
  };

  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContentEl = document.getElementById('modal-body-content');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const data = projectDetailsMap[projKey];

      if (data && modal && modalContentEl) {
        modalContentEl.innerHTML = `
          <span class="mono-tag" style="color: var(--accent-cyan);">${data.badge}</span>
          <h2 style="font-size: 1.8rem; margin: 0.4rem 0;">${data.title}</h2>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.2rem;">${data.subtitle}</p>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            ${data.tech.map(t => `<span class="skill-tag">${t}</span>`).join('')}
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1.2rem;">
            ${data.content}
          </div>

          <div style="margin-top: 2rem; display: flex; gap: 1rem;">
            <a href="${data.repo}" target="_blank" rel="noopener" class="btn btn-primary">
              <i class="fa-brands fa-github"></i> View GitHub Repo
            </a>
          </div>
        `;

        modal.classList.add('active');
      }
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // 7. CONTACT FORM SUBMISSION & TOAST NOTIFICATION
  const contactForm = document.getElementById('contact-form');
  const toastContainer = document.getElementById('toast-container');

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check" style="color: var(--accent-emerald); font-size: 1.2rem;"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      showToast(`Thank you, ${name}! Your message has been sent to Ahmad.`);
      contactForm.reset();
    });
  }

  // 8. ACTIVE NAVBAR SCROLL HIGHLIGHT
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
      if (window.scrollY >= secTop) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

});
