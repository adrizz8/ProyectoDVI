/**
 * ITEM_TYPES
 * ----------
 * Diccionario de todos los objetos que existen en el juego.
 **/
export const ITEM_TYPES = {
    'pocion': {
        id: 'pocion',
        name: 'Poción',
        type: 'consumable',
        heal: 50,
        description: 'Cura 50 HP.'
    },
    'eter': {
        id: 'eter',
        name: 'Éter',
        type: 'consumable',
        recMp: 20,
        description: 'Restaura 20 MP.'
    },
    'elixir': {
        id: 'elixir',
        name: 'Elixir',
        type: 'consumable',
        heal: 100,
        recMp: 50,
        description: 'Restaura 100 HP y 50 MP.'
    },
    'pocion_fuerza': {
        id: 'pocion_fuerza',
        name: 'Poción de Fuerza',
        type: 'consumable',
        buffAtt: 15,
        description: 'Aumenta el ataque en 15.'
    },
    'pocion_defensa': {
        id: 'pocion_defensa',
        name: 'Poción de Defensa',
        type: 'consumable',
        buffDef: 10,
        description: 'Aumenta la defensa en 10.'
    },
    'pocion_rapidez': {
        id: 'pocion_rapidez',
        name: 'Poción de Rapidez',
        type: 'consumable',
        buffSpd: 10,
        description: 'Aumenta la velocidad en 10.'
    },
    'pocion_suerte': {
        id: 'pocion_suerte',
        name: 'Poción de Suerte',
        type: 'consumable',
        buffLck: 5,
        description: 'Aumenta la suerte en 5.'
    },
    'pocion_resistencia': {
        id: 'pocion_resistencia',
        name: 'Poción Restauradora',
        type: 'consumable',
        statusRecovery: true,
        description: 'Elimina estado anómalo.'
    },
    'pocion_nivel': {
        id: 'pocion_nivel',
        name: 'Poción de Nivel',
        type: 'consumable',
        levelUp: true,
        description: 'Suma un nivel al personaje.'
    },
    'espada_basica': {
        id: 'espada_basica',
        name: 'Espada de Bronce',
        type: 'equipment',
        bonusStats: { damage: 5 },
        description: 'Arma cuerpo a cuerpo +5 daño.'
    },
    'armadura_lejana': {
        id: 'armadura_lejana',
        name: 'Coraza ligera',
        type: 'equipment',
        bonusStats: { defense: 5 },
        description: 'Armadura que ofrece +5 defensa.'
    },
    'llave_caverna': {
        id: 'llave_caverna',
        name: 'Llave de la Caverna',
        type: 'key',
        description: 'Abre la puerta de la caverna del Norte.'
    },
    'monster_dorada': {
        id: 'monster_dorada',
        name: 'Monster Dorada',
        type: 'key_item',
        description: 'Un objeto legendario.'
    },
    'pincho_tortilla': {
        id: 'pincho_tortilla',
        name: 'Pincho de Tortilla',
        type: 'consumable',
        heal: 30,
        description: 'El combustible del héroe. Te lo dio Andrés en tu primer día. Cura 30 HP.'
    },
    'llave_planta1': {
        id: 'llave_planta1',
        name: 'Llave de la Planta 1',
        type: 'key',
        description: 'Permite entrar en las aulas de la Planta 1.'
    },
    'regla_lhopital': {
        id: 'regla_lhopital',
        name: 'Regla de L\'Hôpital',
        type: 'consumable',
        statusRecovery: true,
        description: 'Cuando te aturdan y pierdes un turno de ataque, úsala para quitarte el efecto.'
    },
    'compilador_amigable': {
        id: 'compilador_amigable',
        name: 'Compilador Amigable',
        type: 'consumable',
        recMp: 20,
        description: 'Recupera 20 de Energía. Te lo dio el NPC de FP.'
    },
    'puntero_null': {
        id: 'puntero_null',
        name: 'Puntero a NULL',
        type: 'consumable',
        buffDef: 0,
        disable_enemy: true,
        description: 'Arma arrojadiza: desactiva las habilidades del enemigo un turno.'
    },
    'apuntes_trivial': {
        id: 'apuntes_trivial',
        name: 'Apuntes de lo Trivial',
        type: 'consumable',
        disable_enemy: true,
        description: 'El enemigo se queda parado un turno intentando comprender por qué el ataque es trivial.'
    }
};
