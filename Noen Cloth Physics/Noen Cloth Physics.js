  /**
         * VERLET INTEGRATION CLOTH SIMULATION
         * -----------------------------------
         * This script simulates a physics system without explicit velocity storage.
         * Velocity is derived implicitly from (Current_Position - Previous_Position).
         * This makes the simulation extremely stable for interconnected constraints (cloth).
         */

        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        // Configuration
        const config = {
            friction: 0.99,
            gravity: 0.4,
            spacing: 18,     // Distance between nodes
            tearSensitivity: 60, // Distance required to snap a link manually
            iterations: 5,   // Physics accuracy (higher = stiffer cloth)
            mouseInfluenceRadius: 40,
            renderPoints: false
        };

        const points = [];
        const sticks = [];

        // --- CLASSES ---

        class Point {
            constructor(x, y, pinned = false) {
                this.x = x;
                this.y = y;
                this.oldx = x; // Previous X for velocity calc
                this.oldy = y; // Previous Y for velocity calc
                this.pinned = pinned; // If true, unaffected by physics
                this.originalX = x; // For reset logic if needed
                this.originalY = y;
            }

            update() {
                if (this.pinned) return;

                // Calculate velocity based on difference from last frame
                const vx = (this.x - this.oldx) * config.friction;
                const vy = (this.y - this.oldy) * config.friction;

                // Update old position before moving
                this.oldx = this.x;
                this.oldy = this.y;

                // Apply velocity and gravity
                this.x += vx;
                this.y += vy;
                this.y += config.gravity;

                // Floor collision
                if (this.y > height) {
                    this.y = height;
                    // Simple friction on floor
                    const floorFriction = 0.5;
                    this.oldx = this.x + (this.oldx - this.x) * floorFriction;
                }
                
                // Wall collisions
                if (this.x > width) {
                    this.x = width;
                    this.oldx = this.x + (this.oldx - this.x) * 0.5;
                } else if (this.x < 0) {
                    this.x = 0;
                    this.oldx = this.x + (this.oldx - this.x) * 0.5;
                }
            }

            // Manually set position (for mouse dragging)
            setPos(x, y) {
                this.x = x;
                this.y = y;
                // Reset velocity to zero-ish so it doesn't shoot off when released
                this.oldx = x; 
                this.oldy = y;
            }
        }

        class Stick {
            constructor(p1, p2) {
                this.p1 = p1;
                this.p2 = p2;
                // Calculate initial resting distance
                this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                this.active = true; // Can be "broken"
            }

            update() {
                if (!this.active) return;

                const dx = this.p2.x - this.p1.x;
                const dy = this.p2.y - this.p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Prevent division by zero
                if (dist === 0) return;

                // Calculate the difference from the resting length (how stretched/compressed it is)
                const diff = this.length - dist;
                const percent = diff / dist / 2; // Split the correction between two points
                
                const offsetX = dx * percent;
                const offsetY = dy * percent;

                // Move points towards each other to satisfy constraint
                if (!this.p1.pinned) {
                    this.p1.x -= offsetX;
                    this.p1.y -= offsetY;
                }
                if (!this.p2.pinned) {
                    this.p2.x += offsetX;
                    this.p2.y += offsetY;
                }
            }

            draw() {
                if (!this.active) return;

                const dx = this.p2.x - this.p1.x;
                const dy = this.p2.y - this.p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Color based on tension (stretch)
                // Resting = Blue/Cyan, Stretched = Purple/Pink/White
                const strain = Math.max(0, dist - this.length);
                const strainCap = 10; // Visual cap
                const r = Math.min(255, (strain / strainCap) * 255);
                const g = Math.max(0, 247 - (strain / strainCap) * 200);
                const b = 255;
                
                // Add glow if stretched
                if(strain > 2) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.p1.x, this.p1.y);
                ctx.lineTo(this.p2.x, this.p2.y);
                ctx.stroke();
                
                ctx.shadowBlur = 0; // Reset
            }
        }

        // --- SETUP ---

        function createCloth() {
            // Grid dimensions
            const cols = Math.floor(width / config.spacing) - 4;
            const rows = Math.min(30, Math.floor(height / config.spacing) - 4);
            
            const startX = (width - (cols * config.spacing)) / 2;
            const startY = 50;

            // Create Points
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const px = startX + x * config.spacing;
                    const py = startY + y * config.spacing;
                    // Pin the top row
                    const p = new Point(px, py, y === 0);
                    points.push(p);
                }
            }

            // Create Sticks (Constraints)
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const i = y * cols + x;
                    
                    // Connect to right neighbor
                    if (x < cols - 1) {
                        sticks.push(new Stick(points[i], points[i + 1]));
                    }
                    
                    // Connect to bottom neighbor
                    if (y < rows - 1) {
                        sticks.push(new Stick(points[i], points[i + cols]));
                    }
                }
            }
        }

        // --- MOUSE INTERACTION ---

        const mouse = { x: 0, y: 0, isDown: false, button: 0 };
        let draggedPoint = null;
        // For the laser cutter trail
        const cutTrail = [];

        window.addEventListener('mousedown', (e) => {
            mouse.isDown = true;
            mouse.button = e.button;
            
            // If Left Click, try to grab a point
            if (e.button === 0 && !e.shiftKey) {
                let nearest = null;
                let minDist = config.mouseInfluenceRadius;
                
                for (const p of points) {
                    const dx = p.x - e.clientX;
                    const dy = p.y - e.clientY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = p;
                    }
                }
                draggedPoint = nearest;
            }
        });

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            // Laser Cutter Logic (Right Click or Shift+Drag)
            if (mouse.isDown && (mouse.button === 2 || e.shiftKey)) {
                cutTrail.push({x: mouse.x, y: mouse.y, life: 10});
                
                // Check for line intersections with sticks
                // Simple approach: Check if mouse is close to a stick center
                for (const s of sticks) {
                    if (!s.active) continue;
                    const midX = (s.p1.x + s.p2.x) / 2;
                    const midY = (s.p1.y + s.p2.y) / 2;
                    const dx = midX - mouse.x;
                    const dy = midY - mouse.y;
                    if (dx*dx + dy*dy < 100) { // Radius squared
                        s.active = false;
                    }
                }
            }
        });

        window.addEventListener('mouseup', () => {
            mouse.isDown = false;
            draggedPoint = null;
        });

        window.addEventListener('contextmenu', e => e.preventDefault());
        window.addEventListener('wheel', e => {
            config.gravity += e.deltaY * 0.001;
            config.gravity = Math.max(-1, Math.min(2, config.gravity));
        });
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            points.length = 0;
            sticks.length = 0;
            createCloth();
        });

        // --- MAIN LOOP ---

        function update() {
            // Update points
            for (const p of points) {
                p.update();
            }

            // Dragging Logic
            if (draggedPoint) {
                draggedPoint.setPos(mouse.x, mouse.y);
            }

            // Solve Constraints (Multiple iterations for stiffness)
            for (let i = 0; i < config.iterations; i++) {
                for (const s of sticks) {
                    s.update();
                }
            }

            // Render
            ctx.clearRect(0, 0, width, height);
            
            // Draw Sticks
            ctx.lineCap = 'round';
            for (const s of sticks) {
                s.draw();
            }

            // Draw Laser Trail
            if (cutTrail.length > 0) {
                ctx.strokeStyle = '#ff0055';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#ff0055';
                ctx.beginPath();
                for (let i = 0; i < cutTrail.length; i++) {
                    const t = cutTrail[i];
                    if (i === 0) ctx.moveTo(t.x, t.y);
                    else ctx.lineTo(t.x, t.y);
                    t.life--;
                }
                ctx.stroke();
                // Remove dead trail points
                while (cutTrail.length > 0 && cutTrail[0].life <= 0) {
                    cutTrail.shift();
                }
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(update);
        }

        // Init
        createCloth();
        update();
