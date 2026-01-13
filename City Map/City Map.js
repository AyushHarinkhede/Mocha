    const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });
        const statsEl = document.getElementById('stats'); 

        // --- CONFIGURATION ---
        const TILE_SIZE = 40;
        const GRID_SIZE = 60; // 60x60 map
        const ROAD_density = 0.4;
        
        let width, height;
        let camera = { x: 0, y: 0, zoom: 1 };
        let isDragging = false;
        let lastMouse = { x: 0, y: 0 };
        let time = 0; // Day/Night cycle

        // Map Data
        const map = []; // 2D array of tile types
        const entities = []; // Cars, peds
        
        // Tile Types
        const TYPES = {
            GRASS: 0,
            ROAD: 1,
            HOUSE: 2,
            APARTMENT: 3,
            OFFICE: 4,
            PARK: 5,
            WATER: 6
        };

        // --- INITIALIZATION ---

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            // Center camera initially
            camera.x = (GRID_SIZE * TILE_SIZE * camera.zoom - width) / 2;
            camera.y = (GRID_SIZE * TILE_SIZE * camera.zoom - height) / 2;
        }
        window.addEventListener('resize', resize);

        function initCity() {
            entities.length = 0;
            // 1. Fill with Grass
            for(let y=0; y<GRID_SIZE; y++) {
                map[y] = [];
                for(let x=0; x<GRID_SIZE; x++) {
                    map[y][x] = { type: TYPES.GRASS, variant: Math.random() };
                }
            }

            // 2. Generate Roads (Grid Layout)
            // Create main avenues
            const roadsX = [];
            const roadsY = [];
            
            // Randomly place roads
            for(let i=5; i<GRID_SIZE-5; i+= Math.floor(Math.random() * 4 + 4)) {
                roadsX.push(i);
                for(let y=0; y<GRID_SIZE; y++) map[y][i].type = TYPES.ROAD;
            }
            for(let i=5; i<GRID_SIZE-5; i+= Math.floor(Math.random() * 4 + 4)) {
                roadsY.push(i);
                for(let x=0; x<GRID_SIZE; x++) map[i][x].type = TYPES.ROAD;
            }

            // 3. Zoning (Fill the gaps)
            for(let y=1; y<GRID_SIZE-1; y++) {
                for(let x=1; x<GRID_SIZE-1; x++) {
                    if(map[y][x].type === TYPES.ROAD) continue;

                    // Count nearby roads to decide density
                    let roadCount = 0;
                    if(map[y+1][x].type === TYPES.ROAD) roadCount++;
                    if(map[y-1][x].type === TYPES.ROAD) roadCount++;
                    if(map[y][x+1].type === TYPES.ROAD) roadCount++;
                    if(map[y][x-1].type === TYPES.ROAD) roadCount++;

                    if (roadCount > 0) {
                        // Near road: Building
                        const rand = Math.random();
                        if (rand > 0.9) map[y][x].type = TYPES.OFFICE; // Skyscrapers
                        else if (rand > 0.6) map[y][x].type = TYPES.APARTMENT; // Mid density
                        else if (rand > 0.3) map[y][x].type = TYPES.HOUSE; // Low density
                        else map[y][x].type = TYPES.PARK; // Pocket parks
                    } else {
                        // Far from road: Park or Forest
                        map[y][x].type = TYPES.PARK;
                    }
                }
            }

            // 4. Spawn Cars
            // Find all road tiles
            const roadTiles = [];
            for(let y=0; y<GRID_SIZE; y++) {
                for(let x=0; x<GRID_SIZE; x++) {
                    if(map[y][x].type === TYPES.ROAD) roadTiles.push({x, y});
                }
            }
            
            for(let i=0; i<200; i++) {
                const t = roadTiles[Math.floor(Math.random() * roadTiles.length)];
                entities.push(new Car(t.x, t.y));
            }

            // 5. Spawn Humans
            const walkTiles = [];
             for(let y=0; y<GRID_SIZE; y++) {
                for(let x=0; x<GRID_SIZE; x++) {
                    if(map[y][x].type === TYPES.PARK || map[y][x].type === TYPES.GRASS) walkTiles.push({x, y});
                }
            }
            for(let i=0; i<300; i++) {
                const t = walkTiles[Math.floor(Math.random() * walkTiles.length)];
                entities.push(new Human(t.x, t.y));
            }

            updateStats();
        }

        function updateStats() {
            const cars = entities.filter(e => e instanceof Car).length;
            const humans = entities.filter(e => e instanceof Human).length;
            statsEl.innerText = `Cars: ${cars} | Citizens: ${humans} | Time: ${Math.floor(time)%24}:00`;
        }

        // --- CLASSES ---

        class Car {
            constructor(gx, gy) {
                this.x = gx * TILE_SIZE + TILE_SIZE/2;
                this.y = gy * TILE_SIZE + TILE_SIZE/2;
                // Random direction: 0:right, 1:down, 2:left, 3:up
                this.dir = Math.floor(Math.random() * 4);
                this.speed = Math.random() * 1 + 1;
                this.color = ['#e74c3c', '#3498db', '#f1c40f', '#ecf0f1'][Math.floor(Math.random()*4)];
                this.width = 12;
                this.length = 20;
                this.stopTimer = 0;
            }

            update() {
                if (this.stopTimer > 0) {
                    this.stopTimer--;
                    return;
                }

                // Move based on direction
                let dx = 0, dy = 0;
                if (this.dir === 0) dx = this.speed;
                if (this.dir === 1) dy = this.speed;
                if (this.dir === 2) dx = -this.speed;
                if (this.dir === 3) dy = -this.speed;

                this.x += dx;
                this.y += dy;

                // Check center of tile for decision making
                const gx = Math.floor(this.x / TILE_SIZE);
                const gy = Math.floor(this.y / TILE_SIZE);
                
                // Keep within bounds
                if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) {
                    this.dir = (this.dir + 2) % 4; // Turn around
                    return;
                }

                // Logic at center of tile
                const centerX = gx * TILE_SIZE + TILE_SIZE/2;
                const centerY = gy * TILE_SIZE + TILE_SIZE/2;
                const dist = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);

                if (dist < this.speed) {
                    // We are at an intersection/center of tile
                    this.x = centerX;
                    this.y = centerY;

                    // Look ahead
                    const choices = [];
                    // Check Right
                    if (gx+1 < GRID_SIZE && map[gy][gx+1].type === TYPES.ROAD && this.dir !== 2) choices.push(0);
                    // Check Down
                    if (gy+1 < GRID_SIZE && map[gy+1][gx].type === TYPES.ROAD && this.dir !== 3) choices.push(1);
                    // Check Left
                    if (gx-1 >= 0 && map[gy][gx-1].type === TYPES.ROAD && this.dir !== 0) choices.push(2);
                    // Check Up
                    if (gy-1 >= 0 && map[gy-1][gx].type === TYPES.ROAD && this.dir !== 1) choices.push(3);

                    if (choices.length > 0) {
                        // 10% chance to stop randomly (traffic)
                        if (Math.random() < 0.05) this.stopTimer = 30;

                        // Prefer going straight if possible
                        if (choices.includes(this.dir) && Math.random() > 0.2) {
                            // Keep going straight
                        } else {
                            // Turn
                            this.dir = choices[Math.floor(Math.random() * choices.length)];
                        }
                    } else {
                        // Dead end, turn around
                        this.dir = (this.dir + 2) % 4;
                    }
                }
            }

            draw(ctx) {
                ctx.save();
                ctx.translate(this.x, this.y);
                // Rotate based on direction
                if (this.dir === 1) ctx.rotate(Math.PI/2);
                if (this.dir === 2) ctx.rotate(Math.PI);
                if (this.dir === 3) ctx.rotate(-Math.PI/2);

                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(-this.length/2 + 2, -this.width/2 + 2, this.length, this.width);

                // Body
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.length/2, -this.width/2, this.length, this.width);
                
                // Headlights (at night)
                const isNight = Math.sin(time) < 0;
                if (isNight) {
                    ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
                    ctx.beginPath();
                    ctx.moveTo(this.length/2, -5);
                    ctx.lineTo(this.length/2 + 40, -15);
                    ctx.lineTo(this.length/2 + 40, 15);
                    ctx.lineTo(this.length/2, 5);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        class Human {
            constructor(gx, gy) {
                this.x = gx * TILE_SIZE + Math.random() * TILE_SIZE;
                this.y = gy * TILE_SIZE + Math.random() * TILE_SIZE;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.color = `hsl(${Math.random()*360}, 60%, 70%)`;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Change direction randomly
                if (Math.random() < 0.02) {
                    this.vx = (Math.random() - 0.5) * 0.5;
                    this.vy = (Math.random() - 0.5) * 0.5;
                }

                // Bounds checking (stay in non-road tiles mostly)
                const gx = Math.floor(this.x / TILE_SIZE);
                const gy = Math.floor(this.y / TILE_SIZE);
                
                if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) {
                    this.vx *= -1; this.vy *= -1;
                } else if (map[gy][gx].type === TYPES.ROAD) {
                    // Turn away from road
                    this.vx *= -1; 
                    this.vy *= -1;
                }
            }

            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // --- RENDER LOOP ---

        function drawTile(x, y, type, variant, isNight) {
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            // Ground
            if (type === TYPES.GRASS || type === TYPES.PARK) {
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            } else if (type === TYPES.ROAD) {
                ctx.fillStyle = '#34495e';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                
                // Road Markings
                ctx.fillStyle = '#555';
                ctx.fillRect(px + TILE_SIZE/2 - 2, py, 4, 4);
                ctx.fillRect(px + TILE_SIZE/2 - 2, py+10, 4, 4);
                ctx.fillRect(px + TILE_SIZE/2 - 2, py+20, 4, 4);
                ctx.fillRect(px + TILE_SIZE/2 - 2, py+30, 4, 4);
                
                ctx.fillRect(px, py + TILE_SIZE/2 - 2, 4, 4);
                ctx.fillRect(px+10, py + TILE_SIZE/2 - 2, 4, 4);
                ctx.fillRect(px+20, py + TILE_SIZE/2 - 2, 4, 4);
                ctx.fillRect(px+30, py + TILE_SIZE/2 - 2, 4, 4);
                return; // Roads have no buildings
            } else {
                // Building base ground
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            }

            // Structures
            if (type === TYPES.PARK) {
                // Trees
                ctx.fillStyle = '#218c53';
                ctx.beginPath();
                ctx.arc(px + TILE_SIZE/2, py + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI*2);
                ctx.fill();
                ctx.strokeStyle = '#1e7d4a';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            else if (type === TYPES.HOUSE) {
                // House Body
                ctx.fillStyle = '#e67e22';
                ctx.fillRect(px + 8, py + 8, TILE_SIZE - 16, TILE_SIZE - 16);
                // Roof
                ctx.fillStyle = '#d35400';
                ctx.beginPath();
                ctx.moveTo(px + 4, py + 8);
                ctx.lineTo(px + TILE_SIZE/2, py);
                ctx.lineTo(px + TILE_SIZE - 4, py + 8);
                ctx.fill();
            }
            else if (type === TYPES.APARTMENT) {
                // Tall block
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                
                // Windows
                ctx.fillStyle = isNight ? '#f1c40f' : '#2c3e50';
                if(Math.random() > 0.5) ctx.fillRect(px + 8, py + 8, 8, 8);
                if(Math.random() > 0.5) ctx.fillRect(px + 24, py + 8, 8, 8);
                if(Math.random() > 0.5) ctx.fillRect(px + 8, py + 24, 8, 8);
                if(Math.random() > 0.5) ctx.fillRect(px + 24, py + 24, 8, 8);
            }
            else if (type === TYPES.OFFICE) {
                // Skyscraper
                ctx.fillStyle = '#3498db';
                ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                // Glass effect
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(px + 2, py + 2, TILE_SIZE/2 - 2, TILE_SIZE - 4);
                
                // Night lights
                if (isNight) {
                    ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
                    const lights = Math.floor(variant * 10); // Random lights
                    for(let i=0; i<lights; i++) {
                        ctx.fillRect(px + Math.random()*20+5, py + Math.random()*20+5, 4, 4);
                    }
                }
            }
        }

        function draw() {
            // Update Time
            time += 0.005;
            const brightness = Math.sin(time); // -1 to 1
            const isNight = brightness < 0;

            // Clear Background
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            // Apply Camera
            ctx.translate(-camera.x, -camera.y);
            ctx.scale(camera.zoom, camera.zoom);

            // Determine visible range (Optimization)
            // Only draw tiles inside the screen
            const startCol = Math.floor(camera.x / (TILE_SIZE * camera.zoom));
            const endCol = startCol + (width / (TILE_SIZE * camera.zoom)) + 1;
            const startRow = Math.floor(camera.y / (TILE_SIZE * camera.zoom));
            const endRow = startRow + (height / (TILE_SIZE * camera.zoom)) + 1;

            // Draw Map
            for(let y = Math.max(0, startRow); y < Math.min(GRID_SIZE, endRow + 1); y++) {
                for(let x = Math.max(0, startCol); x < Math.min(GRID_SIZE, endCol + 1); x++) {
                    drawTile(x, y, map[y][x].type, map[y][x].variant, isNight);
                }
            }

            // Draw Entities
            for(let e of entities) {
                e.update();
                // Optimization: simple bound check before draw
                // Note: accurate culling requires transform logic, skipping for simplicity in this demo
                e.draw(ctx);
            }

            // Night Overlay
            if (isNight) {
                ctx.fillStyle = `rgba(0, 0, 50, ${Math.abs(brightness) * 0.4})`;
                ctx.fillRect(camera.x/camera.zoom, camera.y/camera.zoom, width/camera.zoom + 1000, height/camera.zoom + 1000); // Hacky fullscreen fill relative to camera
            }

            ctx.restore();

            updateStats();
            requestAnimationFrame(draw);
        }

        // --- INPUT HANDLING ---

        canvas.addEventListener('mousedown', e => {
            isDragging = true;
            lastMouse = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener('mouseup', () => isDragging = false);

        window.addEventListener('mousemove', e => {
            if (isDragging) {
                const dx = e.clientX - lastMouse.x;
                const dy = e.clientY - lastMouse.y;
                camera.x -= dx;
                camera.y -= dy;
                lastMouse = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('wheel', e => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            if (e.deltaY < 0) camera.zoom += zoomSpeed;
            else camera.zoom -= zoomSpeed;
            camera.zoom = Math.max(0.2, Math.min(3, camera.zoom));
        }, { passive: false });

        window.addEventListener('keydown', e => {
            if (e.code === 'Space') {
                initCity();
            }
        });

        // Start
        resize();
        initCity();
        draw();
