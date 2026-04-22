import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        //this.load.image('logo', '../assets/images/logo.png');
        //this.load.image('fondo', '../assets/images/fondo.png');
    }

    create() {
        // Fondo ajustado a la pantalla (1216x640)
        const background = this.add.image(608, 320, 'finalFaculty').setOrigin(0.5);
        background.setDisplaySize(1216, 640);

        // Configuración de los botones (más pequeños)
        const buttonWidth = 450;
        const buttonHeight = 70;
        const gap = 20; // Espacio entre botones


        // El segundo botón estará en 320 + (240/2) - (buttonHeight/2) = 320 + 120 - 55 = 385
        const firstButtonY = 260;
        const secondButtonY = firstButtonY + buttonHeight + gap;

        // Botón Nueva Partida
        const playButtonImage = this.add.image(608, firstButtonY, 'botonPrincipio').setInteractive();
        playButtonImage.setDisplaySize(buttonWidth, buttonHeight);

        const playButtonText = this.add.text(608, firstButtonY, 'Nueva Partida', {
            fontSize: '36px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            fontFamily: '"Pixelify Sans"',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Botón Configuración
        const configButtonImage = this.add.image(608, secondButtonY, 'botonPrincipio').setInteractive();
        configButtonImage.setDisplaySize(buttonWidth, buttonHeight);

        const configButtonText = this.add.text(608, secondButtonY, 'Configuración', {
            fontSize: '36px',
            fill: '#ffffff',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            fontFamily: '"Pixelify Sans"',
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Eventos de los botones
        playButtonImage.on('pointerdown', () => {
            this.scene.start('prematricula');
        });

        configButtonImage.on('pointerdown', () => {
            console.log('Configuración pulsada');
            // Aquí se podría abrir una escena de opciones si existiera
            this.scene.start('Configuracion',{novacio:"aa"});
        });

        // Feedback visual al pasar el ratón (opcional pero recomendado)
        playButtonImage.on('pointerover', () => playButtonImage.setTint(0xcccccc));
        playButtonImage.on('pointerout', () => playButtonImage.clearTint());
        configButtonImage.on('pointerover', () => configButtonImage.setTint(0xcccccc));
        configButtonImage.on('pointerout', () => configButtonImage.clearTint());
    }
}
