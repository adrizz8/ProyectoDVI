import Phaser from 'phaser';
import GameManager from '../manager.js';
import { HABILITIES } from '../battleScene/habilities.js';

/**
 * EstrategiaScene
 * ---------------
 * Pantalla donde se visualizan los personajes con sus stats, habilidades,
 * PS (HP), PM (MP), estado y nivel.
 */
export default class EstrategiaScene extends Phaser.Scene {
    constructor() {
        super('EstrategiaScene');
        this.panelActivo = null;
    }

    create() {
        const gm = GameManager.getInstance();

        // Fondo con UI de estrategia
        this.add.image(608, 320, 'estrategiaUI').setDisplaySize(1216, 640);

        // Orden específica de los 4 jugadores (1 TL, 2 BL, 3 TR, 4 BR)
        const playerOrder = ['Jugador1', 'Jugador3', 'Jugador2', 'Jugador4'];
        const startX = 150;
        const startY = 100;
        const espacioX = 560;
        const espacioY = 340;

        playerOrder.forEach((nombrePers, index) => {
            const stats = gm.playerStats[nombrePers];
            if (!stats) return;

            const fila = Math.floor(index / 2);
            const columna = index % 2;
            const x = startX + columna * espacioX;
            const y = startY + fila * espacioY;

            this.crearCardPersonaje(x, y, nombrePers, stats);
        });

        // Instrucciones
        this.add.text(608, 620, 'Presiona ESPACIO para volver', {
            fontSize: '14px',
            fill: '#aaaaaa',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controles
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.stop();
            if (this.scene.isPaused('MenuPrincipal')) {
                this.scene.resume('MenuPrincipal');
            }
        });
    }

    crearCardPersonaje(x, y, nombre, stats) {
        // Se asume que el fondo ya está dibujado en estrategiaUI.
        // No se dibuja fondo opaco para el personaje.

        const labelText = `${nombre.replace(/Jugador/, 'P').toUpperCase()}`;
        this.add.text(x + 20, y + 12, labelText, {
            fontSize: '16px',
            fill: '#f5d442',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        });

        // Nivel y experiencia restante
        const xpRestante = Math.max(0, stats.expNext - stats.exp);
        this.add.text(x + 15, y + 45, `NV: ${stats.level}`, { fontSize: '12px', fill: '#ffffff', fontFamily: 'Distant Galaxy', fontStyle: 'bold' });
        this.add.text(x + 115, y + 45, `SIG: ${xpRestante}`, { fontSize: '12px', fill: '#90ee90', fontFamily: 'Distant Galaxy', fontStyle: 'bold' });

        // Coordinación con las barras de PS/PM dentro de estrategiaUI, bajo cada retrato
        const coordenadasBarra = {
            Jugador1: { x: 117.50, y:  227}, // arriba izquierda
            Jugador3: { x: 675, y: 227 }, // arriba derecha
            Jugador2: { x: 117.50, y: 558 }, // abajo izquierda
            Jugador4: { x: 675, y: 558 }
        };

        const baseBar = coordenadasBarra[nombre]
        const barraX = baseBar.x;
        const barraY = baseBar.y;
        const barraWidth = 190;
        const barraHeight = 11;

        // Barra de HP colocada exactamente bajo la barra PS del UI
        this.add.rectangle(barraX, barraY, barraWidth, barraHeight, 0x333333).setOrigin(0, 0);
        this.add.rectangle(barraX, barraY, Math.max(0.1, (stats.hp / stats.maxHp) * barraWidth), barraHeight, 0x1e7b1e).setOrigin(0, 0);
        this.add.text(barraX - 40, barraY - 1, 'PS', { fontSize: '11px', fill: '#86efac', fontFamily: 'Distant Galaxy', fontStyle: 'bold' });
        this.add.text(barraX, barraY + barraHeight + 2, `${stats.hp}/${stats.maxHp}`, { fontSize: '10px', fill: '#86efac', fontFamily: 'Distant Galaxy', fontStyle: 'bold' });

        // Barra de MP colocada exactamente bajo la barra PM del UI
        const mpY = barraY + barraHeight + 34;
        this.add.rectangle(barraX, mpY, barraWidth, barraHeight, 0x333333).setOrigin(0, 0);
        this.add.rectangle(barraX, mpY, Math.max(0.1, (stats.mp / stats.maxMp) * barraWidth), barraHeight, 0x1e4fbf).setOrigin(0, 0);
        this.add.text(barraX - 40, mpY - 1, 'PM', { fontSize: '11px', fill: '#93c5fd', fontFamily: 'Distant Galaxy', fontStyle: 'bold' });
        this.add.text(barraX, mpY + barraHeight + 2, `${stats.mp}/${stats.maxMp}`, { fontSize: '10px', fill: '#93c5fd', fontFamily: 'Distant Galaxy', fontStyle: 'bold' });

        // Estadísticas numéricas adicionales
        const statsBaseY = mpY + 40;
        const lineHeight = 16;
        const statsNumericos = [
            `Daño: ${stats.damage}`,
            `Def: ${stats.defense}`,
            `Vel: ${stats.speed}`,
            `Suerte: ${stats.luck}`
        ];

        statsNumericos.forEach((texto, idx) => {
            this.add.text(x + 15 + (idx > 1 ? 110 : 0), statsBaseY + (idx % 2) * lineHeight, texto, {
                fontSize: '11px',
                fill: '#ffffff',
                fontFamily: 'Distant Galaxy',
                fontStyle: 'bold'
            });
        });

        // Botones interactivos en la UI
        const btnStyle = { fontSize: '12px', fill: '#00ffea', fontFamily: 'Distant Galaxy', fontStyle: 'bold' };

        // Ajustamos ubicación de botones dentro del cuadro visual (sobre imagen)
        const botonesY = y + 205;
        const verHab = this.add.text(x + 16, botonesY, 'VER HABILIDADES', btnStyle).setInteractive({ useHandCursor: true });
        const verEq = this.add.text(x + 16, botonesY + 20, 'VER EQUIPAMIENTO', Object.assign({}, btnStyle, { fill: '#5aa6ff' })).setInteractive({ useHandCursor: true });

        verHab.on('pointerdown', () => this.showHabilidadesPanel(nombre, stats));
        verEq.on('pointerdown', () => this.showEquipamientoPanel(nombre, stats));

      
    }

    showHabilidadesPanel(nombre, stats) {
        this.closePanel();

        const width = 560;
        const height = 360;
        const panelX = 608 - width / 2;
        const panelY = 170;

        const group = this.add.group();

        const fondo = this.add.rectangle(608, panelY + height / 2, width, height, 0x000000, 0.9);
        fondo.setStrokeStyle(2, 0x87ceeb);
        group.add(fondo);

        const titulo = this.add.text(608, panelY + 20, `HABILIDADES: ${nombre}`, {
            fontSize: '20px',
            fill: '#f5d442',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        group.add(titulo);

        const descripcion = this.add.text(panelX + 20, panelY + 50, '* Pulsa fuera del panel o ACEPTAR para cerrar', {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'italic'
        });
        group.add(descripcion);

        const listaY = panelY + 80;
        if (stats.habilidades && stats.habilidades.length > 0) {
            stats.habilidades.forEach((nombreHab, idx) => {
                const hab = HABILITIES[nombreHab];
                const text = this.add.text(panelX + 20, listaY + idx * 36,
                    `- ${nombreHab} ${hab ? `(Coste ${hab.cost} MP)` : ''}`, {
                        fontSize: '14px',
                        fill: '#f8fafc',
                        fontFamily: 'Distant Galaxy',
                        fontStyle: 'bold'
                    });
                group.add(text);

                const desc = hab ? hab.description : 'No hay descripción disponible.';
                const descText = this.add.text(panelX + 40, listaY + idx * 36 + 16, desc, {
                    fontSize: '12px',
                    fill: '#d1d5db',
                    fontFamily: 'Distant Galaxy'
                });
                group.add(descText);
            });
        } else {
            const noText = this.add.text(panelX + 20, listaY, 'Este personaje no tiene habilidades asignadas.', {
                fontSize: '14px',
                fill: '#f5f5f5',
                fontFamily: 'Distant Galaxy'
            });
            group.add(noText);
        }

        const cerrar = this.add.text(608, panelY + height - 30, 'CERRAR', {
            fontSize: '16px',
            fill: '#34d399',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        cerrar.on('pointerdown', () => this.closePanel());
        group.add(cerrar);

        const mask = this.add.rectangle(608, 320, 1216, 640, 0x000000, 0.2).setInteractive();
        mask.on('pointerdown', () => this.closePanel());
        group.add(mask);

        this.panelActivo = group;
    }

    showEquipamientoPanel(nombre, stats) {
        this.closePanel();

        const width = 560;
        const height = 280;
        const panelX = 608 - width / 2;
        const panelY = 220;

        const group = this.add.group();

        const fondo = this.add.rectangle(608, panelY + height / 2, width, height, 0x000000, 0.9);
        fondo.setStrokeStyle(2, 0x5aa6ff);
        group.add(fondo);

        const titulo = this.add.text(608, panelY + 20, `EQUIPAMIENTO: ${nombre}`, {
            fontSize: '20px',
            fill: '#f5d442',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        group.add(titulo);

        const equipo = stats.equipment || {
            weapon: { name: 'Ninguno', description: 'Sin arma equipada.' },
            armor: { name: 'Ninguno', description: 'Sin armadura equipada.' },
            accessory: { name: 'Ninguno', description: 'Sin accesorio equipado.' }
        };

        const entries = [
            { slot: 'Arma', value: equipo.weapon },
            { slot: 'Armadura', value: equipo.armor },
            { slot: 'Accesorio', value: equipo.accessory }
        ];

        entries.forEach((item, idx) => {
            const y = panelY + 60 + idx * 60;
            this.add.text(panelX + 20, y, `${item.slot}: ${item.value.name}`, {
                fontSize: '14px',
                fill: '#f8fafc',
                fontFamily: 'Distant Galaxy',
                fontStyle: 'bold'
            });
            this.add.text(panelX + 20, y + 18, item.value.description || 'Sin descripción', {
                fontSize: '12px',
                fill: '#d1d5db',
                fontFamily: 'Distant Galaxy'
            });
        });

        const cerrar = this.add.text(608, panelY + height - 25, 'CERRAR', {
            fontSize: '16px',
            fill: '#34d399',
            fontFamily: 'Distant Galaxy',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        cerrar.on('pointerdown', () => this.closePanel());
        group.add(cerrar);

        const mask = this.add.rectangle(608, 320, 1216, 640, 0x000000, 0.2).setInteractive();
        mask.on('pointerdown', () => this.closePanel());
        group.add(mask);

        this.panelActivo = group;
    }

    closePanel() {
        if (this.panelActivo) {
            this.panelActivo.clear(true);
            this.panelActivo = null;
        }
    }

    formatearNombre(nombre) {
        return nombre.replace(/([\d])/g, ' $1').trim();
    }
}
