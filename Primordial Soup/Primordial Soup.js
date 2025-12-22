        /**
         * PARTICLE LIFE SIMULATION
         * ------------------------
         * This simulation works on a force-based interaction matrix.
         * There are N types of particles.
         * A matrix defines the attraction/repulsion force between Type A and Type B.
         * * Complex structures (membranes, chains, spinners) emerge automatically
         * from these simple local rules.
         */ 

        const canvas = document.getElementById('sim');
        const ctx = canvas.getContext('2d', { alpha: false }); // Alpha false for performance
        const statusEl = document.getElementById('status');

        let width, height; 
        
        // Configuration
        const config = {
            atomCount: 1400, // Number of particles
            types: 4,        // Number of distinct colors
            baseRadius: 200, // Interaction radius
            viscosity: 0.7,  // Friction (0-1)
            slowMo: false
        };

        // The "Atoms"
        let atoms = [];
        // The Rules (Interaction Matrix)
        let rules = []; 
        // Colors for the types
        const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6', '#ecf0f1'];

        // Mouse interaction
        const mouse = { x: -1000, y: -1000, down: false };

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        // --- CORE LOGIC ---

        // 1. Define the Laws of Physics for this "Universe"
        function randomizeRules() {
            rules = [];
            for (let i = 0; i < config.types; i++) {
                rules[i] = [];
                for (let j = 0; j < config.types; j++) {
                    // Random force between -1 (repel) and 1 (attract)
                    // We bias it slightly towards attraction to encourage clumping
                    let force = (Math.random() * 2 - 1); 
                    rules[i][j] = force;
                }
            }
            statusEl.innerText = "Universe Rules Randomized.";
            statusEl.style.color = "#4deeea";
            setTimeout(() => statusEl.style.color = "#aaa", 500);
        }

        // 2. Create the Particles
        function initAtoms() {
            atoms = [];
            for (let i = 0; i < config.atomCount; i++) {
                atoms.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: 0,
                    vy: 0,
                    type: Math.floor(Math.random() * config.types) // 0 to 3
                });
            }
        }

        // 3. The Physics Loop (The "Long Line" Logic)
        function update() {
            // Clear canvas manually for speed
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, width, height);

            // Double loop: Every atom interacts with every atom nearby
            // This is O(N^2), but optimized by distance checks
            
            const factor = config.slowMo ? 0.1 : 1.0;

            for (let i = 0; i < atoms.length; i++) {
                let fx = 0;
                let fy = 0;
                const a = atoms[i];

                for (let j = 0; j < atoms.length; j++) {
                    if (i === j) continue; // Don't interact with self
                    
                    const b = atoms[j];
                    
                    // Toroidal wrapping (Pac-man edges) for distance calc
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;

                    // Wrap distance calculations
                    if (dx > width * 0.5) dx -= width;
                    if (dx < -width * 0.5) dx += width;
                    if (dy > height * 0.5) dy -= height;
                    if (dy < -height * 0.5) dy += height;

                    const distSq = dx*dx + dy*dy;
                    
                    // Optimization: Only calculate if within interaction radius
                    if (distSq > 0 && distSq < config.baseRadius * config.baseRadius) {
                        const dist = Math.sqrt(distSq);
                        
                        // The Magic Force Formula
                        // We get the rule G from the matrix [a.type][b.type]
                        const g = rules[a.type][b.type];
                        
                        // Force calculation: 1/dist interaction
                        // If dist is very small, we repel strongly (collision)
                        // otherwise we apply the rule G
                        
                        let f = 0;
                        if (dist < 10) {
                            // Too close! Universal repulsion to prevent stacking
                            f = -3; 
                        } else {
                            // Apply specific rule force
                            // Force curve peaks at specific distance
                            f = g * (1 / dist); 
                        }

                        fx += (dx / dist) * f;
                        fy += (dy / dist) * f;
                    }
                }

                // Mouse Repulsion Field
                if (mouse.down) {
                    let mdx = mouse.x - a.x;
                    let mdy = mouse.y - a.y;
                    let mdistSq = mdx*mdx + mdy*mdy;
                    if (mdistSq < 150*150) {
                        let mdist = Math.sqrt(mdistSq);
                        fx -= (mdx / mdist) * 2;
                        fy -= (mdy / mdist) * 2;
                    }
                }

                // Apply Physics
                a.vx = (a.vx + fx) * config.viscosity * factor;
                a.vy = (a.vy + fy) * config.viscosity * factor;
                
                a.x += a.vx * factor;
                a.y += a.vy * factor;

                // Screen Wrapping (Teleport to other side)
                if (a.x <= 0) a.x += width;
                if (a.x >= width) a.x -= width;
                if (a.y <= 0) a.y += height;
                if (a.y >= height) a.y -= height;

                // Draw Particle
                // We draw squares instead of circles for performance at high counts
                ctx.fillStyle = colors[a.type];
                ctx.fillRect(a.x, a.y, 3, 3);
            }

            requestAnimationFrame(update);
        }

        // --- INPUTS ---

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            randomizeRules(); // God Mode: Change the laws of physics
            // Add a visual flash
            ctx.fillStyle = 'white';
            ctx.fillRect(0,0,width,height);
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) mouse.down = true;
            if (e.button === 1) config.slowMo = !config.slowMo;
        });
        window.addEventListener('mouseup', () => mouse.down = false);
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') config.slowMo = !config.slowMo;
        });


        // --- START ---
        randomizeRules();
        initAtoms();
        update();
