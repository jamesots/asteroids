interface Pos {
    x: number;
    y: number;
}
interface Vector {
    direction: number;
    speed: number;
}
interface Asteroid {
    position: Pos;
    vector: Vector;
    rotation: number;
    scale: number;
}
interface Explosion {
    position: Pos;
    age: number;
    size: number;
    color: string;
}

function init() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    // const gl = canvas.getContext('webgl');
    const ctx = canvas.getContext('2d');

    // if (gl === null) {
    //     alert('Can\'t do 3d.');
    //     return;
    // }

    if (ctx === null) {
        alert('Can\'t do 2d');
        return;
    }

    // gl.clearColor(1.0, 0.0, 0.0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    const shipPosition = {
        x: 320, 
        y: 240,
    };
    const shipVector = {
        direction: 0,
        speed: 0,
    };
    const laserPosition = {
        x: 0,
        y: 0,
    }
    const laserVector = {
        direction: 0,
        speed: 15,
    }
    let laser = 0;
    let asteroids: Asteroid[] = [];
    let explosions: Explosion[] = [];
    let level = 1;
    let lives = 3;
    let score = 0;

    let lastTimestamp: number | undefined = undefined;

    function createAsteroid() {
        const direction = Math.random() * Math.PI * 2;
        asteroids.push({
            position: {
                x: Math.sin(direction) * 370 + 320,
                y: Math.cos(direction) * 290 + 240,
            },
            vector: {
                direction: Math.random() * Math.PI * 2,
                speed: 2,
            },
            rotation: Math.random() * Math.PI * 2,
            scale: 4,
        })
    }

    function drawAsteroid(asteroid: Asteroid) {
        ctx!.save();
        ctx!.strokeStyle = 'grey';
        ctx!.fillStyle = '#202020';
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.translate(asteroid.position.x, asteroid.position.y);
        ctx!.rotate(asteroid.vector.direction + Math.PI / 2);
        ctx!.scale(asteroid.scale, asteroid.scale);
        ctx!.rotate(asteroid.rotation);
        ctx!.moveTo(-1.1, 9.9);
        ctx!.lineTo(2.8, 5.9);
        ctx!.lineTo(6.5, 7.2);
        ctx!.lineTo(9.8, 1.1);
        ctx!.lineTo(4.5, -2.6);
        ctx!.lineTo(3.2, -8.7);
        ctx!.lineTo(-7.1, -7.4);
        ctx!.lineTo(-9.8, -5);
        ctx!.lineTo(-3.8, 0);
        ctx!.lineTo(-5.2, 4.7);
        ctx!.lineTo(-1.1, 9.9);
        ctx!.closePath();
        ctx!.stroke();
        ctx!.fill();
        ctx!.restore();        
    }

    function drawExplosion(explosion: Explosion) {
        ctx!.save();
        ctx!.strokeStyle = explosion.color;
        ctx!.beginPath();
        ctx!.translate(explosion.position.x, explosion.position.y);
        ctx!.scale(explosion.size, explosion.size);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i + ((Math.random() * 2) * Math.PI / 4);
            const start = Math.random();
            const end = 3 + Math.random() * 4;
            ctx!.moveTo(
                Math.cos(angle) * start,
                Math.sin(angle) * start 
            ),
            ctx!.lineTo(
                Math.cos(angle) * end,
                Math.sin(angle) * end
            )
        }
        ctx!.closePath();
        ctx!.stroke();
        ctx!.restore();
    }

    function drawExplosions() {
        explosions.forEach(explosion => {
            drawExplosion(explosion);
        });
    }

    function drawAsteroids() {
        asteroids.forEach(asteroid => {
            drawAsteroid(asteroid);
        });
    }

    function drawSpaceShip() {
        ctx!.save();
        ctx!.strokeStyle = 'purple';
        ctx!.fillStyle = '#201010';
        ctx!.lineWidth = 4;
        ctx!.beginPath();
        ctx!.translate(shipPosition.x, shipPosition.y);
        ctx!.rotate(shipVector.direction + Math.PI / 2);
        ctx!.moveTo(-10, 10);
        ctx!.lineTo(0, -10);
        ctx!.lineTo(10, 10);
        ctx!.lineTo(0, 5);
        ctx!.closePath();
        ctx!.stroke();
        ctx!.fill();
        ctx!.restore();
    }

    function drawLaser() {
        if (laser > 0) {
            ctx!.save();
            ctx!.strokeStyle = 'red';
            ctx!.beginPath();
            ctx!.translate(laserPosition.x, laserPosition.y);
            ctx!.rotate(laserVector.direction + Math.PI / 2);
            ctx!.moveTo(0, -40);
            ctx!.lineTo(0, 0);
            ctx!.closePath();
            ctx!.stroke();
            ctx!.restore();
        }
    }

    function drawScore() {
        ctx!.save();
        ctx!.strokeStyle = 'yellow';
        ctx!.font = '20px courier new';
        ctx!.strokeText(`Lives: ${lives}  Score: ${score}  Level: ${level}`, 0, 20);
        ctx!.restore();
    }

    /**
     *      /|
     *   h / |
     *    /  | o
     *   /)__|
     *     a
     * sin(A) = o/h
     * cos(A) = a/h
     * tan(A) = o/a
     */
    function moveSpaceShip(timestamp: number) {
        shipPosition.x += Math.cos(shipVector.direction) * shipVector.speed;
        shipPosition.y += Math.sin(shipVector.direction) * shipVector.speed;
        shipPosition.x = shipPosition.x > 640 ? shipPosition.x - 640 
            : shipPosition.x < 0 ? shipPosition.x + 640 : shipPosition.x;
        shipPosition.y = shipPosition.y > 480 ? shipPosition.y - 480 
            : shipPosition.y < 0 ? shipPosition.y + 480 : shipPosition.y;
    }

    function moveAsteroid(asteroid: Asteroid, timestamp: number) {
        asteroid.position.x += Math.cos(asteroid.vector.direction) * asteroid.vector.speed;
        asteroid.position.y += Math.sin(asteroid.vector.direction) * asteroid.vector.speed;
        asteroid.position.x = asteroid.position.x > 640 ? 0 
            : asteroid.position.x < 0 ? 640 : asteroid.position.x;
        asteroid.position.y = asteroid.position.y > 480 ? 0 
            : asteroid.position.y < 0 ? 480 : asteroid.position.y;
    }

    function moveAsteroids(timestamp: number) {
        asteroids.forEach(asteroid => {
            moveAsteroid(asteroid, timestamp);
        });
    }

    function moveLaser(timestamp: number) {
        laserPosition.x += Math.cos(laserVector.direction) * laserVector.speed;
        laserPosition.y += Math.sin(laserVector.direction) * laserVector.speed;
        laserPosition.x = laserPosition.x > 640 ? 0 
            : laserPosition.x < 0 ? 640 : laserPosition.x;
        laserPosition.y = laserPosition.y > 480 ? 0 
            : laserPosition.y < 0 ? 480 : laserPosition.y;
        if (laser > 0) {
            laser -= laserVector.speed;
        }
    }

    function checkKeys(timestamp: number) {
        if (keys.ArrowLeft) {
            shipVector.direction += timestamp / 150;
        } else if (keys.ArrowRight) {
            shipVector.direction -= timestamp / 150;
        }
        if (keys.ArrowUp) {
            shipVector.speed -= timestamp / 200;
        } else if (keys.ArrowDown) {
            shipVector.speed += timestamp / 200;
        }
        shipVector.speed = Math.min(shipVector.speed, 10);
    }

    function isAsteroidHit(asteroid: Asteroid) {
        return ((laserPosition.x > asteroid.position.x - 10 * asteroid.scale)
            && (laserPosition.x < asteroid.position.x + 10 * asteroid.scale)
            && (laserPosition.y > asteroid.position.y - 10 * asteroid.scale)
            && (laserPosition.y < asteroid.position.y + 10 * asteroid.scale));
    }

    function isShipHit(asteroid: Asteroid) {
        return ((shipPosition.x > asteroid.position.x - 9 * asteroid.scale)
            && (shipPosition.x < asteroid.position.x + 9 * asteroid.scale)
            && (shipPosition.y > asteroid.position.y - 9 * asteroid.scale)
            && (shipPosition.y < asteroid.position.y + 9 * asteroid.scale));
    }

    function checkCollisions() {
        let hit: Asteroid | undefined = undefined;
        asteroids.forEach(asteroid => {
            if (laser && isAsteroidHit(asteroid)) {
                laser = 0;
                if (asteroid.scale > 1) {
                    asteroid.scale /= 2;
                    asteroid.vector.speed += 1;
                    asteroid.vector.direction = asteroid.vector.direction + 0.2 + Math.random() * 0.2;
                    asteroids.push({
                        position: {
                            x: asteroid.position.x,
                            y: asteroid.position.y,
                        },
                        vector: {
                            direction: asteroid.vector.direction - 0.4 + Math.random() * 0.2,
                            speed: asteroid.vector.speed,
                        },
                        rotation: asteroid.rotation,
                        scale: asteroid.scale,
                    })
                    score++;
                } else {
                    hit = asteroid;
                    score += 2;
                    explosions.push({
                        age: 0,
                        color: '#888',
                        position: {
                            x: hit!.position.x,
                            y: hit!.position.y,
                        },
                        size: 3,
                    })
                };
            } else if (isShipHit(asteroid)) {
                hit = asteroid;
                lives--;
                laser = 0;
                explosions.push({
                    age: 0,
                    color: '#cc6060',
                    position: {
                        x: shipPosition.x,
                        y: shipPosition.y,
                    },
                    size: 5,
                });
            }
        });
        if (hit !== undefined) {
            asteroids.splice(asteroids.indexOf(hit), 1);
        }
    }

    function updateExplosions(timestamp: number) {
        explosions.forEach(explosion => {
            explosion.age += 1;
        });
        explosions = explosions.filter(explosion => explosion.age < 30);
    }

    function drawFrame() {
        ctx!.fillStyle = 'black';
        ctx!.fillRect(0, 0, 640, 480);
        drawSpaceShip();
        drawLaser();
        drawAsteroids();
        drawExplosions();
        drawScore();
    }

    function updateFrame(diff: number) {
        moveLaser(diff);
        moveSpaceShip(diff);
        moveAsteroids(diff);
        updateExplosions(diff);
        checkCollisions();
    }

    function calculateDiff(timestamp: number) {
        if (lastTimestamp === undefined) {
            lastTimestamp = timestamp;
            window.requestAnimationFrame(animationFrame);
            return 0;
        }
        const diff = lastTimestamp - timestamp;
        lastTimestamp = timestamp;
        return diff;
    }
    
    function animationFrame(timestamp: number) {
        const diff = calculateDiff(timestamp);
        if (diff == 0) { 
            return;
        }
        
        checkKeys(diff);
        drawFrame();
        updateFrame(diff);

        if (asteroids.length === 0) {
            score += 10;
            lives++;
            level++;
            for (let i = 0; i < level + 3; i++) {
                createAsteroid();
            }
        }
    
        window.requestAnimationFrame(animationFrame);
    }

    const keys: {
        [key: string]: boolean;
    } = {
        ArrowLeft: false,
        ArrowRight: false,
        ArrowUp: false,
        ArrowDown: false,
    }

    document.addEventListener('keydown', ev => {
        keys[ev.key] = true;
        if (ev.key === ' ') {
            laserPosition.x = shipPosition.x;
            laserPosition.y = shipPosition.y;
            laserVector.direction = shipVector.direction;
            laserVector.speed = shipVector.speed + 15;
            laser = 300;
        }
    });
    document.addEventListener('keyup', ev => {
        keys[ev.key] = false;
    });

    for (let i = 0; i < 4; i++) {
        createAsteroid();
    }

    window.requestAnimationFrame(animationFrame);
}

init();
