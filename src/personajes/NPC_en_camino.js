import Phaser from 'phaser';
import NPC from './npc.js';

export default class NPC_en_camino extends NPC {
    /**
     * @param {Phaser.Scene} scene 
     * @param {Player} player 
     * @param {number} x 
     * @param {number} y 
     * @param {string} texture 
     * @param {number} targetX 
     * @param {string} message 
     */
    constructor(scene, player, x, y, texture, targetY, message) {
        super(scene, player, x, y, texture, 0, message, null, null, 'Estudiante');

        this.targetY = targetY;
        this.walking = true;
        this.speed = 30;
        this.hasSpoken = false;

        // Habilitar movimiento
        if (this.body) {
            this.body.moves = true;
            this.body.setImmovable(false);
            this.body.setSize(30, 30);
            this.body.setOffset(17, 30);
        }

        // Definir animaciones si no existen
        const animsConfig = [
            { key: 'down', start: 0, end: 3 },
            { key: 'left', start: 4, end: 7 },
            { key: 'right', start: 8, end: 11 },
            { key: 'up', start: 12, end: 15 }
        ];

        animsConfig.forEach(cfg => {
            if (!this.scene.anims.exists(`walk1-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `walk1-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers(texture, { start: cfg.start, end: cfg.end }),
                    frameRate: 8,
                    repeat: -1
                });
            }
            if (!this.scene.anims.exists(`idle1-${cfg.key}`)) {
                this.scene.anims.create({
                    key: `idle1-${cfg.key}`,
                    frames: this.scene.anims.generateFrameNumbers(texture, { start: cfg.start, end: cfg.start }),
                    frameRate: 1,
                    repeat: -1
                });
            }
        });

        // Determinar dirección inicial basada en targetY
        this.lastDirection = this.targetY > this.y ? 'down' : 'up';
        this.play(`walk1-${this.lastDirection}`);
    }

    preUpdate(t, dt) {
        super.preUpdate(t, dt);

        if (this.walking && !this.frozen) {
            // Movimiento vertical hacia el objetivo
            if (this.lastDirection === 'down') {
                this.body.setVelocityY(this.speed);
                if (this.y >= this.targetY) {
                    this.stopWalking();
                }
            } else if (this.lastDirection === 'up') {
                this.body.setVelocityY(-this.speed);
                if (this.y <= this.targetY) {
                    this.stopWalking();
                }
            }
        } else {
            this.body.setVelocityY(0);
        }

        // Trigger automático de diálogo al estar cerca del jugador
        if (!this.hasSpoken && this.player) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
            if (dist < 60) {
                this.triggerDialogue();
            }
        }
    }

    stopWalking() {
        this.walking = false;
        this.body.setVelocityX(0);
        this.play(`idle1-${this.lastDirection}`);
    }

    triggerDialogue() {
        this.hasSpoken = true;
        this.walking = false;
        this.body.setVelocityX(0);
        this.play(`idle1-${this.lastDirection}`);

        // El diálogo se muestra a través del DialogueManager de la escena
        if (this.scene.showDialogue) {
            this.scene.showDialogue(this.message, this.name, () => {

                this.walking = true;
                this.play(`walk1-${this.lastDirection}`);
            });
        }
    }

    freeze() {
        this.frozen = true;
    }

    unfreeze() {
        this.frozen = false;
    }
}
