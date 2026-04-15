import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import Boton from '../gates/boton.js';
import Cable from '../gates/cable.js';
import AndGate from '../gates/and_gate.js';
import NotGate from '../gates/not_gate.js';
import OrGate from '../gates/or_gate.js';
import GameManager from '../manager.js';
import trigger from '../trigger.js';

export default class P1RightMazmorraScene extends Phaser.Scene {
    constructor() {
        super({ key: 'p1RightMazmorra' });
    }

    create() {
        const map = this.make.tilemap({ key: 'p1RightMazmorra' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        this.physics.world.setBounds(
            0,
            0,
            map.widthInPixels,
            map.heightInPixels
        );

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelo = map.createLayer('Suelo', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracion = map.createLayer('Decoracion', tileset, 0, 0);

        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });


        // Jugador
        // Recuperar posición guardada o usar la de defecto
        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();
        const startX = savedPos ? savedPos.x : 970;
        const startY = savedPos ? savedPos.y : 810;

        // Restaurar dirección si existía
        if (savedPos && savedPos.direction) {
            this.player.setDirection(savedPos.direction);
        }

        this.player = new Player(this, startX, startY, direccion, true);

        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracion);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        this.lobby = map.createFromObjects('triggers', {
            name: 'lobby',
            classType: trigger
        });

        this.physics.add.overlap(this.player, this.lobby, () => {
            this.scene.start('entradaMazmorra', { entrada: 'der' });
        });

        // Limpiamos la posición para que no se use de nuevo si cambiamos de nivel después
        if (savedPos) gm.clearPlayerPosition();
        this.player.setDepth(1);
        this.dialogueManager = new DialogueManager(this);

        // 1. Entradas (Botones)
        this.boton1 = new Boton(this, this.player, 190, 730);
        this.boton1.setDepth(1);
        this.boton2 = new Boton(this, this.player, 250, 730);
        this.boton2.setDepth(1);
        this.boton3 = new Boton(this, this.player, 410, 730);
        this.boton3.setDepth(1);
        this.boton4 = new Boton(this, this.player, 470, 730);
        this.boton4.setDepth(1);

        // 2. Puertas Lógicas         
        this.not_gate1 = new NotGate(this, 190, 680, this.player);
        this.not_gate1.setDepth(1);
        this.or_gate1 = new OrGate(this, 220, 580, this.player);
        this.or_gate1.setDepth(1);
        this.or_gate2 = new OrGate(this, 330, 580, this.player);
        this.or_gate2.setDepth(1);
        this.and_gate2 = new AndGate(this, 440, 580, this.player);
        this.and_gate2.setDepth(1);
        this.not_gate2 = new NotGate(this, 250, 420, this.player);
        this.not_gate2.setDepth(1);
        this.not_gate3 = new NotGate(this, 360, 460, this.player);
        this.not_gate3.setDepth(1);
        this.and_gate3 = new AndGate(this, 276, 300, this.player);
        this.and_gate3.setDepth(1);
        this.or_gate3 = new OrGate(this, 384, 300, this.player);
        this.or_gate3.setDepth(1);
        this.and_gate4 = new AndGate(this, 330, 142, this.player);
        this.and_gate4.setDepth(1);

        // 3. Cables (Aquí corregimos los nombres de las propiedades de destino)
        this.cable1 = new Cable(this, 190, 705);
        this.cable1.setDisplaySize(50, 10);
        this.cable1.connectInput(this.boton1);
        this.cable1.connectOutput(this.not_gate1, 'signalIn');

        this.cable2 = new Cable(this, 190, 655);
        this.cable2.setDisplaySize(50, 10);
        this.cable2.connectInput(this.not_gate1);
        this.cable2.connectOutput(this.or_gate1, 'inputA');

        this.cable3 = new Cable(this, 250, 655);
        this.cable3.setDisplaySize(90, 10);
        this.cable3.setDepth(0.5);
        this.cable3.connectInput(this.boton2);
        this.cable3.connectOutput(this.or_gate1, 'inputB');

        this.cable3_right = new Cable(this, 258, 710, 'cable_right_off');
        this.cable3_right.angle = 180;
        this.cable3_right.connectInput(this.boton2);
        this.cable3_right.connectOutput(this.or_gate2, 'inputA');

        this.cable3_horizontal = new Cable(this, 274, 702);
        this.cable3_horizontal.setDisplaySize(30, 10);
        this.cable3_horizontal.setDepth(0.5);
        this.cable3_horizontal.angle = 0;
        this.cable3_horizontal.connectInput(this.boton2);

        this.cable3_left = new Cable(this, 292, 694, 'cable_right_off');
        this.cable3_left.angle = 0;
        this.cable3_left.connectInput(this.boton2);

        this.cable3_up = new Cable(this, 300, 655);
        this.cable3_up.setDisplaySize(90, 10);
        this.cable3_up.setDepth(0.5);
        this.cable3_up.connectInput(this.boton2);

        this.cable4 = new Cable(this, 410, 655);
        this.cable4.setDisplaySize(90, 10);
        this.cable4.setDepth(0.5);
        this.cable4.connectInput(this.boton3);
        this.cable4.connectOutput(this.and_gate2, 'inputA');

        this.cable4_left = new Cable(this, 402, 710, 'cable_right_off');
        this.cable4_left.angle = 270;
        this.cable4_left.connectInput(this.boton3);
        this.cable4_left.connectOutput(this.or_gate2, 'inputB');

        this.cable4_horizontal = new Cable(this, 386, 702);
        this.cable4_horizontal.setDisplaySize(30, 10);
        this.cable4_horizontal.setDepth(0.5);
        this.cable4_horizontal.angle = 0;
        this.cable4_horizontal.connectInput(this.boton3);

        this.cable4_right = new Cable(this, 368, 694, 'cable_right_off');
        this.cable4_right.angle = 90;
        this.cable4_right.connectInput(this.boton3);

        this.cable4_up = new Cable(this, 360, 655);
        this.cable4_up.setDisplaySize(90, 10);
        this.cable4_up.setDepth(0.5);
        this.cable4_up.connectInput(this.boton3);

        this.cable5 = new Cable(this, 470, 680);
        this.cable5.connectInput(this.boton4);
        this.cable5.connectOutput(this.and_gate2, 'inputB');

        this.cable6 = new Cable(this, 220, 530);
        this.cable6.connectInput(this.or_gate1);
        this.cable6.connectOutput(this.not_gate2, 'signalIn');

        this.cable_right6 = new Cable(this, 228, 470, 'cable_right_off');
        this.cable_right6.angle = 180;
        this.cable_right6.connectInput(this.or_gate1);

        this.cable_left6 = new Cable(this, 240, 454, 'cable_right_off');
        this.cable_left6.angle = 0;
        this.cable_left6.connectInput(this.or_gate1);

        this.cable_up6 = new Cable(this, 250, 390);
        this.cable_up6.connectInput(this.not_gate2);
        this.cable_up6.connectOutput(this.and_gate3, 'inputA');

        this.cable7 = new Cable(this, 440, 530);
        this.cable7.connectInput(this.and_gate2);
        this.cable7.connectOutput(this.and_gate3, 'inputB');

        this.cable_left7 = new Cable(this, 432, 470, 'cable_right_off');
        this.cable_left7.angle = 270;
        this.cable_left7.connectInput(this.and_gate2);

        this.cable_right7 = new Cable(this, 420, 454, 'cable_right_off');
        this.cable_right7.angle = 90;
        this.cable_right7.connectInput(this.and_gate2);

        this.cable_up7 = new Cable(this, 412, 395);
        this.cable_up7.connectInput(this.and_gate2);
        this.cable_up7.connectOutput(this.or_gate3, 'inputB');

        this.cable_right8 = new Cable(this, 338, 510, 'cable_right_off');
        this.cable_right8.angle = 180;
        this.cable_right8.connectInput(this.or_gate2);
        this.cable_right8.connectOutput(this.not_gate3, 'signalIn');

        this.cable_left8 = new Cable(this, 350, 494, 'cable_right_off');
        this.cable_left8.angle = 0;
        this.cable_left8.connectInput(this.or_gate2);

        this.cable_right_up8 = new Cable(this, 315, 494, 'cable_right_off');
        this.cable_right_up8.angle = 90;
        this.cable_right_up8.connectInput(this.or_gate2);

        this.cable_up8 = new Cable(this, 307, 430);
        this.cable_up8.setDisplaySize(140, 10);
        this.cable_up8.connectInput(this.or_gate2);
        this.cable_up8.connectOutput(this.and_gate3, 'inputB');

        this.cable_9 = new Cable(this, 361, 394);
        this.cable_9.connectInput(this.not_gate3);
        this.cable_9.connectOutput(this.or_gate3, 'inputA');


        this.cable_right10 = new Cable(this, 284, 230, 'cable_right_off');
        this.cable_right10.angle = 180;
        this.cable_right10.connectInput(this.and_gate3);

        this.cable_left10 = new Cable(this, 296, 214, 'cable_right_off');
        this.cable_left10.angle = 0;
        this.cable_left10.connectInput(this.and_gate3);
        this.cable_right10.connectOutput(this.and_gate4, 'inputA');

        this.cable_left11 = new Cable(this, 376, 230, 'cable_right_off');
        this.cable_left11.angle = 270;
        this.cable_left11.connectInput(this.or_gate3);

        this.cable_right11 = new Cable(this, 364, 214, 'cable_right_off');
        this.cable_right11.angle = 90;
        this.cable_right11.connectInput(this.or_gate3);
        this.cable_right11.connectOutput(this.and_gate4, 'inputB');

        this.cableSalida_right = new Cable(this, 322, 74, 'cable_right_off');
        this.cableSalida_right.angle = 270
        this.cableSalida_right.connectInput(this.and_gate3);

        this.cableSalida = new Cable(this, 226, 66);
        this.cableSalida.setDisplaySize(202, 10)
        this.cableSalida.angle = 0;
        this.cableSalida.connectInput(this.and_gate3);
        this.cableSalida.setCompleted('puzleDerechaCompletado');

        this.circuitComponents = [
            this.boton1, this.boton2, this.boton3, this.boton4,
            this.not_gate1, this.not_gate2, this.not_gate3,
            this.cable1, this.cable2, this.cable3,
            this.cable3_right, this.cable3_horizontal, this.cable3_left, this.cable3_up,
            this.cable4, this.cable4_left, this.cable4_horizontal, this.cable4_right, this.cable4_up,
            this.cable5,
            this.or_gate1, this.or_gate2, this.or_gate3, this.and_gate2, this.and_gate3, this.and_gate4,
            this.cable6, this.cable_left6, this.cable_right6, this.cable_up6,
            this.cable7, this.cable_left7, this.cable_right7, this.cable_up7,
            this.cable_right10, this.cable_left10,
            this.cable_left11, this.cable_right11,
            this.cable_left8, this.cable_right8, this.cable_up8, this.cable_right_up8,
            this.cable_9,
            this.cableSalida_right, this.cableSalida
        ];

        // Ajustes de profundidad y tamaño masivos (opcional, simplificado)
        this.circuitComponents.forEach(c => {
            if (c.body && c.body.updateFromGameObject) c.body.updateFromGameObject();
        });

        // Menu con espacio
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.dialogueManager && this.dialogueManager.dialogBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        });

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });
    }

    update(t, dt) {
        if (this.player && this.player.update) {
            this.player.update(t, dt);
        }

        // Actualizar la lógica de todos los componentes del circuito
        this.circuitComponents.forEach(component => {
            if (component.updateLogic) component.updateLogic();
        });
    }
}
