// Pong Game JavaScript Implementation
class PongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Game dimensions and constants
        this.GAME_WIDTH = 1000;
        this.GAME_HEIGHT = 555; // Classic aspect ratio
        this.BALL_DIAMETER = 20;
        this.PADDLE_WIDTH = 25;
        this.PADDLE_HEIGHT = 100;
        this.MAX_SCORE = 5;

        // Game objects
        this.paddle1 = null;
        this.paddle2 = null;
        this.ball = null;
        this.score = null;

        // Game state
        this.gameRunning = false;
        this.singlePlayerMode = true;
        this.player1Name = "Player 1";
        this.player2Name = "Computer";

        // Input handling
        this.keys = {};

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // Create paddles
        this.paddle1 = new Paddle(0, (this.GAME_HEIGHT/2) - (this.PADDLE_HEIGHT/2),
                                 this.PADDLE_WIDTH, this.PADDLE_HEIGHT, 1);
        this.paddle2 = new Paddle(this.GAME_WIDTH - this.PADDLE_WIDTH,
                                 (this.GAME_HEIGHT/2) - (this.PADDLE_HEIGHT/2),
                                 this.PADDLE_WIDTH, this.PADDLE_HEIGHT, 2);

        // Create ball
        this.newBall();

        // Create score
        this.score = new Score(this.GAME_WIDTH, this.GAME_HEIGHT);
        this.score.setPlayerNames(this.player1Name, this.player2Name);
    }

    newBall() {
        const random = Math.random();
        this.ball = new Ball(
            (this.GAME_WIDTH/2) - (this.BALL_DIAMETER/2),
            random * (this.GAME_HEIGHT - this.BALL_DIAMETER),
            this.BALL_DIAMETER,
            this.BALL_DIAMETER
        );
    }

    newPaddles() {
        this.paddle1.y = (this.GAME_HEIGHT/2) - (this.PADDLE_HEIGHT/2);
        this.paddle2.y = (this.GAME_HEIGHT/2) - (this.PADDLE_HEIGHT/2);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        if (!this.gameRunning) return;

        // Handle input
        this.handleInput();

        // Update game objects
        this.paddle1.move();
        this.paddle2.move();
        this.ball.move();

        // AI for single player mode
        if (this.singlePlayerMode) {
            this.updateAI();
        }

        // Check collisions
        this.checkCollisions();
    }

    handleInput() {
        // Player 1 controls (W/S)
        if (this.keys['w']) {
            this.paddle1.setYDirection(-this.paddle1.speed);
        } else if (this.keys['s']) {
            this.paddle1.setYDirection(this.paddle1.speed);
        } else {
            this.paddle1.setYDirection(0);
        }

        // Player 2 controls (Arrow keys) - only in two player mode
        if (!this.singlePlayerMode) {
            if (this.keys['arrowup']) {
                this.paddle2.setYDirection(-this.paddle2.speed);
            } else if (this.keys['arrowdown']) {
                this.paddle2.setYDirection(this.paddle2.speed);
            } else {
                this.paddle2.setYDirection(0);
            }
        }
    }

    updateAI() {
        const paddleCenter = this.paddle2.y + this.PADDLE_HEIGHT / 2;
        const ballCenter = this.ball.y + this.BALL_DIAMETER / 2;

        // Simple AI: move towards ball
        if (ballCenter < paddleCenter - 10) {
            this.paddle2.setYDirection(-this.paddle2.speed);
        } else if (ballCenter > paddleCenter + 10) {
            this.paddle2.setYDirection(this.paddle2.speed);
        } else {
            this.paddle2.setYDirection(0);
        }
    }

    checkCollisions() {
        // Ball bouncing off top and bottom walls
        if (this.ball.y <= 0) {
            this.ball.setYDirection(-this.ball.yVelocity);
        }
        if (this.ball.y >= this.GAME_HEIGHT - this.BALL_DIAMETER) {
            this.ball.setYDirection(-this.ball.yVelocity);
        }

        // Ball bouncing off paddles
        if (this.ball.intersects(this.paddle1)) {
            this.ball.xVelocity = Math.abs(this.ball.xVelocity);
            this.ball.setXDirection(this.ball.xVelocity);
            this.ball.setYDirection(this.ball.yVelocity);
        }
        if (this.ball.intersects(this.paddle2)) {
            this.ball.xVelocity = Math.abs(this.ball.xVelocity);
            this.ball.setXDirection(-this.ball.xVelocity);
            this.ball.setYDirection(this.ball.yVelocity);
        }

        // Prevent paddles from moving outside the game area
        if (this.paddle1.y <= 0) this.paddle1.y = 0;
        if (this.paddle1.y >= (this.GAME_HEIGHT - this.PADDLE_HEIGHT)) {
            this.paddle1.y = this.GAME_HEIGHT - this.PADDLE_HEIGHT;
        }
        if (this.paddle2.y <= 0) this.paddle2.y = 0;
        if (this.paddle2.y >= (this.GAME_HEIGHT - this.PADDLE_HEIGHT)) {
            this.paddle2.y = this.GAME_HEIGHT - this.PADDLE_HEIGHT;
        }

        // Handle scoring when ball goes off screen
        if (this.ball.x <= 0) {
            this.score.player2++;
            this.newPaddles();
            this.newBall();
            if (this.score.player2 >= this.MAX_SCORE) {
                this.stopGame();
                alert(`${this.player2Name} wins!`);
            }
        }
        if (this.ball.x >= this.GAME_WIDTH - this.BALL_DIAMETER) {
            this.score.player1++;
            this.newPaddles();
            this.newBall();
            if (this.score.player1 >= this.MAX_SCORE) {
                this.stopGame();
                alert(`${this.player1Name} wins!`);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);

        // Draw game objects
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.score.draw(this.ctx);
    }

    startGame() {
        if (this.gameRunning) return;

        this.gameRunning = true;
        this.gameLoop();
    }

    stopGame() {
        this.gameRunning = false;
    }

    setGameMode(singlePlayer) {
        this.singlePlayerMode = singlePlayer;
        this.player2Name = singlePlayer ? "Computer" : "Player 2";
        this.score.setPlayerNames(this.player1Name, this.player2Name);
    }

    setPlayerNames(p1Name, p2Name) {
        this.player1Name = p1Name;
        this.player2Name = p2Name;
        this.score.setPlayerNames(p1Name, p2Name);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Paddle class
class Paddle {
    constructor(x, y, width, height, id) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = id;
        this.yVelocity = 0;
        this.speed = 5;
    }

    setYDirection(direction) {
        this.yVelocity = direction;
    }

    move() {
        this.y += this.yVelocity;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Ball class
class Ball {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xVelocity = 2;
        this.yVelocity = 2;
    }

    setXDirection(direction) {
        this.xVelocity = direction;
    }

    setYDirection(direction) {
        this.yVelocity = direction;
    }

    move() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    intersects(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
}

// Score class
class Score {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.player1 = 0;
        this.player2 = 0;
        this.player1Name = "Player 1";
        this.player2Name = "Player 2";
    }

    setPlayerNames(p1Name, p2Name) {
        this.player1Name = p1Name;
        this.player2Name = p2Name;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.font = '30px Arial';

        // Draw center line
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(this.gameWidth/2, 0);
        ctx.lineTo(this.gameWidth/2, this.gameHeight);
        ctx.strokeStyle = '#FFF';
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw scores
        ctx.fillText(this.player1, (this.gameWidth/2) - 85, 50);
        ctx.fillText(this.player2, (this.gameWidth/2) + 50, 50);

        // Draw player names
        ctx.font = '20px Arial';
        ctx.fillText(this.player1Name, (this.gameWidth/2) - 150, 30);
        ctx.fillText(this.player2Name, (this.gameWidth/2) + 50, 30);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('pongCanvas');
    const game = new PongGame(canvas);

    // UI event listeners
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const player1Input = document.getElementById('player1Name');
    const player2Input = document.getElementById('player2Name');
    const gameModeRadios = document.querySelectorAll('input[name="gameMode"]');

    startButton.addEventListener('click', () => {
        const p1Name = player1Input.value.trim() || "Player 1";
        const p2Name = player2Input.value.trim() || (game.singlePlayerMode ? "Computer" : "Player 2");

        game.setPlayerNames(p1Name, p2Name);
        game.startGame();

        startButton.disabled = true;
        stopButton.disabled = false;
        player1Input.disabled = true;
        player2Input.disabled = true;
        gameModeRadios.forEach(radio => radio.disabled = true);
    });

    stopButton.addEventListener('click', () => {
        game.stopGame();

        startButton.disabled = false;
        stopButton.disabled = true;
        player1Input.disabled = false;
        if (!game.singlePlayerMode) {
            player2Input.disabled = false;
        }
        gameModeRadios.forEach(radio => radio.disabled = false);
    });

    gameModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isSinglePlayer = e.target.value === 'single';
            game.setGameMode(isSinglePlayer);
            player2Input.value = isSinglePlayer ? "Computer" : "Player 2";
            player2Input.disabled = isSinglePlayer;
        });
    });
});