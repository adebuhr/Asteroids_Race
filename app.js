var ONE_FRAME_TIME = 1000 / 60;

var myGameArea = {
    canvas: document.getElementById("canvas"),

    context: this.canvas.getContext("2d"),

    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    }
}




var player1 = new player(40, 40, "red", 40, 40, myGameArea.context, "img/ship.png", "img/shipshiel.png");
var coin1 = new coin({
    image: "img/coins.png",
    x: 100,
    y: 100,
    width: 40,
    height: 40
});
var asto = [];
var playerBullets = [];
var debug = false;

for (var i = 0; i < 30; i++) {
    var size = getRandomInt(50, 200);
    var astro = new astroids({
        x: getRandomInt(0, myGameArea.canvas.width),
        y: getRandomInt(0, myGameArea.canvas.height),
        image: "img/astro.png",
        speed: getRandomInt(1, 3),
        angle: getRandomInt(0, 360),
        rot: getRandomInt(1, 3),
        width: size,
        height: size,
        context: myGameArea.context
    })
    asto.push(astro);
}
var checkShipCoin = new checkCollision(player1, coin1);
var checkShipAstro = new checkAstroidsCollision(player1, asto);
var checkLaserAstro1 = new checkLaserAstro();


var keys = [];

var image = 'img/bg.jpg'


myGameArea.canvas.style.backgroundRepeat = "no-repeat";
myGameArea.canvas.style.backgroundImage = 'url(' + image + ')';


startGame();

document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});


function startGame() {
    window.requestAnimationFrame(function() {
        updateGame();
        drawGame();
        window.requestAnimationFrame(function() {
            startGame()
        });
    });
}

function astroids(a) {
    this.image = new Image();
    this.image.src = a.image;
    this.speed = a.speed;
    this.x = a.x;
    this.y = a.y;
    this.width = a.width;
    this.height = a.height;
    this.angle = a.angle;
    var rot = 0;
    this.ctx = a.context;
    var num = getRandomInt(-2, 2);
    this.boundingbox = [];


    this.outOfBorders = function() {
        if (this.x - this.width > myGameArea.canvas.width) {
            this.x = (this.x - myGameArea.canvas.width) - (this.width * 2);
        }
        if (this.x < (0 - this.width * 2)) {
            this.x = myGameArea.canvas.width + this.width;
        }

        if (this.y - this.height > myGameArea.canvas.height) {
            this.y = ((this.y) - myGameArea.canvas.height) - (this.height * 2);

        }

        if (this.y < (0 - this.height * 2)) {
            this.y = myGameArea.canvas.height + this.height;
        }
    }

    this.generateBoundingBox = function() {
        this.boundingbox.r = this.width / 2;
        this.boundingbox.x = this.x + 2;
        this.boundingbox.y = this.y + 2;
    }

    this.update = function() {
        this.generateBoundingBox();
        this.outOfBorders();
        this.x += this.speed * (Math.cos((this.angle / 180) * Math.PI));
        this.y += this.speed * (Math.sin((this.angle / 180) * Math.PI));
    }

    this.draw = function() {
        rot += num * Math.PI / 180;
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(rot);
        this.ctx.drawImage(this.image, this.width / -2, this.height / -2, this.width, this.height);
        this.ctx.restore();
        if (debug) {
            this.ctx.strokeStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(this.boundingbox.x, this.boundingbox.y, this.boundingbox.r, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }
}

function player(width, height, color, x, y, ctx, imageurl, imageurl2) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    var angle = 0;
    var verX = 0;
    var verY = 0;
    this.image = new Image();
    this.image.src = imageurl;
    this.image2 = new Image();
    this.image2.src = imageurl2;
    this.image3 = new Image();
    this.image3.src = "img/shipflame.png"
    var shield = false;
    var shieldpower = 50;
    this.boundingbox = [];
    var flame = false;

    this.generateBoundingBox = function() {
        this.boundingbox.r = (this.width / 2);
        this.boundingbox.x = this.x;
        this.boundingbox.y = this.y;
    }



    this.incrementAngle = function() {
        angle += 5;
        if (angle >= 360) {
            angle = 0;
        }


    }

    this.decrementAngle = function() {
        angle -= 5;
        if (angle < -360) {
            angle = 0;
        }

    }


    this.incrVelo = function() {

        verX += 0.5 * Math.cos((Math.PI / 180) * angle);
        verY += 0.5 * Math.sin((Math.PI / 180) * angle);

    }

    this.outOfBorders = function() {
        if (this.x > myGameArea.canvas.width) {
            this.x = this.x - myGameArea.canvas.width;
        }
        if (this.x < 0) {
            this.x = myGameArea.canvas.width;
        }

        if (this.y > myGameArea.canvas.height) {
            this.y = this.y - myGameArea.canvas.height;
        }

        if (this.y < 0) {
            this.y = myGameArea.canvas.height;
        }

    }

    this.shoot = function() {
        var bulletPosition = this.midpoint();

        playerBullets.push(Bullet({
            speed: 50,
            angle: angle,
            x: bulletPosition.x,
            y: bulletPosition.y
        }));
    };

    this.midpoint = function() {
        return {
            x: this.x,
            y: this.y
        };
    };




    this.move = function() {
        if (keys[38]) {
            this.incrVelo();
            flame = true;

        } else if (keys[40] && shieldpower > 0) {
            shield = true;
        } else {
            shield = false;
            flame = false;
        }

        if (keys[39]) {
            this.incrementAngle();
        }
        if (keys[37]) {
            this.decrementAngle();
        }

        if (keys[32]) {
            this.shoot();
        }

    };

    this.update = function() {
        this.generateBoundingBox();
        this.move();
        this.outOfBorders();

        playerBullets.forEach(function(bullet) {
            bullet.update();
        });

        playerBullets = playerBullets.filter(function(bullet) {
            return bullet.active;
        });
    }



    this.draw = function() {
        this.x += verX;
        this.y += verY;
        playerBullets.forEach(function(bullet) {
            bullet.draw();
        });


        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(Math.PI / 180 * angle);
        if (!shield) {
            if(flame) {
              this.ctx.drawImage(this.image3, this.image3.width / -2, this.image3.height / -2, this.image3.width, this.image3.height);   
            } else {
              this.ctx.drawImage(this.image, this.image.width / -2, this.image.height / -2, this.image.width, this.image.height);
            }
           
        } else {
            shieldpower -= 0.5;
            this.ctx.drawImage(this.image2, this.image2.width / -2, this.image2.height / -2, this.image2.width, this.image2.height);
        }
        this.ctx.restore();



        if (debug) {
            this.ctx.strokeStyle = "white";
            this.ctx.beginPath();
            this.ctx.arc(this.boundingbox.x, this.boundingbox.y, this.boundingbox.r, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
    }
}

function checkCollision(object1, object2) {
    this.update = function() {

        if (object1.x < object2.x + object2.width && object1.x + object1.width > object2.x &&
            object1.y < object2.y + object2.height && object1.y + object1.height > object2.y) {
            coin1.updatePosition(getRandomInt(10, myGameArea.canvas.width - 20), getRandomInt(10, myGameArea.canvas.height - 20));
        }
    }
}

function checkAstroidsCollision(ship, astroids) {
    this.update = function() {
        astroids.forEach(function(astro, idx, array) {
            var distance = Math.sqrt(((ship.boundingbox.x - astro.boundingbox.x) * (ship.boundingbox.x - astro.boundingbox.x)) +
                ((ship.boundingbox.y - astro.boundingbox.y) * (ship.boundingbox.y - astro.boundingbox.y))
            )

            if (distance < ship.boundingbox.r + astro.boundingbox.r) {
                
            }
        })
    }
}

function checkLaserAstro() {
    this.update = function(laser, astroids) {
        laser.forEach(function(laser, idx2, arraay) {
            astroids.forEach(function(astro, idx, array) {
                var distance = Math.sqrt(((laser.boundingbox.x - astro.boundingbox.x) * (laser.boundingbox.x - astro.boundingbox.x)) +
                    ((laser.boundingbox.y - astro.boundingbox.y) * (laser.boundingbox.y - astro.boundingbox.y))
                )
                if (distance < laser.boundingbox.r + astro.boundingbox.r) {
                    asto.splice(idx, 1);
                    playerBullets.splice(idx2, 1);


                }
            })
        })
    }
}




function getRandomInt(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

function coin(c) {
    this.image = new Image();
    this.image.src = c.image;
    this.x = c.x;
    this.y = c.y;
    this.width = c.width;
    this.height = c.height;
    this.ctx = myGameArea.context;

    this.updatePosition = function(x, y) {
        this.x = x;
        this.y = y;
    }

    this.draw = function() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

function Bullet(I) {
    I.active = true;

    I.xVelocity = 0;
    I.yVelocity = 10;
    I.width = 3;
    I.height = 3;
    I.color = "#000";
    this.angle = I.angle;

    I.boundingbox = [];

    I.generateBoundingBox = function() {
        I.boundingbox.r = (this.width) / 2;
        I.boundingbox.x = this.x;
        I.boundingbox.y = this.y;
    }

    I.inBounds = function() {
        return I.x >= 0 && I.x <= myGameArea.canvas.width &&
            I.y >= 0 && I.y <= myGameArea.canvas.height;
    };

    I.update = function() {
        I.generateBoundingBox();
        I.x += 10 * (Math.cos((I.angle / 180) * Math.PI));
        I.y += 10 * (Math.sin((I.angle / 180) * Math.PI));

        I.active = I.active && I.inBounds()

    };

    I.draw = function() {
        myGameArea.context.fillStyle = "#00FF6F";
        myGameArea.context.fillRect(I.x, I.y, I.width, I.height);

        if (debug) {
            myGameArea.context.strokeStyle = "white";
            myGameArea.context.beginPath();
            myGameArea.context.arc(I.boundingbox.x, I.boundingbox.y, I.boundingbox.r, 0, 2 * Math.PI);
            myGameArea.context.stroke();
        }
    };
    return I;
}

function updateGame() {
    player1.update();
    checkShipCoin.update();
    asto.forEach(function(astro) {
        astro.update()
    })
    checkShipAstro.update();
    checkLaserAstro1.update(playerBullets, asto);

}

function drawGame() {
    myGameArea.clear();
    coin1.draw();
    player1.draw();
    asto.forEach(function(astro) {
        astro.draw()
    })
}