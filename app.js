var myGameArea = {
	canvas: document.getElementById("canvas"),

	context: this.canvas.getContext("2d"),

	clear: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}


var x = new clsStopwatch();
var clocktimer;

var asto = [];
var playerBullets = [];
var debug = false;
var hit = false;
var shieldactive = false;
var collectedCoins = 0;
var shieldpower = 50;
var laserpower = 10;
var gamestarted = false;
var astrocount = 15;
var keys = [];
var image = 'img/bg.jpg'

var dead = false;




for (var i = 0; i < astrocount; i++) {
	var size = getRandomInt(50, 200);
	var astro = new astroids({
		x: getRandomInt(150, myGameArea.canvas.width),
		y: getRandomInt(150, myGameArea.canvas.height),
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



var player1 = new player(
	40, 40,
	"red",
	100, 100,
	myGameArea.context,
	"img/ship.png", "img/shipshiel.png"
);

var coin1 = new coin({
	image: "img/coins.png",
	x: getRandomInt(150, myGameArea.canvas.width - 60),
	y: getRandomInt(150, myGameArea.canvas.height - 60),
	width: 80,
	height: 80
});



var shieldcoin1 = new generateShieldCoin("img/shield.png");
var lasercoin1 = new generateShieldCoin("img/laser.png");

var checkShipCoin = new checkCollision(player1, coin1);
var checkShipAstro = new checkAstroidsCollision(player1, asto);
var checkLaserAstro1 = new checkLaserAstro();
var checkShipShield = new checkShipShieldCollision(player1, shieldcoin1);
var checkShipLaser = new checkShipLaserCollision(player1, lasercoin1);

var x = new clsStopwatch();

var start;




myGameArea.canvas.style.backgroundRepeat = "no-repeat";
myGameArea.canvas.style.backgroundImage = 'url(' + image + ')';

openMenu();

function init() {
	gamestarted = true;
	startGame();
	x.start();
}

document.body.addEventListener("keydown", function(e) {
	keys[e.keyCode] = true;
	if (e.keyCode == 13 && !gamestarted) {
		init();
	}
	if (e.keyCode == 82 && dead) {
		location.reload();
	}

});
document.body.addEventListener("keyup", function(e) {
	keys[e.keyCode] = false;
});


function startGame() {

	start = window.requestAnimationFrame(function() {
		if (collectedCoins != 15) {
			if (!dead) {
				updateGame();
				drawGame();
			} else {

				myGameArea.context.font = '50pt Calibri';
				myGameArea.context.fillText("GAME OVER! YOU ARE DEAD!", myGameArea.canvas.width / 2 - 400, myGameArea.canvas.height / 2);
			}
		} else {
			x.stop()
			myGameArea.context.font = '50pt Calibri';
			var endtime = formatTime(x.time());
            checkHighscore(x.time());
            myGameArea.context.fillText("YOU WON! TIME: " + endtime, myGameArea.canvas.width / 2 - 400, myGameArea.canvas.height / 2);
			dead = true;
            cancelAnimationFrame(start);
		}
		start = window.requestAnimationFrame(function() {
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

	this.setSize = function(width, height) {
		this.width = width;
		this.height = height;
	}

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
			myGameArea.context.lineWidth = 2;
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
	this.boundingbox = [];
	var flame = false;
	var ende = false;
	var ShieldPercent = 100;
	var LaserPercent = 100;

	this.drawShieldStatus = function() {
		var al = ShieldPercent;
		var start = 0;
		var diff = (al / 100) * Math.PI * 2;
		var cw = myGameArea.canvas.width / 2;
		var ch = myGameArea.canvas.height / 2;
		myGameArea.context.fillStyle = '#000';
		myGameArea.context.strokeStyle = 'rgba(0,94,128,0.5)';
		myGameArea.context.lineWidth = 8;
		myGameArea.context.beginPath();
		myGameArea.context.arc(this.x, this.y, 40, start, diff + start, false);
		myGameArea.context.stroke();
	}



	this.drawLaserStatus = function() {
		var al = LaserPercent;
		var start = 0;
		var diff = (al / 100) * Math.PI * 2;
		var cw = myGameArea.canvas.width / 2;
		var ch = myGameArea.canvas.height / 2;
		myGameArea.context.fillStyle = '#000';
		myGameArea.context.strokeStyle = 'rgba(26,198,255,0.5)';
		myGameArea.context.lineWidth = 8;
		myGameArea.context.beginPath();
		myGameArea.context.arc(this.x, this.y, 32, start, diff + start, false);
		myGameArea.context.stroke();
	}




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
		if (!ende) {
			if (keys[38]) {
				this.incrVelo();
				flame = true;

			} else if (keys[16] && shieldpower > 0) {
				shieldactive = true;
			} else {
				shieldactive = false;
				flame = false;
			}

			if (keys[39]) {
				this.incrementAngle();
			}
			if (keys[37]) {
				this.decrementAngle();
			}

			if (keys[32]) {
				if (laserpower > 0) {
					laserpower -= 0.5;
					this.shoot();
				}
			}
		}

	};

	this.update = function() {
		if (dead == true) {
			explosion.update();
		}
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
		if (dead == true) {
			explosion.draw(this.x - this.image.width / 2, this.y - this.image.height / 2);
			ende = true;
		}
		if (!ende) {
			this.x += verX;
			this.y += verY;
			this.ctx.save();
			this.ctx.translate(this.x, this.y);
			this.ctx.rotate(Math.PI / 180 * angle);
			if (!ende) {
				if (!shieldactive) {
					if (flame) {
						this.ctx.drawImage(this.image3, this.image3.width / -2, this.image3.height / -2, this.image3.width, this.image3.height);
					} else {
						this.ctx.drawImage(this.image, this.image.width / -2, this.image.height / -2, this.image.width, this.image.height);
					}

				} else {
					shieldpower -= 0.5;
					this.ctx.drawImage(this.image2, this.image2.width / -2, this.image2.height / -2, this.image2.width, this.image2.height);

				}
			}
			ShieldPercent = linearScaling(0, 50, 0, 100, shieldpower);
			LaserPercent = linearScaling(0, 20, 0, 100, laserpower);
			this.ctx.restore();
		}


		if (debug) {
			myGameArea.context.lineWidth = 2;
			this.ctx.strokeStyle = "white";
			this.ctx.beginPath();
			this.ctx.arc(this.boundingbox.x, this.boundingbox.y, this.boundingbox.r, 0, 2 * Math.PI);
			this.ctx.stroke();
		}
	}
}

function checkCollision(object1, object2) {
	this.update = function() {

		var distance = Math.sqrt(((object1.boundingbox.x - object2.boundingbox.x) * (object1.boundingbox.x - object2.boundingbox.x)) +
			((object1.boundingbox.y - object2.boundingbox.y) * (object1.boundingbox.y - object2.boundingbox.y))
		)

		if (distance < object1.boundingbox.r + object2.boundingbox.r) {
			collectedCoins++;
			coin1.updatePosition(getRandomInt(30, myGameArea.canvas.width - 60), getRandomInt(30, myGameArea.canvas.height - 60));
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
				if (!shieldactive) {
					dead = true;
				}
			}
		})
	};
}

function checkShipShieldCollision(ship, shield) {
	this.update = function() {
		var distance = Math.sqrt(((ship.boundingbox.x - shield.boundingbox.x) * (ship.boundingbox.x - shield.boundingbox.x)) +
			((ship.boundingbox.y - shield.boundingbox.y) * (ship.boundingbox.y - shield.boundingbox.y))
		)

		if (distance < ship.boundingbox.r + shield.boundingbox.r) {

			shieldcoin1.updatePosition();
			shield.collected = true;
			shieldpower = 50;

		}

	}
}

function checkShipLaserCollision(ship, laser) {
	this.update = function() {
		var distance = Math.sqrt(((ship.boundingbox.x - laser.boundingbox.x) * (ship.boundingbox.x - laser.boundingbox.x)) +
			((ship.boundingbox.y - laser.boundingbox.y) * (ship.boundingbox.y - laser.boundingbox.y))
		)

		if (distance < ship.boundingbox.r + laser.boundingbox.r) {

			lasercoin1.updatePosition();
			laserpower = 10;

		}

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


					if (hit == false) {
						hit = true;
						if (astro.width > 40) {
							for (var i = 0; i < 2; i++) {
								var ast = $.extend(true, {}, astro);
								ast.angle = getRandomInt(0, 360);
								ast.height = astro.height / 2;
								ast.width = astro.width / 2;
								ast.speed = getRandomInt(1, 2);
								asto.push(ast);
							}
						}


						asto.splice(idx, 1);
						playerBullets.splice(idx2, 1);
					}
					setTimeout(function() {
						hit = false
					}, 400)

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
	this.boundingbox = [];

	this.updatePosition = function(x, y) {
		this.x = x;
		this.y = y;
	}

	this.generateBoundingBox = function() {
		this.boundingbox.r = this.width / 2;
		this.boundingbox.x = this.x + 20;
		this.boundingbox.y = this.y + 20;
	}

	this.draw = function() {
		this.generateBoundingBox();
		this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		if (debug) {
			this.ctx.strokeStyle = "white";
			this.ctx.beginPath();
			this.ctx.arc(this.boundingbox.x, this.boundingbox.y, this.boundingbox.r, 0, 2 * Math.PI);
			this.ctx.stroke();
		}
	}
}




function Bullet(I) {
	I.active = true;
	I.xVelocity = 0;
	I.yVelocity = 10;
	I.r = 0.8;
	I.color = "#000";
	this.angle = I.angle;

	I.boundingbox = [];

	I.generateBoundingBox = function() {
		I.boundingbox.r = I.r;
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
		myGameArea.context.beginPath();
		myGameArea.context.strokeStyle = '#4db8ff';
		myGameArea.context.lineWidth = "1px";
		myGameArea.context.arc(I.x, I.y, I.r, 0, 2 * Math.PI);
		
		myGameArea.context.stroke();


		if (debug) {
			myGameArea.context.strokeStyle = "white";
			myGameArea.context.beginPath();
			myGameArea.context.arc(I.boundingbox.x, I.boundingbox.y, I.boundingbox.r, 0, 2 * Math.PI);
			myGameArea.context.stroke();
		}
	};
	return I;
}




function generateShieldCoin(image) {
	this.image = new Image();
	this.image.src = image;
	this.x = getRandomInt(50, myGameArea.canvas.width - 50);
	this.y = getRandomInt(50, myGameArea.canvas.height - 50);
	this.width = 50;
	this.height = 50;
	this.boundingbox = [];
	this.refresh = 0;
	this.updatePosition = function() {

		this.x = getRandomInt(50, myGameArea.canvas.width - 50);
		this.y = getRandomInt(50, myGameArea.canvas.height - 50);




	}

	this.generateBoundingBox = function() {
		this.boundingbox.r = this.width / 2;
		this.boundingbox.x = this.x;
		this.boundingbox.y = this.y;
	}

	this.draw = function() {

		this.generateBoundingBox();

		myGameArea.context.drawImage(this.image, this.x, this.y, this.width, this.height);


	}
}




spritesheet = new SpriteSheet('img/explosion.png', 95.5, 95.5);
explosion = new Animation(spritesheet, 2, 6, 10);

function linearScaling(oldMin, oldMax, newMin, newMax, oldValue) {
	var newValue;
	if (oldMin !== oldMax && newMin !== newMax) {
		newValue = parseFloat((((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin);
		newValue = newValue.toFixed(2);
	} else {
		newValue = error;
	}
	return newValue;
}


function clsStopwatch() {
	var startAt = 0;
	var lapTime = 0;

	var now = function() {
		return (new Date()).getTime();
	};

	this.start = function() {
		startAt = startAt ? startAt : now();
	};

	this.stop = function() {
		lapTime = startAt ? lapTime + now() - startAt : lapTime;
		startAt = 0; // Paused
	};

	this.reset = function() {
		lapTime = startAt = 0;
	};

	this.time = function() {
		return lapTime + (startAt ? now() - startAt : 0);
	};
};


function pad(num, size) {
	var s = "0000" + num;
	return s.substr(s.length - size);
}

function formatTime(time) {
	var h = m = s = ms = 0;
	var newTime = '';

	h = Math.floor(time / (60 * 60 * 1000));
	time = time % (60 * 60 * 1000);
	m = Math.floor(time / (60 * 1000));
	time = time % (60 * 1000);
	s = Math.floor(time / 1000);
	ms = time % 1000;

	newTime = pad(h, 2) + ':' + pad(m, 2) + ':' + pad(s, 2) + ':' + pad(ms, 3);
	return newTime;
}


/**
 * Öffnet bei Start das Hauptmenü
 * 
 * @method openMenu
 */

function openMenu() {
	logo = new Image();
	logo.src = "img/log.png"
	myGameArea.context.font = '20pt Calibri';
	myGameArea.context.fillStyle = 'white';
	myGameArea.context.fillText("Controls: Arrow Up -> Speed up  Space -> Shoot  Shift -> Shield", myGameArea.canvas.width / 2 - 370, myGameArea.canvas.height - 150);
	myGameArea.context.fillText("Collect 15 Suns so fast as you can", myGameArea.canvas.width / 2 - 140, myGameArea.canvas.height - 200);
	myGameArea.context.fillText("Press Enter to Start the Game", myGameArea.canvas.width / 2 - 120, myGameArea.canvas.height - 100);
    myGameArea.context.drawImage(logo, myGameArea.canvas.width / 2 - 200, 200,logo.width,logo.height);
}


/**
 * Aktualisiert Positionen der Spielobjekte
 *
 * @method updateGame
 */


function updateGame() {
	player1.update();
	checkShipCoin.update();
	checkShipShield.update();
	checkShipLaser.update();
	asto.forEach(function(astro) {
		astro.update()
	})
	checkShipAstro.update();
	checkLaserAstro1.update(playerBullets, asto);
	explosion.update();

}

function checkHighscore(newScore) {
    this.newScore = newScore;
    this.highscore = Number(localStorage.getItem("astroracehighscore"));
    if(highscore) {
    if(this.newScore < highscore) {
        setHighscore(newScore.toString());
        return true;
    }  else {
        return false;
    }
    } else {
        setHighscore(newScore.toString());
        return true;
    }
  
}

function getLastHighscore() {
    return Number(localStorage.getItem("astroracehighscore"));
}

function setHighscore(newScore) {
    this.newScore = newScore.toString();
    localStorage.setItem("astroracehighscore", this.newScore);
}


/**
 * Rendert die enthaltenen Spielobjekte mit aktuellen Einstellungen.
 * Spielobjekte sollten ebenfalls eine draw Methode enthalten z.B. player1.draw();
 *
 * @method drawGame
 */

function drawGame() {
	myGameArea.clear();
	coin1.draw();
	player1.draw();
	player1.drawShieldStatus();
	player1.drawLaserStatus();
	if (shieldpower < 10) {
		shieldcoin1.draw();
	}
	if (laserpower <= 0) {
		lasercoin1.draw();
	}
	asto.forEach(function(astro) {
		astro.draw()
	})


	myGameArea.context.font = '20pt Calibri';
	myGameArea.context.fillStyle = '#99d6ff';
	myGameArea.context.fillText("Actual Run", 20, 30);
	myGameArea.context.fillText(formatTime(x.time()), 20, 53);
	myGameArea.context.fillText("Collected Coins", 200, 30);
	myGameArea.context.fillText(collectedCoins + "/15", 200, 53);
    	myGameArea.context.fillText("Best Time", 400, 30);
	myGameArea.context.fillText(formatTime(getLastHighscore()), 400, 53);
}


/**
 * Funktionen zum Erstellen von Animation aus Spritesheets.
 * @method Spritesheet   Erstellt aus Spritesheet einzelne Bilder
 * @method Animation Erstellt Animation aus Bildern
 */


function SpriteSheet(path, frameWidth, frameHeight) {
	this.image = new Image();
	this.frameWidth = frameWidth;
	this.frameHeight = frameHeight;
	var self = this;
	this.image.onload = function() {
		self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
	};
	this.image.src = path;
}


function Animation(spritesheet, frameSpeed, startFrame, endFrame) {
	var animationSequence = [];
	var currentFrame = 0;
	var counter = 0;
	var ctx = myGameArea.context;

	for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++)
		animationSequence.push(frameNumber);

	this.update = function() {
		if (counter == (frameSpeed - 1))
			currentFrame = (currentFrame + 1) % animationSequence.length;
		counter = (counter + 1) % frameSpeed;
	};

	this.draw = function(x, y) {
		var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
		var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

		ctx.drawImage(
			spritesheet.image,
			col * spritesheet.frameWidth, row * spritesheet.frameHeight,
			spritesheet.frameWidth, spritesheet.frameHeight,
			x, y,
			spritesheet.frameWidth, spritesheet.frameHeight);
	};
}