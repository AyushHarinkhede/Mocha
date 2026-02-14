        /**
         * B0-B THE ROBOT
         * A procedural character animation.
         * * Instead of loading an image (PNG/JPG), we "paint" the character
         * every single frame using .arc(), .rect(), and .bezierCurveTo().
         * This allows every body part to move independently.
         */

        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');

        let width, height;
        let frame = 0; 

        // Mouse State
        const mouse = { x: 0, y: 0 };
        
        // Robot State
        const robot = {
            x: 0,
            y: 0,
            targetY: 0,
            hoverOffset: 0,
            blinkTimer: 0,
            isBlinking: false,
            isHappy: false,
            happyTimer: 0,
            antennaAngle: 0
        };

        // Stars for background
        const stars = [];

        // Setup
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            robot.x = width / 2;
            robot.y = height / 2;
            initStars();
        }
        window.addEventListener('resize', resize);
        
        // Input Listeners
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        
        window.addEventListener('mousedown', () => {
            triggerJump();
        });

        // --- BACKGROUND LOGIC ---
        function initStars() {
            stars.length = 0;
            for(let i=0; i<100; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2,
                    speed: Math.random() * 0.5 + 0.1
                });
            }
        }

        function drawStars() {
            ctx.fillStyle = '#fff';
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
                ctx.fill();
                
                // Move stars (Parallax effect)
                // Stars move slightly opposite to mouse to create depth
                let moveX = (mouse.x - width/2) * 0.01 * star.speed;
                let moveY = (mouse.y - height/2) * 0.01 * star.speed;
                
                star.x -= moveX * 0.1; 
                star.y -= moveY * 0.1;

                // Wrap around screen
                if(star.x < 0) star.x = width;
                if(star.x > width) star.x = 0;
                if(star.y < 0) star.y = height;
                if(star.y > height) star.y = 0;
            });
        }

        // --- ROBOT LOGIC ---

        function triggerJump() {
            if(robot.isHappy) return;
            robot.isHappy = true;
            robot.happyTimer = 0;
            
            // "Jump" velocity logic handled in update
        }

        function updateRobot() {
            // 1. Hovering Motion (Sine Wave)
            const hoverSpeed = 0.05;
            const hoverHeight = 15;
            robot.hoverOffset = Math.sin(frame * hoverSpeed) * hoverHeight;

            // 2. Jump Logic
            let jumpOffset = 0;
            if (robot.isHappy) {
                robot.happyTimer += 0.1;
                // Simple parabolic jump
                jumpOffset = -Math.sin(robot.happyTimer) * 100; 
                if (robot.happyTimer >= Math.PI) {
                    robot.isHappy = false;
                    robot.happyTimer = 0;
                }
            }

            // 3. Blinking Logic
            robot.blinkTimer--;
            if (robot.blinkTimer <= 0) {
                robot.isBlinking = !robot.isBlinking;
                // Randomize next blink
                robot.blinkTimer = robot.isBlinking ? 5 : Math.random() * 200 + 50;
            }

            // 4. Antenna Physics
            // The antenna drags slightly behind the movement
            let targetAngle = (mouse.x - width/2) * 0.001;
            robot.antennaAngle += (targetAngle - robot.antennaAngle) * 0.1;
            
            // Add wobbling
            robot.antennaAngle += Math.sin(frame * 0.2) * 0.05;

            // Final Position Calculation
            robot.drawY = robot.y + robot.hoverOffset + jumpOffset;
        }

        function drawRobot() {
            const rx = robot.x;
            const ry = robot.drawY;
            
            // --- SHADOW ---
            // Shadow gets smaller when robot goes higher
            const shadowScale = 1 - (robot.hoverOffset + (robot.isHappy ? 50 : 0)) / 200;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(rx, robot.y + 120, 60 * shadowScale, 15 * shadowScale, 0, 0, Math.PI*2);
            ctx.fill();


            // --- ANTENNA ---
            ctx.save();
            ctx.translate(rx, ry - 60);
            ctx.rotate(robot.antennaAngle);
            
            // Stem
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.quadraticCurveTo(10, -30, 0, -50);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#888';
            ctx.stroke();

            // Glowing Ball
            ctx.beginPath();
            ctx.arc(0, -50, 8, 0, Math.PI*2);
            ctx.fillStyle = robot.isHappy ? '#ff0' : '#f05';
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
            ctx.restore();


            // --- BODY (The Chassis) ---
            ctx.save();
            ctx.translate(rx, ry);
            
            // Main Gradient
            let grad = ctx.createLinearGradient(-50, -50, 50, 100);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.5, '#e0e0e0');
            grad.addColorStop(1, '#999');

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Custom egg shape using bezier curves
            ctx.moveTo(0, -70); // Top center
            ctx.bezierCurveTo(70, -70, 80, 50, 0, 80); // Right side to bottom
            ctx.bezierCurveTo(-80, 50, -70, -70, 0, -70); // Left side to top
            ctx.fill();
            
            // Shine/Reflection on head
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.ellipse(-25, -45, 10, 20, Math.PI/4, 0, Math.PI*2);
            ctx.fill();


            // --- FACE / SCREEN ---
            ctx.fillStyle = '#111';
            ctx.beginPath();
            // Screen shape
            ctx.moveTo(-40, -30);
            ctx.bezierCurveTo(-40, -60, 40, -60, 40, -30);
            ctx.bezierCurveTo(40, 20, -40, 20, -40, -30);
            ctx.fill();

            // Screen glow (inner)
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.shadowBlur = 0;


            // --- EYES ---
            
            // Calculate Eye Look Direction
            // We clamp the movement so eyes stay inside the face
            const dx = mouse.x - rx;
            const dy = mouse.y - ry;
            const angle = Math.atan2(dy, dx);
            const dist = Math.min(10, Math.sqrt(dx*dx + dy*dy) * 0.05); // Limit pupil movement
            
            const pupilX = Math.cos(angle) * dist;
            const pupilY = Math.sin(angle) * dist;

            const eyeColor = robot.isHappy ? '#0f0' : '#0ff'; // Green if happy, Cyan normal

            function drawEye(xOffset) {
                // Sclera (The glowing shape)
                ctx.fillStyle = eyeColor;
                ctx.shadowColor = eyeColor;
                ctx.shadowBlur = 15;
                
                if (robot.isBlinking) {
                    // Draw closed eye (line)
                    ctx.fillRect(xOffset - 15, -10, 30, 2);
                } else if (robot.isHappy) {
                    // Draw Happy Eye (inverted U)
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = eyeColor;
                    ctx.beginPath();
                    ctx.arc(xOffset, -10, 10, Math.PI, 0); // Arch
                    ctx.stroke();
                } else {
                    // Normal Eye (Circle)
                    ctx.beginPath();
                    ctx.arc(xOffset, -10, 12, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Pupil (Internal mechanical part)
                    ctx.fillStyle = '#000';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(xOffset + pupilX, -10 + pupilY, 4, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Tiny reflection
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(xOffset + pupilX - 2, -10 + pupilY - 2, 1.5, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            }

            drawEye(-20); // Left Eye
            drawEye(20);  // Right Eye

            ctx.restore();
        }

        // --- ARMS ---
        function drawArms() {
            const rx = robot.x;
            const ry = robot.drawY;

            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';

            // Left Arm
            // Swings slightly opposite to hover
            const swing = Math.sin(frame * 0.1) * 10;
            
            ctx.beginPath();
            ctx.moveTo(rx - 70, ry);
            if(robot.isHappy) {
                // Arms up!
                ctx.quadraticCurveTo(rx - 90, ry - 40, rx - 100, ry - 80);
            } else {
                // Arms floating
                ctx.quadraticCurveTo(rx - 90, ry + 20, rx - 90 + swing, ry + 30);
            }
            ctx.stroke();

            // Right Arm
            ctx.beginPath();
            ctx.moveTo(rx + 70, ry);
            if(robot.isHappy) {
                // Arms up!
                ctx.quadraticCurveTo(rx + 90, ry - 40, rx + 100, ry - 80);
            } else {
                // Arms floating
                ctx.quadraticCurveTo(rx + 90, ry + 20, rx + 90 - swing, ry + 30);
            }
            ctx.stroke();
        }

        // --- MAIN LOOP ---
        function animate() {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            drawStars();
            updateRobot();
            
            // Draw order matters (Layers)
            drawArms(); // Behind body
            drawRobot(); // Body

            frame++;
            requestAnimationFrame(animate);
        }

        // Initialize
        resize();
        animate();