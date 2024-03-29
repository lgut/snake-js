import Phaser from "phaser";
import { Snake } from "../entities/Snake";
import { Block, BlockProperties, BlockTypes } from "../entities/Block";
import Direction from "../helpers/Direction";
import { getRandPosition } from "../helpers/random";
import { Apple } from "../entities/Apple";

export class MainScene extends Phaser.Scene {
	constructor() {
		super();
		/** @type {Snake} */
		this.player;
		/**
		 * @type {Apple}
		 */
		this.apple;
	}

	updateScore() {
		this.score += 1;
		const scoreText = `Score: ${this.score}`;
		this.scoreKeeper.setText(scoreText);

	}

	create() {
		this.score = 0;
		this.player = new Snake(this, 8, 8);
		this.apple = this.createApple();
		this.add.existing(this.apple);
		// Would be helpful to seperate the score keeper to a seperate class
		this.scoreKeeper = this.add.text(16, 16, `Score: ${this.score}`,
			{ fontSize: "16px", fill: "#ffffff" }
		);
		this.scoreKeeper.depth = Infinity;

		this.player.controls.pause.onDown = this.pauseScene.bind(this);
	}

	pauseScene() {
		if (this.player.isAlive) {
			this.game.scene.start("pause", { parentScene: this });
			this.scene.pause();
		}
	}

	createApple() {
		const { width, height } = this.game.config;
		const { x, y } = getRandPosition(width, height);

		const apple = new Apple(this, x * BlockProperties.width, y * BlockProperties.width);
		return apple;
	}


	update(time, dt) {
		if (!this.player.isAlive) {
			this.game.scene.start("game over", { score: this.score });
			this.scene.pause();
			return;
		}

		if (this.player.controls.left.isDown) {
			this.player.changeDirection(Direction.Left);
		} else if (this.player.controls.right.isDown) {
			this.player.changeDirection(Direction.Right);
		} else if (this.player.controls.up.isDown) {
			this.player.changeDirection(Direction.Up);
		} else if (this.player.controls.down.isDown) {
			this.player.changeDirection(Direction.Down);
		}

		if (this.player.update(time)) {
			if (this.player.collideWithFood(this.apple)) {
				this.apple.eat(this.player);
				this.player.grow();

				// difficulty scaling
				if (this.score > 0 && this.score % 5 === 0) {
					this.player.increaseSpeed();
				}

				this.updateScore();
			}

		}
	}
}