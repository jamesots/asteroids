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
    let laser = false;
    let asteroids: Asteroid[] = [];

    let lastTimestamp: number | undefined = undefined;

    function createAsteroid() {
        asteroids.push({
            position: {
                x: Math.random() * 640,
                y: Math.random() * 480,
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
        ctx!.strokeStyle = 'green';
        ctx!.save();
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
        ctx!.restore();        
    }

    function drawAsteroids() {
        asteroids.forEach(asteroid => {
            drawAsteroid(asteroid);
        });
    }

    function drawSpaceShip() {
        ctx!.strokeStyle = 'red';
        ctx!.save();
        ctx!.beginPath();
        ctx!.translate(shipPosition.x, shipPosition.y);
        ctx!.rotate(shipVector.direction + Math.PI / 2);
        ctx!.moveTo(-10, 10);
        ctx!.lineTo(0, -10);
        ctx!.lineTo(10, 10);
        ctx!.lineTo(0, 5);
        ctx!.closePath();
        ctx!.stroke();
        ctx!.restore();
    }

    function drawLaser() {
        if (laser) {
            ctx!.strokeStyle = 'red';
            ctx!.save();
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
        asteroid.position.x = asteroid.position.x > 640 ? asteroid.position.x - 640 
            : asteroid.position.x < 0 ? asteroid.position.x + 640 : asteroid.position.x;
        asteroid.position.y = asteroid.position.y > 480 ? asteroid.position.y - 480 
            : asteroid.position.y < 0 ? asteroid.position.y + 480 : asteroid.position.y;
    }

    function moveAsteroids(timestamp: number) {
        asteroids.forEach(asteroid => {
            moveAsteroid(asteroid, timestamp);
        });
    }

    function moveLaser(timestamp: number) {
        laserPosition.x += Math.cos(laserVector.direction) * laserVector.speed;
        laserPosition.y += Math.sin(laserVector.direction) * laserVector.speed;
        if (laserPosition.x > 640 || laserPosition.x < 0
            || laserPosition.y > 480 || laserPosition.y < 0) {
            laser = false;
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
                laser = false;
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
                } else {
                    hit = asteroid;
                };
            } else if (isShipHit(asteroid)) {
                hit = asteroid;
                console.log('dead');
            }
        });
        if (hit) {
            asteroids.splice(asteroids.indexOf(hit), 1);
        }
    }
    
    function animationFrame(timestamp: number) {
        if (lastTimestamp === undefined) {
            lastTimestamp = timestamp;
            window.requestAnimationFrame(animationFrame);
            return;
        }
        const diff = lastTimestamp - timestamp;
        lastTimestamp = timestamp;
        ctx!.clearRect(0, 0, 640, 480);
        checkKeys(diff);
        drawSpaceShip();
        drawLaser();
        drawAsteroids();
        moveLaser(diff);
        moveSpaceShip(diff);
        moveAsteroids(diff);
        checkCollisions();
    
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
            laser = true;
        }
    });
    document.addEventListener('keyup', ev => {
        keys[ev.key] = false;
    });

    createAsteroid();
    createAsteroid();
    createAsteroid();
    createAsteroid();

    window.requestAnimationFrame(animationFrame);
}

init();
