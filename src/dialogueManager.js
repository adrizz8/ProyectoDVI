import Phaser from 'phaser';

/**
 * Clase que gestiona el sistema de diálogos de forma centralizada.
 */
export default class DialogueManager {
    /**
     * @param {Phaser.Scene} scene La escena donde se mostrará el diálogo
     */
    constructor(scene) {
        this.scene = scene;
        this.setupDialogue();
    }

    /**
     * Crea los elementos visuales del cuadro de diálogo
     */
    setupDialogue() {

        this.onFinish=null;

        this.dialogueBox = this.scene.add.container(400, 440).setDepth(100).setVisible(false);

        // Fondo del diálogo con bordes redondeados
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(-250, -35, 500, 70, 15);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-250, -35, 900, 100, 15);

        this.dialogueText = this.scene.add.text(0, 0, "", {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: 875 }
        }).setOrigin(0.25,0.3);

        this.dialogueBox.add([bg, this.dialogueText]);

        // Evento para cerrar al pulsar cualquier tecla
        this.scene.input.keyboard.on('keydown', () => {
            if (this.dialogueBox.visible) {
                this.hideDialogue();

                if (this.onFinish!=null) {
                    this.onFinish();
                }
            
            }
        });
    }

    /**
     * Muestra un mensaje en pantalla de forma indefinida
     */
    showDialogue(message) {
        this.dialogueText.setText(message);
        this.dialogueBox.setVisible(true);
        this.dialogueBox.setAlpha(0);

        // Animación de aparición (fade in)
        this.scene.tweens.add({
            targets: this.dialogueBox,
            alpha: 1,
            duration: 200
        });
    }
    /**
     * Muestra un mensaje y ejecuta un codigo cuando se quita
     */
    showDialogue(message,onFinish) {
        this.dialogueText.setText(message);
        this.dialogueBox.setVisible(true);
        this.dialogueBox.setAlpha(0);
        this.onFinish = onFinish;

        // Animación de aparición (fade in)
        this.scene.tweens.add({
            targets: this.dialogueBox,
            alpha: 1,
            duration: 200
        });
    }

    /**
     * Oculta el cuadro de diálogo con una animación
     */
    hideDialogue() {
        this.scene.tweens.add({
            targets: this.dialogueBox,
            alpha: 0,
            duration: 200,
            onComplete: () => this.dialogueBox.setVisible(false)
        });
    }
}
