class MenuPrincipal extends Phaser.Scene {
    constructor() {
        super('MenuPrincipal');
    }

    create() {
        // Creamos la imagen de fondo del menú con alpha 0 y la tweenamos para aparecer lentamente
        const bg = this.add.image(608, 320, 'menuPrincipal').setName('menuPrincipal').setOrigin(0.5).setAlpha(0);
        this.tweens.add({
            targets: bg,
            alpha: 1,
            duration: 800,
            ease: 'Power1'
        });

        // ── Stats del jugador ──────────────────────────────────────────
        // Recupera los datos guardados en el registro global del juego
        const horasJuego = this.registry.get('horasJuego') ?? 0;
        const dinero     = this.registry.get('dinero')     ?? 0;

        this.horasText = this.add.text(305, 150, `Tiempo: ${this.formatearHoras(horasJuego)}`, {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Distant Galaxy', stroke: '#000000', strokeThickness: 4
        });

        this.horasJuego = horasJuego;

        this.add.text(305, 210, `Dinero: ${dinero.toLocaleString()}€`, {
            fontSize: '22px', fill: '#ffffff', fontFamily: 'Distant Galaxy', stroke: '#000000', strokeThickness: 4
        });

        // ── Botones ────────────────────────────────────────────────────
        const botones = [
            { x: 800, y: 275, scene: 'EstrategiaScene', text: 'Estrategia' },
            { x: 800, y: 345, scene: 'MochilaScene',   text: 'Mochila'   },
            { x: 800, y: 515, scene: null,             text: 'Salir'     },  
            { x: 800, y: 425, scene: 'OpcionesScene',  text: 'Opciones'  },
        ];

        botones.forEach(({ x, y, scene, text }) => {
            const btn = this.add.text(x, y, text, {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Distant Galaxy',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5).setInteractive();

            btn.on('pointerover',  () => {
                btn.setStyle({ fill: '#f5d442' });
            });
            btn.on('pointerout',   () => {
                btn.setStyle({ fill: '#ffffff' });
            });
            btn.on('pointerdown',  () => {
                if (scene) {
                    this.scene.start(scene);
                } else {
                    this.game.destroy(true);
                }
            });
        });

        // ── Abrir / cerrar con ESPACIO ─────────────────────────────────
        // Guardamos el nombre de la escena que abrió el menú (se recibe en data al lanzarlo)
        const previousScene = this.scene.settings.data?.from;

        this.input.keyboard.on('keydown-SPACE', () => {
            // Ocultamos la imagen con un tween y solo entonces cerramos la escena
            const bg = this.children.getByName('menuPrincipal') || this.add.image(608, 320, 'menuPrincipal');
            this.tweens.add({
                targets: bg,
                alpha: 0,
                duration: 800,
                ease: 'Power1',
                onComplete: () => {
                    this.scene.stop();
                    if (previousScene) {
                        this.scene.resume(previousScene);
                    }
                }
            });
        });
    }

    update(time, dt) {
        // Mantener en cada frame un display preciso del tiempo real de juego
        const horasJuego = this.registry.get('horasJuego') ?? 0;
        this.horasText.setText(`Tiempo: ${this.formatearHoras(horasJuego)}`);
    }

    // Convierte segundos totales → "Xh Ym"
    formatearHoras(segundosTotales) {
        const h = Math.floor(segundosTotales / 3600);
        const m = Math.floor((segundosTotales % 3600) / 60);
        return `${h}h ${m}m`;
    }
}

// Exportación para poder importarla desde game.js
export default MenuPrincipal;