import Phaser from 'phaser'

export default class Cable extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'cable_off');
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

        this.setTexture(this.signal ? 'cable_on' : 'cable_off');
        return this.signal;
    }
}