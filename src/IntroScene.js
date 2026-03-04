import Phaser from 'phaser';
import TitleScene from './TitleScene.js';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    preload() {
        this.load.image('fondo', 'assets/fondo.png');
        this.load.image('logo', 'assets/logo.png');

    }

    //Formulario de matriculacion del jugador (campos a añadir y revisar)
    create() {
        this.add.image(400, 300, 'fondo');
        const namebuttontag = this.add.text(400, 150, 'NOMBRE', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
        const personalidadtag = this.add.text(400, 250, 'CARRERA', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
        const nameInput = this.add.dom(400, 200, 'input', { type: 'text', fontSize: '24px', padding: '10px', width: '200px' });
        const personalidadSelect = this.add.dom(400, 320, 'select', { fontSize: '24px', padding: '10px', width: '200px' });
        const option1 = document.createElement('option');
        option1.value = 'informatica';
        option1.text = 'Informática';
        personalidadSelect.node.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = 'Computadores';
        option2.text = 'Computadores';
        personalidadSelect.node.appendChild(option2);
        const option3 = document.createElement('option');
        option3.value = 'Software';
        option3.text = 'Software';
        personalidadSelect.node.appendChild(option3);
        const option4 = document.createElement('option');
        option4.value = 'Videojuegos';
        option4.text = 'Videojuegos';
        personalidadSelect.node.appendChild(option4);

        const playButton = this.add.text(400, 400, 'MATRICULARSE', { fontSize: '32px', fill: '#000000', fontWeight: 'bold' }).setOrigin(0.5);
        playButton.setInteractive();

        playButton.on('pointerdown', () => {
            const playerName = nameInput.node.value;
            const playerPersonalidad = personalidadSelect.node.value;
            this.scene.start('level2', { name: playerName, personalidad: playerPersonalidad });
        });
    }

}

