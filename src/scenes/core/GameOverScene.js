import Phaser from 'phaser';
import GameManager from '../../core/manager.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        const { width, height } = this.scale;
        const gm = GameManager.getInstance();
        const userName = gm.playerStats[gm.ActualPlayers[0]]?.displayName || 'STUDENT';

        // Asegurarse de que la cámara sea visible
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Fondo azul estilo BSOD (Blue Screen of Death)
        this.add.rectangle(0, 0, width, height, 0x0000aa).setOrigin(0);

        // Texto de error
        const errorText = [
            '*** STOP: 0x0000007B (0xF741B84C,0xC0000034,0x00000000,0x00000000)',
            '',
            `SYSTEM_ERROR_${userName.toUpperCase()}_HAS_DIED`,
            '',
            'A problem has been detected and the simulation has been terminated',
            'to prevent further damage to your sanity.',
            '',
            'If this is the first time you\'ve seen this error screen,',
            'restart your student life. If this screen appears again, follow',
            'these steps:',
            '',
            'Check for any new hardware or software you have installed.',
            'If this is a new installation, ask your professor for help.',
            '',
            'Technical information:',
            '*** ERROR: VECTOR_SUBSCRIPT_OUT_OF_RANGE',
            `*** AT ADDRESS: 0x4341524C41 (${userName.toUpperCase()})`,
            '',
            'Press any key to REBOOT the simulation...'
        ];

        this.add.text(50, 50, errorText.join('\n'), {
            fontFamily: 'Courier New, monospace',
            fontSize: '20px',
            color: '#ffffff',
            lineSpacing: 10
        });

        // Parpadeo del cursor al final
        const rebootText = this.add.text(50, 550, '>', {
            fontFamily: 'Courier New, monospace',
            fontSize: '20px',
            color: '#ffffff'
        });

        this.tweens.add({
            targets: rebootText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Reiniciar al pulsar cualquier tecla
        this.input.keyboard.on('keydown', () => {
            GameManager.reset();
            this.scene.start('TitleScene'); 
        });

        this.input.on('pointerdown', () => {
            GameManager.reset();
            this.scene.start('TitleScene');
        });
    }
}
