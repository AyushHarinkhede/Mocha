    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let width, height, centerX, centerY;
    let particles = [];
    const particleCount = 600; // Total particles (multiplied by 8 visual symmetry)
    let hueBase = 0;
    let zOff = 0; // Time dimension for noise
    
    // Noise config
    let noiseScale = 0.005;
    let noiseStrength = 20;

    // Mouse interaction
    const mouse = { x: null, y: null, active: false };

    // Setup Canvas
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        centerX = width / 2;
        centerY = height / 2;
        
        // Clear screen black on resize
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
    }

    // A simple pseudo-random noise function (trigonometric)
    // Returns a value between -1 and 1
    function getNoise(x, y, z) {
        return Math.sin(x * noiseScale + z) * Math.cos(y * noiseScale + z);
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            // Spawn randomly within the quadrant
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            
            // Random previous position (for smooth lines)
            this.px = this.x;
            this.py = this.y;
            
            this.speed = Math.random() * 2 + 1;
            this.life = Math.random() * 100 + 100; // Frames to live
            this.hue = Math.random() * 60 - 30; // Local color variance
            this.width = Math.random() * 1.5 + 0.5;
        }

        update() {
            // Calculate flow angle from noise
            let angle = getNoise(this.x, this.y, zOff) * Math.PI * 4;

            // Mouse Interaction: If mouse is close, swirl around it
            if (mouse.active) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 200) {
                    const angleToMouse = Math.atan2(dy, dx);
                    angle = angleToMouse + Math.PI; // Move away/swirl
                }
            }

            // Move
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;

            // Decaying life
            this.life--;
            if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
        }

        draw() {
            // We calculate the position relative to center
            const rx = this.x - centerX;
            const ry = this.y - centerY;
            
            const color = `hsla(${hueBase + this.hue}, 80%, 60%, 0.1)`; // Low opacity for trails
            
            ctx.lineWidth = this.width;
            ctx.strokeStyle = color;
            ctx.lineCap = 'round';

            // KALEIDOSCOPE EFFECT: Draw 8 times rotated
            ctx.save();
            ctx.translate(centerX, centerY);
            
            for (let i = 0; i < 8; i++) {
                ctx.rotate(Math.PI / 4); // 45 degrees
                ctx.beginPath();
                // Draw line from previous relative pos to current relative pos
                ctx.moveTo(this.px - centerX, this.py - centerY);
                ctx.lineTo(rx, ry);
                ctx.stroke();
                
                // Add a mirror for perfect symmetry (16-way effectively)
                ctx.save();
                ctx.scale(1, -1);
                ctx.beginPath();
                ctx.moveTo(this.px - centerX, this.py - centerY);
                ctx.lineTo(rx, ry);
                ctx.stroke();
                ctx.restore();
            }
            
            ctx.restore();

            // Update previous position
            this.px = this.x;
            this.py = this.y;
        }
    }

    // Init
    window.addEventListener('resize', resize);
    resize();
    
    for(let i=0; i<particleCount; i++) {
        particles.push(new Particle());
    }

    // Input Handling
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    
    window.addEventListener('mousedown', () => {
        noiseScale *= 2; // Scramble the field
        setTimeout(() => noiseScale /= 2, 200);
        // Push particles away
        particles.forEach(p => {
            p.x += (Math.random() - 0.5) * 100;
            p.y += (Math.random() - 0.5) * 100;
            p.px = p.x; p.py = p.y; // Reset trails to avoid long streaks
        });
    });

    window.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            ctx.fillStyle = '#000';
            ctx.fillRect(0,0,width,height);
            hueBase = Math.random() * 360;
            noiseScale = Math.random() * 0.01 + 0.002;
            particles.forEach(p => p.reset());
        }
    });

    // Animation Loop
    function animate() {
        // Slowly fade out the background (creates the trails)
        // Adjust the 0.05 value: Lower = longer trails, Higher = shorter trails
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; 
        ctx.fillRect(0, 0, width, height);

        // Evolve the noise field slowly
        zOff += 0.003;
        
        // Cycle colors
        hueBase += 0.2;

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();