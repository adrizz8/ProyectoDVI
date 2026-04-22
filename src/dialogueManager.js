import Phaser from 'phaser';
import GameManager from './manager';

class Datos {
    constructor(nombre, texto, onFinish) {
        this.contador = 0;
        this.nombre = nombre;
        this.textoSplit = texto;
        this.onFinish = onFinish;
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



        // Posicionamos en el centro horizontal (1216 / 2 = 608) y cerca de la parte inferior (640 - 90 = 550)
        this.dialogueBox = this.scene.add.container(0, 0).setDepth(2000).setVisible(false);

        // Fondo del diálogo
        const bg = this.scene.add.graphics();
        const bgWidth = 900;
        const bgHeight = 160;
        bg.fillStyle(0x000000, 0.85);
        bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 15);

        this.dialogueText = this.scene.add.text(0, 0, "", {
            fontSize: '26px',
            fontFamily: '"Outfit", sans-serif',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: bgWidth - 80 },
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 4, stroke: true, fill: true }
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
            fontSize: '22px',
            fontFamily: '"Orbitron", sans-serif',
            fill: '#00d2ff', // Cyber Blue
            align: 'center',
            fontWeight: '700',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
        }).setOrigin(0.5, 0.5).setVisible(false);

        this.dialogueBox.add([this.nameBg, this.nameText]);

        // Evento para avanzar diálogo
        this.scene.input.keyboard.on('keydown', (event) => {
            if (event.code !== 'Space' && event.code !== 'Enter' && event.code !== 'KeyE') return;

            // Solo procesamos si el cuadro está visible, no está cerrándose y hay mensajes en cola
            if (!this.dialogueBox.visible || this.dialogueBox.alpha < 0.8 || this.ini >= this.fin) return;

            // Si el texto se está escribiendo, lo mostramos entero instantáneamente
            if (this.isTyping) {
                this.completeTypewriter();
                return;
            }

            this.next_text();

            if (this.current_message === '') {
                // Hemos agotado el mensaje actual (todas sus partes)
                const onFinish = this.full_message[this.ini].onFinish;

                this.ini += 1;
                if (this.ini === this.fin) {
                    // Se ha vaciado la cola de mensajes
                    this.ini = 0;
                    this.fin = 0;
                    this.hideDialogue();

                    // Descongela al jugador si existe
                    if (this.scene && this.scene.player && this.scene.player.unfreeze) {
                        this.scene.player.unfreeze();
                    }

                    if (onFinish && typeof onFinish === 'function') {
                        onFinish();
                    }
                } else {
                    // Hay más mensajes en espera
                    this._displayCurrent();
                }
            } else {
                // El mensaje actual tiene más partes
                this.typeWriteText(this.current_message);
            }
        });
    }

    /**
     * Efecto de máquina de escribir para el texto
     */
    typeWriteText(text) {
        this.isTyping = true;
        this.fullTextToType = text;
        this.dialogueText.setText("");

        const gm= GameManager.getInstance();
        
        let charIndex = 0;
        if (this.typewriterTimer) this.typewriterTimer.remove();

        this.typewriterTimer = this.scene.time.addEvent({
            delay: gm.TextNum,
            callback: () => {
                this.dialogueText.setText(text.substr(0, charIndex + 1));
                charIndex++;
                if (charIndex === text.length) {
                    this.isTyping = false;
                }
            },
            repeat: text.length - 1
        });
    }

    completeTypewriter() {
        if (this.typewriterTimer) this.typewriterTimer.remove();
        this.dialogueText.setText(this.fullTextToType);
        this.isTyping = false;
    }

    /**
     * Muestra el mensaje actual de la cola en la interfaz
     * @private
     */
    _displayCurrent() {
        const nextMsg = this.full_message[this.ini];
        if (!nextMsg) return;

        if (nextMsg.nombre === '') {
            this.hideName();
        } else {
            this.nameText.setText(nextMsg.nombre);
            this.showName();
        }

        this.next_text();
        this.typeWriteText(this.current_message);
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

        this.full_message[this.fin] = new Datos(nombre, message.split(' '), onFinish);
        this.fin += 1;

        // Si la caja no es visible O si está en medio de un fundido de salida (alpha bajo)
        // O si la cola estaba vacía (ini acaba de resetearse), (re)iniciamos la visualización
        if (!this.dialogueBox.visible || this.dialogueBox.alpha < 0.9 || (this.ini === this.fin - 1)) {
            this.scene.tweens.killTweensOf(this.dialogueBox);

            const cam = this.scene.cameras.main;
            this.dialogueBox.setPosition(cam.worldView.x + 608, cam.worldView.y + 530);

            this.dialogueBox.setVisible(true);
            this.dialogueBox.setAlpha(1);

            // Congela al jugador mientras el diálogo está activo
            if (this.scene && this.scene.player && this.scene.player.freeze) {
                this.scene.player.freeze();
            }

            this._displayCurrent();
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

        while (cont < 600 && queda_text) {
            if (this.full_message[this.ini].contador >= this.full_message[this.ini].textoSplit.length) {
                queda_text = false;
            } else {
                cont += this.full_message[this.ini].textoSplit[this.full_message[this.ini].contador].length + 1;

                if (cont < 600) {
                    this.current_message += this.full_message[this.ini].textoSplit[this.full_message[this.ini].contador] + ' ';
                    this.full_message[this.ini].contador += 1;
                }
            }
        }
    }
}
