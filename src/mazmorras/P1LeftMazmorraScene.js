import Player from '../personajes/player.js';
import DialogueManager from '../dialogueManager.js';
import Phaser from 'phaser';
import GameManager from '../manager.js';
import Boton from '../gates/boton.js';
import Cable from '../gates/cable.js';
import AndGate from '../gates/and_gate.js';
import NotGate from '../gates/not_gate.js';
import trigger from '../trigger.js';
import EventManager from '../eventManager.js';
import amigo1 from '../personajes/amigo1.js';

export default class P1LeftMazmorraScene extends Phaser.Scene {
    constructor() {
        super({ key: 'p1LeftMazmorra' });
    }

    create(data) {

        var entradas = new Map();
        entradas.set('lobby', { x: 1160, y: 570, direccion: 'left' });
        entradas.set('salida_miniboss', { x: 375, y: 255, direccion: 'down' });

        const map = this.make.tilemap({ key: 'p1LeftMazmorra' });
        const tileset = map.addTilesetImage('tilesetmazmorra', 'tilesMazmorra');

        // Capas
        const colisiones = map.createLayer('Colisiones', tileset, 0, 0);
        const suelo = map.createLayer('Suelo', tileset, 0, 0);
        const paredes = map.createLayer('Paredes', tileset, 0, 0);
        const decoracionypuerta = map.createLayer('Decoracionypuerta', tileset, 0, 0);

        suelo.setDepth(0);
        decoracionypuerta.setDepth(0.3);
        paredes.setDepth(0.2);

        // Colisiones
        colisiones.setCollisionByExclusion([-1]);
        colisiones.setVisible(false);
        paredes.setCollisionByProperty({ collides: true });

        // Jugador
        // Recuperar posición guardada o usar la de defecto
        const gm = GameManager.getInstance();
        const savedPos = gm.getPlayerPosition();

        gm.addNivel('p1LeftMazmorra');

        // Spawn del jugador
        const posi = entradas.get(data.entrada) || entradas.get('lobby');
        const spawnX = posi.x;
        const spawnY = posi.y;
        const direccion = posi.direccion;

        this.player = new Player(this, spawnX, spawnY, direccion, true);
        this.player.setDirection(direccion);

        if (savedPos) {
            gm.clearPlayerPosition();
            this.player.setDirection(savedPos.direction);
            this.player.setPosition(savedPos.x, savedPos.y);
        }

        this.physics.add.collider(this.player, colisiones);
        this.physics.add.collider(this.player, paredes);
        this.physics.add.collider(this.player, decoracionypuerta);

        // Cámara
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        this.dialogueManager = new DialogueManager(this);

        this.lobby = map.createFromObjects('triggers', {
            name: 'lobby',
            classType: trigger
        });
        this.miniboss = map.createFromObjects('triggers', {
            name: 'miniboss',
            classType: trigger
        });
        this.physics.add.overlap(this.player, this.lobby, () => {
            this.scene.start('entradaMazmorra', { entrada: 'izq' });
        });
        this.physics.add.overlap(this.player, this.miniboss, () => {
            this.scene.start('salaMiniBoss');
        });


        // Limpiamos la posición para que no se use de nuevo si cambiamos de nivel después
        if (savedPos) gm.clearPlayerPosition();
        this.player.setDepth(1);
        this.dialogueManager = new DialogueManager(this);
        this.puzleCompletadoLocal = false;
        this.puzleTimer = 0;

        // ── Helpers ───────────────────────────────────────────────────────────────
        const tc = obj => {
            const hw = obj.width / 2;
            const hh = obj.height / 2;
            if (!obj.rotation) return { x: obj.x + hw, y: obj.y - hh };
            const rad = (obj.rotation * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            return {
                x: obj.x + cos * hw + sin * hh,
                y: obj.y + sin * hw - cos * hh
            };
        };

        const byName = (layer, name) => layer.find(o => o.name === name);

        // ── Capas de objetos ──────────────────────────────────────────────────────
        const botonLayer = map.getObjectLayer('boton').objects;
        const andLayer = map.getObjectLayer('and').objects;
        const notLayer = map.getObjectLayer('not').objects;
        const cableLayer = map.getObjectLayer('cable').objects;

        // ── 1. Botones ────────────────────────────────────────────────────────────
        const mkBoton = name => {
            const obj = byName(botonLayer, name);
            const p = tc(obj);
            const b = new Boton(this, this.player, p.x, p.y, name);
            b.output = GameManager.getInstance().getButtonState(this.scene.key, name);
            b.updateVisuals();
            b.setDisplaySize(obj.width, obj.height);
            if (b.body && b.body.updateFromGameObject) b.body.updateFromGameObject();
            b.setDepth(1);
            return b;
        };
        this.boton1 = mkBoton('boton1');
        this.boton2 = mkBoton('boton2');
        this.boton3 = mkBoton('boton3');
        this.boton4 = mkBoton('boton4');

        // ── 2. Puertas NOT ────────────────────────────────────────────────────────
        const mkNot = name => {
            const obj = byName(notLayer, name);
            const p = tc(obj);
            const g = new NotGate(this, p.x, p.y, this.player);
            g.setDisplaySize(obj.width, obj.height);
            if (g.body && g.body.updateFromGameObject) g.body.updateFromGameObject();
            g.setDepth(1);
            return g;
        };
        this.not_gate1 = mkNot('not_gate1');

        // ── 3. Puertas AND ────────────────────────────────────────────────────────
        const mkAnd = name => {
            const obj = byName(andLayer, name);
            const p = tc(obj);
            const g = new AndGate(this, p.x, p.y, this.player);
            g.setDisplaySize(obj.width, obj.height);
            if (g.body && g.body.updateFromGameObject) g.body.updateFromGameObject();
            g.setDepth(1);
            return g;
        };
        this.and_gate1 = mkAnd('and_gate1');
        this.and_gate2 = mkAnd('and_gate2');
        this.and_gate3 = mkAnd('and_gate3');

        // ── 4. Cables desde el JSON ───────────────────────────────────────────────
        const F_H = 0x80000000;
        const F_V = 0x40000000;
        const F_D = 0x20000000;

        const gidToKey = gid => {
            const base = gid & ~(F_H | F_V | F_D);
            return base === 1642 ? 'cable_right_off' : 'cable_off';
        };

        this.cables = {};
        cableLayer.forEach(obj => {
            const p = tc(obj);                      // centro corregido con rotación
            const key = gidToKey(obj.gid);          // tipo de cable
            const cab = new Cable(this, p.x, p.y, key);

            const flipX = (obj.gid & F_H) !== 0;
            const flipY = (obj.gid & F_V) !== 0;
            const flipD = (obj.gid & F_D) !== 0;

            let angle = obj.rotation || 0;
            let fX = flipX;
            let fY = flipY;

            // En Tiled el flip diagonal equivale a intercambiar X e Y
            if (flipD) {
                angle += 90;
                fX = !flipX;
            }

            cab.angle = angle;
            cab.setFlip(fX, fY);
            cab.setDisplaySize(obj.width, obj.height);
            cab.setDepth(0.1);
            this.cables[obj.name] = cab;
        });

        const c = name => this.cables[name];

        // ── 5. Conexiones lógicas del circuito ───────────────────────────────────

        // cable1
        if (c('cable1')) {
            c('cable1').connectInput(this.boton1);
            c('cable1').connectOutput(this.not_gate1, 'signalIn');
        }

        // cable2 (ini, der_g, der_up)
        ['cable2_ini', 'cable2_der_g', 'cable2_der_up'].forEach(n => {
            if (c(n)) c(n).connectInput(this.not_gate1);
        });
        if (c('cable2_der_up')) c('cable2_der_up').connectOutput(this.and_gate1, 'inputA');

        // cable3
        if (c('cable3')) {
            c('cable3').connectInput(this.boton2);
            c('cable3').connectOutput(this.and_gate1, 'inputB');
        }

        // cable4
        if (c('cable4')) {
            c('cable4').connectInput(this.boton3);
            c('cable4').connectOutput(this.and_gate2, 'inputA');
        }

        // cable5 (5, 5_g1, 5_g2)
        ['cable5', 'cable5_g1', 'cable5_g2'].forEach(n => {
            if (c(n)) c(n).connectInput(this.boton4);
        });
        if (c('cable5_g2')) c('cable5_g2').connectOutput(this.and_gate2, 'inputB');

        // cable6 (ini, der, der_g) -> a and_gate3 inputA
        ['cable6_ini', 'cable6_der', 'cable6_der_g'].forEach(n => {
            if (c(n)) c(n).connectInput(this.and_gate1);
        });
        if (c('cable6_der_g')) c('cable6_der_g').connectOutput(this.and_gate3, 'inputA');

        // cable7 (ini, izq, izq_g) -> a and_gate3 inputB
        ['cable7_ini', 'cable7_izq', 'cable7_izq_g'].forEach(n => {
            if (c(n)) c(n).connectInput(this.and_gate2);
        });
        if (c('cable7_izq_g')) c('cable7_izq_g').connectOutput(this.and_gate3, 'inputB');

        // cable8 (Salida final)
        if (c('cable8_ini')) c('cable8_ini').connectInput(this.and_gate3);
        if (c('cable8_der')) {
            c('cable8_der').connectInput(this.and_gate3);
        }

        this.circuitComponents = [
            ...Object.values(this.cables),
            this.and_gate1, this.and_gate2, this.and_gate3,
            this.not_gate1,
            this.boton1, this.boton2, this.boton3, this.boton4
        ];

        // ── Abrir menú con ESPACIO o CLICK DERECHO ─────────────────────────────
        const launchMenu = () => {
            if (this.dialogueManager && this.dialogueManager.dialogueBox.visible) return;
            this.scene.launch('MenuPrincipal', { from: this.scene.key });
            this.scene.pause();
        };

        this.input.keyboard.on('keydown-SPACE', launchMenu);
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) launchMenu();
        });

        // Música de mazmorra
        this.music = this.sound.add('music_mazmorra', { loop: true, volume: 0.4 });
        this.music.play();
        this.events.on('shutdown', () => { if (this.music) this.music.stop(); });

        // Si P1 ya está en el grupo, lo spawneamos para que nos siga
        if (gm.ActualPlayers.includes('Jugador2')) {
            this.amigo1 = new amigo1(this, this.player, this.player.x - 30, this.player.y, 'amigo1', 0, null, null, null, 'P1');
            // Nota: colisiones, paredes y decoracionypuerta son locales de esta función create()
            this.physics.add.collider(this.amigo1, colisiones);
            this.physics.add.collider(this.amigo1, paredes);
            this.physics.add.collider(this.amigo1, decoracionypuerta);
        }
        if (gm.ActualPlayers.includes('Jugador3')) {
            this.angela = new amigo1(this, this.player, this.player.x - 60, this.player.y, 'angelaow', 12, null, null, null, 'Angela', 'Jugador3', 'angelaow');
            this.physics.add.collider(this.angela, colisiones);
            this.physics.add.collider(this.angela, paredes);
            this.physics.add.collider(this.angela, decoracionypuerta);
        }
        if (gm.ActualPlayers.includes('Jugador4')) {
            this.victor = new amigo1(this, this.player, this.player.x + 30, this.player.y, 'victorow', 12, null, null, null, 'Victor', 'Jugador4', 'victorow');
            this.physics.add.collider(this.victor, colisiones);
            this.physics.add.collider(this.victor, paredes);
            this.physics.add.collider(this.victor, decoracionypuerta);
        }
    }

    update(t, dt) {
        // sumar segundos jugados
        const sec = this.registry.get('horasJuego') || 0;
        this.registry.set('horasJuego', sec + dt / 1000);

        this.circuitComponents.forEach(component => {
            if (component.updateLogic) component.updateLogic();
        });

        // Feedback de puzzle completado con retardo para evitar glitches
        const em = EventManager.getInstance();
        const cableFinal = this.cables['cable8_der'];
        
        if (cableFinal && cableFinal.signal) {
            this.puzleTimer += dt;
            if (this.puzleTimer > 200) {
                em.puzleIzquierdaCompletado = true;
            }
        } else {
            this.puzleTimer = 0;
            em.puzleIzquierdaCompletado = false;
        }

        if (!em.puzleIzquierdaFeedbackMostrado && em.puzleIzquierdaCompletado) {
            em.puzleIzquierdaFeedbackMostrado = true;
            this.sound.play('completed');
            this.dialogueManager.showDialogue("Se ha desbloqueado un cerrojo.");
        }
    }
}
