import Phaser from 'phaser'

/**
 * Clase que representa un cable que conecta componentes lógicos.
 * Transporta una señal desde una entrada hasta una salida.
 */
export default class Cable extends Phaser.GameObjects.Sprite {
    /**
     * Constructor del Cable
     * @param {Phaser.Scene} scene Escena a la que pertenece
     * @param {number} x Coordenada x
     * @param {number} y Coordenada y
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'cable');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this, true);
        this.setTint(0xffffff); // Blanco inicial
        this.setDisplaySize(100, 10); // Por defecto un cable de 100px de largo y 10px de grosor

        this.signal = false;
        this.inputSource = null; // De dónde viene la señal
        this.outputTarget = null; // A dónde va la señal
    }

    /**
     * Conecta el cable a una fuente de entrada
     * @param {object} source Objeto que tiene una propiedad 'output'
     */
    connectInput(source) {
        this.inputSource = source;
    }

    /**
     * Conecta el cable a un objetivo de salida
     * @param {object} target Objeto que tiene una propiedad 'inputA' o 'input'
     * @param {string} inputName Nombre de la propiedad de entrada ('inputA', 'inputB', 'input')
     */
    connectOutput(target, inputName = 'inputA') {
        this.outputTarget = { target, inputName };
    }

    /**
     * Actualiza la señal del cable y la propaga al objetivo
     */
    updateLogic() {
        if (this.inputSource) {
            this.signal = this.inputSource.output;
        }

        if (this.outputTarget) {
            this.outputTarget.target[this.outputTarget.inputName] = this.signal;
        }

        // Actualizar color según la señal
        if (this.signal) {
            this.setTint(0xfffb00); // Amarillo si hay señal (true)
        } else {
            this.setTint(0x444444);
        }

        return this.signal;
    }
}
