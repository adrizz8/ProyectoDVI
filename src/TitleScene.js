
class TitleScene extends Phaser.Scene {

    constructor() {
        super('TitleScene');
    }

    preload() {

        this.preload.image('logo', 'assets/images/logo.png');
        this.preload.image('fondo', 'assets/images/fondo.png');


    }

    create() {
        this.add.image(400,300, 'fondo');
        this.add.image(400, 150, 'logo');
        const playButton = this.add.text(400, 300, 'NUEVA PARTIDA', { fontSize: '32px', fill: '#000000' }).setOrigin(0.5);
        playButton.setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });


    }
}
