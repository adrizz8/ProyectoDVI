/**
 * ITEM_TYPES
 * ----------
 * Diccionario de todos los objetos que existen en el juego.
 * Ya no incluyen textura propia porque todos usan la 'mochila' en el mapa.
 */
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
        description: 'Arma cuerpo a cuerpo +5 daño.' 
    },
    'armadura_lejana': { 
        id: 'armadura_lejana', 
        name: 'Coraza ligera', 
        type: 'equipment', 
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
    }
};
