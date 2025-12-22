 /**
         * A complex particle system with 'Matrix' rain undertones and
         * network connectivity logic.
         */
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        let width, height;
        let particles = [];
        let matrixColumns = [];
        const mouse = { x: null, y: null, radius: 150 };

        // Configuration
        const config = {
            particleCount: 120,
            connectionDistance: 100,
            mouseRepelForce: 5,
            baseSpeed: 0.5,
            colorSpeed: 1,
            matrixFontSize: 14,
            matrixSpeed: 0.85
        };

        // Resize handling
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initMatrix();
        }
        
        window.addEventListener('resize', resize);
        
        // Mouse interaction
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mousedown', () => {
            particles.forEach(p => {
                const angle = Math.random() * Math.PI * 2;
                const force = Math.random() * 20 + 10;
                p.vx = Math.cos(angle) * force;
                p.vy = Math.sin(angle) * force;
            });
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        /* MATRIX RAIN CLASS */
        class MatrixSymbol {
            constructor(x, y, velocity, value) {
                this.x = x;
                this.y = y;
                this.velocity = velocity;
                this.value = value;
                this.switchInterval = Math.floor(Math.random() * 20 + 5);
                this.counter = 0;
            }

            draw() {
                ctx.fillStyle = '#0F0'; // Green text
                ctx.font = config.matrixFontSize + 'px monospace';
                ctx.fillText(this.value, this.x, this.y);

                if (this.y > height && Math.random() > 0.975) {
                    this.y = 0;
                }
                this.y += this.velocity;

                this.counter++;
                if (this.counter > this.switchInterval) {
                    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';
                    this.value = chars.charAt(Math.floor(Math.random() * chars.length));
                    this.counter = 0;
                }
            }
        }

        function initMatrix() {
            matrixColumns = [];
            const columns = width / config.matrixFontSize;
            for (let i = 0; i < columns; i++) {
                // Stagger starts
                const y = Math.random() * -height;
                const v = config.matrixSpeed + Math.random();
                matrixColumns.push(new MatrixSymbol(i * config.matrixFontSize, y, v, '0'));
            }
        }

        /* PARTICLE CLASS */
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * config.baseSpeed;
                this.vy = (Math.random() - 0.5) * config.baseSpeed;
                this.size = Math.random() * 3 + 1;
                this.hue = Math.random() * 360;
            }

            update() {
                // Basic movement
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction (Repulsion)
                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = forceDirectionX * force * config.mouseRepelForce;
                        const directionY = forceDirectionY * force * config.mouseRepelForce;

                        this.vx -= directionX;
                        this.vy -= directionY;
                    }
                }

                // Friction to return to normal speed
                this.vx *= 0.95; 
                this.vy *= 0.95;

                // Minimum speed maintenance
                if(Math.abs(this.vx) < 0.2) this.vx = (Math.random() - 0.5) * 1;
                if(Math.abs(this.vy) < 0.2) this.vy = (Math.random() - 0.5) * 1;

                this.hue += config.colorSpeed;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            // Semi-transparent fade for trailing effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Draw Matrix Background
            ctx.globalAlpha = 0.3; // Faint background
            matrixColumns.forEach(col => col.draw());
            ctx.globalAlpha = 1.0;

            // Update and Draw Particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Connect Particles
            connectParticles();

            requestAnimationFrame(animate);
        }

        function connectParticles() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.connectionDistance) {
                        ctx.strokeStyle = `hsl(${particles[a].hue}, 100%, 50%)`;
                        ctx.lineWidth = 1 - (distance/config.connectionDistance);
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Initialize
        resize();
        initParticles();
        animate();
