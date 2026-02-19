
class title extends Phaser.Scene {

    constructor() {
        super({ key: 'title' });
    }

    preload() {

        this.preload.image('logo', 'assets/images/logo.png');
        this.preload.image('fondo', 'assets/images/fondo.png');


    }

    create(){
        this.scene.start('TitleScene');
    }
}