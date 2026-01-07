        /**
         * LUNA THE SPACE GIRL
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
        
        // Character State
        const girl = {
            x: 0,
            y: 0,
            targetY: 0,
            hoverOffset: 0,
            blinkTimer: 0,
            isBlinking: false,
            isHappy: false,
            happyTimer: 0,
            hairAngle: 0
        }; 

        // Stars for background
        const stars = [];

        // Setup
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            girl.x = width / 2;
            girl.y = height / 2;
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

        // --- CHARACTER LOGIC ---

        function triggerJump() {
            if(girl.isHappy) return;
            girl.isHappy = true;
            girl.happyTimer = 0;
            // "Jump" velocity logic handled in update
        }

        function updateGirl() {
            // 1. Hovering Motion (Sine Wave)
            const hoverSpeed = 0.05;
            const hoverHeight = 15;
            girl.hoverOffset = Math.sin(frame * hoverSpeed) * hoverHeight;

            // 2. Jump Logic
            let jumpOffset = 0;
            if (girl.isHappy) {
                girl.happyTimer += 0.1;
                // Simple parabolic jump
                jumpOffset = -Math.sin(girl.happyTimer) * 100; 
                if (girl.happyTimer >= Math.PI) {
                    girl.isHappy = false;
                    girl.happyTimer = 0;
                }
            }

            // 3. Blinking Logic
            girl.blinkTimer--;
            if (girl.blinkTimer <= 0) {
                girl.isBlinking = !girl.isBlinking;
                // Randomize next blink
                girl.blinkTimer = girl.isBlinking ? 5 : Math.random() * 200 + 50;
            }

            // 4. Hair/Bow Physics
            // The bow drags slightly behind the movement
            let targetAngle = (mouse.x - width/2) * 0.001;
            girl.hairAngle += (targetAngle - girl.hairAngle) * 0.1;
            
            // Add wobbling
            girl.hairAngle += Math.sin(frame * 0.2) * 0.05;

            // Final Position Calculation
            girl.drawY = girl.y + girl.hoverOffset + jumpOffset;
        }

        function drawGirl() {
            const gx = girl.x;
            const gy = girl.drawY;
            
            // --- SHADOW ---
            // Shadow gets smaller when girl goes higher
            const shadowScale = 1 - (girl.hoverOffset + (girl.isHappy ? 50 : 0)) / 200;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(gx, girl.y + 130, 50 * shadowScale, 12 * shadowScale, 0, 0, Math.PI*2);
            ctx.fill();


            ctx.save();
            ctx.translate(gx, gy);

            // --- HAIR (Back) ---
            ctx.fillStyle = '#4a3121'; // Dark brown hair
            ctx.beginPath();
            ctx.arc(0, -20, 55, Math.PI, 0); // Top arc
            ctx.lineTo(60, 60);
            ctx.quadraticCurveTo(0, 80, -60, 60);
            ctx.lineTo(-55, -20);
            ctx.fill();

            // --- DRESS/BODY ---
            let grad = ctx.createLinearGradient(-50, -50, 50, 100);
            grad.addColorStop(0, '#ff80ab'); // Pink
            grad.addColorStop(1, '#c51162'); // Darker Pink

            ctx.fillStyle = grad;
            ctx.beginPath();
            // Dress shape
            ctx.moveTo(-35, 0);
            ctx.lineTo(-50, 80); // Skirt flare left
            ctx.quadraticCurveTo(0, 95, 50, 80); // Bottom hem
            ctx.lineTo(35, 0); // Skirt flare right
            ctx.lineTo(35, -30); // Torso right
            ctx.quadraticCurveTo(0, -40, -35, -30); // Neckline
            ctx.lineTo(-35, 0); // Torso left
            ctx.fill();
            
            // --- HEAD/FACE ---
            ctx.fillStyle = '#f5d0c5'; // Skin tone
            ctx.beginPath();
            ctx.ellipse(0, -30, 40, 45, 0, 0, Math.PI*2);
            ctx.fill();

            // Blush
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-25, -20, 8, 5, 0, 0, Math.PI*2);
            ctx.ellipse(25, -20, 8, 5, 0, 0, Math.PI*2);
            ctx.fill();

             // --- HAIR (Bangs/Front) ---
            ctx.fillStyle = '#4a3121';
            ctx.beginPath();
            ctx.moveTo(-40, -50);
            ctx.quadraticCurveTo(-20, -20, 0, -50);
            ctx.quadraticCurveTo(20, -20, 40, -50);
            ctx.lineTo(45, -65);
            ctx.quadraticCurveTo(0, -85, -45, -65);
            ctx.fill();

            // --- BOW (Replaces Antenna) ---
            ctx.save();
            ctx.translate(0, -65);
            ctx.rotate(girl.hairAngle);
            ctx.fillStyle = '#ffeb3b'; // Yellow bow
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.quadraticCurveTo(-20, -15, -25, -5);
            ctx.quadraticCurveTo(-15, 10, 0, 5);
            ctx.quadraticCurveTo(15, 10, 25, -5);
            ctx.quadraticCurveTo(20, -15, 0, 0);
            ctx.fill();
            // Bow center knot
            ctx.fillStyle = '#fbc02d'; 
            ctx.beginPath();
            ctx.arc(0,0, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();


            // --- EYES ---
            
            // Calculate Eye Look Direction
            const dx = mouse.x - gx;
            const dy = mouse.y - gy;
            const angle = Math.atan2(dy, dx);
            const dist = Math.min(5, Math.sqrt(dx*dx + dy*dy) * 0.03); // Limit pupil movement
            
            const pupilX = Math.cos(angle) * dist;
            const pupilY = Math.sin(angle) * dist;

            function drawEye(xOffset) {
                ctx.fillStyle = '#fff'; // White sclera
                
                if (girl.isBlinking) {
                    // Draw closed eye (line)
                    ctx.strokeStyle = '#4a3121';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(xOffset - 8, -30);
                    ctx.quadraticCurveTo(xOffset, -25, xOffset + 8, -30);
                    ctx.stroke();
                } else {
                    // Normal Eye (Circle)
                    ctx.beginPath();
                    ctx.arc(xOffset, -30, 8, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Iris/Pupil
                    ctx.fillStyle = girl.isHappy ? '#2196f3' : '#8d6e63'; // Blue happy, brown normal
                    ctx.beginPath();
                    ctx.arc(xOffset + pupilX, -30 + pupilY, 4.5, 0, Math.PI*2);
                    ctx.fill();

                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(xOffset + pupilX, -30 + pupilY, 2.5, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Tiny reflection
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(xOffset + pupilX - 1.5, -30 + pupilY - 1.5, 1.5, 0, Math.PI*2);
                    ctx.fill();
                }
            }

            drawEye(-15); // Left Eye
            drawEye(15);  // Right Eye

            // --- MOUTH ---
            ctx.strokeStyle = '#d8786a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (girl.isHappy) {
                ctx.arc(0, -10, 8, 0.2, Math.PI - 0.2); // Big smile
            } else {
                ctx.arc(0, -8, 5, 0.5, Math.PI - 0.5); // Small smile
            }
            ctx.stroke();

            ctx.restore();
        }

        // --- ARMS ---
        function drawArms() {
            const gx = girl.x;
            const gy = girl.drawY;

            ctx.strokeStyle = '#f5d0c5'; // Skin tone
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';

            // Left Arm
            const swing = Math.sin(frame * 0.1) * 10;
            
            ctx.beginPath();
            ctx.moveTo(gx - 30, gy - 20); // Shoulder
            if(girl.isHappy) {
                // Arms up!
                ctx.quadraticCurveTo(gx - 50, gy - 50, gx - 40, gy - 70);
            } else {
                // Arms floating
                ctx.quadraticCurveTo(gx - 50, gy + 10, gx - 55 + swing, gy + 30);
            }
            ctx.stroke();

            // Right Arm
            ctx.beginPath();
            ctx.moveTo(gx + 30, gy - 20); // Shoulder
            if(girl.isHappy) {
                // Arms up!
                ctx.quadraticCurveTo(gx + 50, gy - 50, gx + 40, gy - 70);
            } else {
                // Arms floating
                ctx.quadraticCurveTo(gx + 50, gy + 10, gx + 55 - swing, gy + 30);
            }
            ctx.stroke();
        }

        // --- MAIN LOOP ---
        function animate() {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, width, height);

            drawStars();
            updateGirl();
            
            // Draw order (Layers)
            drawArms(); // Behind body
            drawGirl(); // Body & Head

            frame++;
            requestAnimationFrame(animate);
        }

        // Initialize
        resize();
        animate();
