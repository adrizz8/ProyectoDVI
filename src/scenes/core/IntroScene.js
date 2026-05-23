import Phaser from 'phaser';
import TitleScene from './TitleScene.js';

export default class IntroScene extends Phaser.Scene {
    constructor() {
        super('IntroScene');
    }

    preload() {
        this.load.image('matricula', 'assets/matricula.png');
        this.load.image('logo', 'assets/logo.png');

    }

    //Formulario de matriculacion del jugador (campos a añadir y revisar)
    create() {
        this.add.image(608, 320, 'matricula');
        const nameInput = this.add.dom(400, 195, 'input', { type: 'text', fontSize: '40px', padding: '10px', width: '250px', fontFamily: 'Distant Galaxy', backgroundColor: 'transparent', color: '#ffffff', border: '2px solid #ffffff', outline: 'none' });
        const nameInputOriginalX = nameInput.x;
        const personalidadSelect = this.add.dom(405, 280, 'select', 
            {     
                fontSize: '40px',
                padding: '10px',
                width: '255px',
                fontFamily: 'Distant Galaxy',   // tu fuente personalizada
                backgroundColor: 'transparent',
                color: '#ffffff',               // color del texto
                border: '2px solid #ffffff',    // opcional, para que se vea el borde
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',             // quita el estilo nativo del navegador
                WebkitAppearance: 'none',  
                fontweight: 'bold',
            });
        const option1 = document.createElement('option');
        option1.value = 'informatica';
        option1.text = 'Informática';
        option1.style.color = '#000000';
        option1.style.backgroundColor = '#ffffff';
        personalidadSelect.node.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = 'Computadores';
        option2.text = 'Computadores';
        option2.style.color = '#000000';
        option2.style.backgroundColor = '#ffffff';
        personalidadSelect.node.appendChild(option2);
        const option3 = document.createElement('option');
        option3.value = 'Software';
        option3.text = 'Software';
        option3.style.color = '#000000';
        option3.style.backgroundColor = '#ffffff';
        personalidadSelect.node.appendChild(option3);
        const option4 = document.createElement('option');
        option4.value = 'Videojuegos';
        option4.text = 'Videojuegos';
        option4.style.color = '#000000';
        option4.style.backgroundColor = '#ffffff';
        personalidadSelect.node.appendChild(option4);

        const playButton = this.add.text(550, 550, 'MATRICULARSE', {fontfamily:'Distant Galaxy', fontSize: '40px', fill: '#ffffff', fontWeight: 'bold', stroke: '#000000', strokeThickness: 6 }).setOrigin(0.5);
        playButton.setInteractive();

        playButton.on('pointerover', () => {
                this.tweens.add({
                targets: playButton,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 150,
                ease: 'Power2'
            });
            playButton.setStyle({ fill: '#FFD700' });
        });

playButton.on('pointerout', () => {
    this.tweens.add({
        targets: playButton,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
    });
    playButton.setStyle({ fill: '#ffffff' });
});

        playButton.on('pointerdown', () => {
    const playerName = nameInput.node.value.trim(); // .trim() elimina espacios en blanco
    const playerPersonalidad = personalidadSelect.node.value;

    if (playerName === '') {
        // Sacude el input para indicar que falta el nombre
        this.tweens.add({
            targets: nameInput,
            x: nameInput.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 4,
            ease: 'Power2',
            onComplete: () => {
            nameInput.x = nameInputOriginalX; // asegura que vuelve al sitio exacto
        }
        });

        // Muestra un mensaje de error
        const errorText = this.add.text(400, 148, '¡Introduce tu nombre!', {
            fontSize: '30px',
            fill: '#ff4444',
            fontFamily: 'Distant Galaxy',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // El mensaje desaparece tras 2 segundos
        this.time.delayedCall(2000, () => errorText.destroy());

        return; // detiene la ejecución, no cambia de escena
    }

    this.scene.start('level3', { name: playerName, personalidad: playerPersonalidad });
});
    }

}

