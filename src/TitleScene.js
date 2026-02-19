import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {

    constructor() {
        super({ key: 'TitleScene'});
    }

    preload() {
        //this.load.image('logo', '../assets/images/logo.png');
        //this.load.image('fondo', '../assets/images/fondo.png');
    }

    create() {
        this.add.image(400,300, 'fondo');
        this.add.image(400, 150, 'logo');
        const playButton = this.add.text(400, 300, 'NUEVA PARTIDA', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
        playButton.setInteractive();
        const configuracion = this.add.text(400, 350, 'CONFIGURACIÓN', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
        configuracion.setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('level');
        });

    }
}
