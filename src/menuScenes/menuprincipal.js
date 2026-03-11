class MenuPrincipal extends Phaser.Scene {
    constructor() {
        super('MenuPrincipal');
    }

    create() {
        this.add.image(608, 320, 'menuPrincipal');


        const estrategiaButton = this.add.image(608, 400, 'estrategiaButton').setInteractive();
        estrategiaButton.on('pointerdown', () => {
            this.scene.start('EstrategiaScene');
        });

        const mochilaButton = this.add.image(608, 500, 'mochilaButton').setInteractive();
        mochilaButton.on('pointerdown', () => {
            this.scene.start('MochilaScene');
        });

        const equipamientoButton = this.add.image(608, 700, 'equipamientoButton').setInteractive();
        equipamientoButton.on('pointerdown', () => {
            this.scene.start('EquipamientoScene');
        }
        );

        const opcionesButton = this.add.image(608, 800, 'opcionesButton').setInteractive();
        opcionesButton.on('pointerdown', () => {
            this.scene.start('OpcionesScene');
        }); 

        const salirButton = this.add.image(608, 600, 'salirButton').setInteractive();
        salirButton.on('pointerdown', () => {
            this.game.destroy(true);
        });

    }
}