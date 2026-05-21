import Phaser from 'phaser'

export default class Cable extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, image = 'cable_off') {
        super(scene, x, y, image);

        // Configuración por defecto solicitada
        this.setOrigin(0.5, 0.5);
        this.setDepth(0);
        this.angle = 90;

        if (image === 'cable_left_off') {
            this.setDisplaySize(26, 26);
            this.left = true;
            this.right = false;
        } else if (image === 'cable_right_off') {
            this.setDisplaySize(26, 26);
            this.left = false;
            this.right = true;
        } else {
            this.setDisplaySize(100, 10);
            this.left = false;
            this.right = false;
        }

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);

        this.signal = false;
        this.inputSource = null;
        this.outputTarget = null;
    }

    connectInput(source) {
        this.inputSource = source;
    }

    /**
     * @param {string} inputName Nombre de la propiedad (usar 'signalIn', 'inputA', etc.)
     */
    connectOutput(target, inputName = 'signalIn') { // CAMBIADO: Valor por defecto seguro
        this.outputTarget = { target, inputName };
    }

    updateLogic() {
        if (this.inputSource) {
            this.signal = this.inputSource.output;
        }

        if (this.outputTarget) {
            this.outputTarget.target[this.outputTarget.inputName] = this.signal;
        }

        if (this.left) {
            this.setTexture(this.signal ? 'cable_left_on' : 'cable_left_off');
        } else if (this.right) {
            this.setTexture(this.signal ? 'cable_right_on' : 'cable_right_off');
        } else {
            this.setTexture(this.signal ? 'cable_on' : 'cable_off');
        }
        return this.signal;
    }
}