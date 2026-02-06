class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }   



    create() {
        this.scene.start('Level');
    }

}