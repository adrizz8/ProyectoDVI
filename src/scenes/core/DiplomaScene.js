import Phaser from 'phaser';
import GameManager from '../../core/manager.js';

export default class DiplomaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DiplomaScene' });
    }

    create(){


        const { width, height } = this.scale;
        const gm = GameManager.getInstance();
        const userName = gm.playerStats[gm.ActualPlayers[0]]?.displayName || 'STUDENT';
  
        const time = this.registry.get('horasJuego') ?? 0;
        const minutos = Math.floor(time / 60);
        // Asegurarse de que la cámara sea visible
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
        this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'diploma'
        )
        .setOrigin(0.5)
        .setScrollFactor(0);

        this.add.text(430, 250, userName, {
            fontFamily: 'SFDistantGalaxy, monospace',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        })
        .setDepth(10);

        this.add.text(410, 370, minutos, {
            fontFamily: 'SFDistantGalaxy, monospace',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        })
        .setDepth(10);


                
        // Texto para continuar, oculto al principio
        this.continueText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 45,
            'Pulsa cualquier tecla para continuar',
            {
                fontFamily: 'SFDistantGalaxy, monospace',
                fontSize: '26px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        )
        .setOrigin(0.5)
        .setDepth(20)
        .setScrollFactor(0)
        .setAlpha(0); // Empieza invisible, pero existe

        this.canContinue = false;

        // Después de 2 segundos aparece poco a poco
        this.time.delayedCall(2000, () => {
            this.canContinue = true;

            // Fade in suave
            this.tweens.add({
                targets: this.continueText,
                alpha: 1,
                duration: 800,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    // Cuando ya ha aparecido, empieza a parpadear
                    this.tweens.add({
                        targets: this.continueText,
                        alpha: 0.35,
                        duration: 700,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        });

        this.input.keyboard.once('keydown', () => {
            if (!this.canContinue) return;

            this.scene.start('salaLanchares');
        });

        this.input.once('pointerdown', () => {
            if (!this.canContinue) return;

            this.scene.start('salaLanchares');
        });
    }
}