import Phaser from 'phaser';

class Datos {
    constructor(nombre, texto) {
        this.contador = 0;
        this.nombre = nombre;
        this.textoSplit = texto;
    }

    incrementar() {
        this.contador++;
    }
}

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
        this.full_message = [];
        this.ini = 0;
        this.fin = 0;
        this.current_message = '';
        this.onFinish = null;

        // Posicionamos en el centro horizontal (1216 / 2 = 608) y cerca de la parte inferior (640 - 90 = 550)
        this.dialogueBox = this.scene.add.container(608, 550).setDepth(2000).setVisible(false);

        // Fondo del diálogo
        const bg = this.scene.add.graphics();
        const bgWidth = 900;
        const bgHeight = 100;
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);

        this.dialogueText = this.scene.add.text(0, 0, "", {
            fontSize: '22px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: bgWidth - 60 }
        }).setOrigin(0.5, 0.5);

        this.dialogueBox.add([bg, this.dialogueText]);

        // Caja del nombre
        this.nameBg = this.scene.add.graphics().setVisible(false);
        this.nameBg.fillStyle(0x000000, 1);
        this.nameBg.fillRoundedRect(-(bgWidth / 2) + 10, -bgHeight / 2 - 45, 200, 40, 10);
        this.nameBg.lineStyle(2, 0xffffff, 1);
        this.nameBg.strokeRoundedRect(-(bgWidth / 2) + 10, -bgHeight / 2 - 45, 200, 40, 10);

        // Texto del nombre
        this.nameText = this.scene.add.text(-(bgWidth / 2) + 110, -bgHeight / 2 - 25, "", {
            fontSize: '18px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5).setVisible(false);

        this.dialogueBox.add([this.nameBg, this.nameText]);

        // Evento para avanzar diálogo
        this.scene.input.keyboard.on('keydown', (event) => {
            // Solo procesamos si el cuadro está visible y no está en medio de una animación de cierre
            if (!this.dialogueBox.visible || this.dialogueBox.alpha < 0.8) return;

            this.next_text();
                
            if (this.current_message === '') {
                this.ini += 1;
                if (this.ini === this.fin) {
                    this.ini = 0;
                    this.fin = 0;
                    this.hideDialogue();

                    if (this.onFinish !== null) {
                        const callback = this.onFinish;
                        this.onFinish = null; 
                        callback();
                    }
                } else {
                    const nextMsg = this.full_message[this.ini];
                    if (!nextMsg || nextMsg.nombre === '') {
                        this.hideName();
                    } else {
                        this.nameText.setText(nextMsg.nombre);
                        this.showName();
                    }
                    this.next_text();
                    this.dialogueText.setText(this.current_message);
                }
            } else {
                this.dialogueText.setText(this.current_message);
            }
        });
    }

    /**
     * Muestra un mensaje en pantalla (Formato unificado)
     */
    showDialogue(message, nombre = '', onFinish = null) {
        // Manejamos si el segundo parámetro es el callback (estilo antiguo)
        if (typeof nombre === 'function') {
            onFinish = nombre;
            nombre = '';
        }

        // Aseguramos que nombre sea un string si es null/undefined
        if (!nombre) nombre = '';

        this.full_message[this.fin] = new Datos(nombre, message.split(' '));
        this.fin += 1;

        if (!this.dialogueBox.visible || this.dialogueBox.alpha < 0.1) {
            if (this.scene.player) {
                this.scene.player.freeze();
            }

            this.onFinish = onFinish;
            this.ini = 0;
            this.next_text();
            this.dialogueText.setText(this.current_message);
            this.dialogueBox.setVisible(true);
            this.dialogueBox.setAlpha(0);

            this.scene.tweens.killTweensOf(this.dialogueBox);
            this.scene.tweens.add({
                targets: this.dialogueBox,
                alpha: 1,
                duration: 200
            });

            if (nombre !== '') {
                this.nameText.setText(nombre);
                this.showName();
            } else {
                this.nameText.setText('');
                this.hideName();
            }
        }
    }

    /**
     * Método alternativo para compatibilidad (usado en prematricula_scene)
     */
    showDialogueM(message, onFinish, nombre = '') {
        this.showDialogue(message, nombre, onFinish);
    }

    hideDialogue() {
        this.scene.tweens.killTweensOf(this.dialogueBox);
        this.scene.tweens.add({
            targets: this.dialogueBox,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.dialogueBox.setVisible(false);
                if (this.scene.player) {
                    this.scene.player.unfreeze();
                }
            }
        });
    }

    hideName() {
        this.scene.tweens.killTweensOf([this.nameBg, this.nameText]);
        this.scene.tweens.add({
            targets: [this.nameBg, this.nameText],
            alpha: 0,
            duration: 150,
            onComplete: () => {
                this.nameBg.setVisible(false);
                this.nameText.setVisible(false);
            }
        });
    }

    showName() {
        this.scene.tweens.killTweensOf([this.nameBg, this.nameText]);
        this.nameBg.setVisible(true);
        this.nameText.setVisible(true);
        this.scene.tweens.add({
            targets: [this.nameBg, this.nameText],
            alpha: 1,
            duration: 150
        });
    }

    next_text() {
        var cont = 0;
        var queda_text = true;
        this.current_message = '';

        if (!this.full_message[this.ini]) return;

        while (cont < 200 && queda_text) {
            if (this.full_message[this.ini].contador >= this.full_message[this.ini].textoSplit.length) {
                queda_text = false;
            } else {
                cont += this.full_message[this.ini].textoSplit[this.full_message[this.ini].contador].length + 1;

                if (cont < 200) {
                    this.current_message += this.full_message[this.ini].textoSplit[this.full_message[this.ini].contador] + ' ';
                    this.full_message[this.ini].contador += 1;
                }
            }
        }
    }
}
