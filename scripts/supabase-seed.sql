-- ============================================
-- Sophi's Playground — Seed Data (safe to re-run)
-- ============================================

INSERT INTO riddle_categories (name, emoji) VALUES
  ('Animales', '🐾'), ('Comida', '🍕'), ('Naturaleza', '🌿'),
  ('Objetos', '🔮'), ('Cuerpo', '🫀'), ('Escuela', '📚')
ON CONFLICT (name) DO NOTHING;

INSERT INTO riddles (category_id, question, answer, hint, difficulty) VALUES
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Tiene dientes pero no muerde.', 'El peine', 'Lo usas en el pelo', 1),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Animal soy y con mi nombre empieza el abecedario.', 'La abeja', 'Produce miel', 1),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Tengo cola y no soy animal, vuelo alto sin ser pájaro.', 'La cometa', 'Se usa con viento', 1),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Soy chiquito como un ratón y cuido la casa como un león.', 'El candado', 'Protege puertas', 1),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Adivina quién soy: cuanto más lavo, más sucia estoy.', 'El agua', 'Es transparente', 1),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Tiene ojos y no ve, tiene agua y no la bebe.', 'El coco', 'Es una fruta tropical', 2),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Vuelo sin alas, lloro sin ojos, y donde voy oscuridad doy.', 'La nube', 'Mira al cielo', 2),
((SELECT id FROM riddle_categories WHERE name='Animales'), 'Tengo patas y no camino, tengo plumas y no vuelo.', 'El río', 'Piensa en la naturaleza', 2),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Oro parece, plata no es.', 'El plátano', 'Es una fruta amarilla', 1),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Blanca por dentro, verde por fuera.', 'La pera', 'Es una fruta', 1),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'No soy ave pero tengo huevo, no soy panadero pero tengo harina.', 'El pastel', 'Se come en cumpleaños', 1),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Fui al mercado, compré una bella, llegué a la casa y lloré con ella.', 'La cebolla', 'Te hace llorar', 1),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Agua pasó por aquí, cate que no la vi.', 'El aguacate', 'Es verde por dentro', 2),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Sin ser rica tengo cuartos, sin ser gorda tengo hojas.', 'La alcachofa', 'Es una verdura', 2),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Somos redonditas, tenemos ombliguito y nos meten al hornito.', 'Las donas', 'Son dulces', 1),
((SELECT id FROM riddle_categories WHERE name='Comida'), 'Campanita, campanera, blanca por dentro, verde por fuera.', 'La pera', 'Rima con fuera', 1),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'Salgo cuando hace sol, soy de muchos colores.', 'El arcoíris', 'Aparece después de llover', 1),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'De día sale y de noche se esconde.', 'El sol', 'Nos da luz', 1),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'Soy alta y bonita, y mi cuello es lo más largo.', 'La jirafa', 'Vive en África', 1),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'Me llaman rey y no tengo reino.', 'El león', 'El rey de la selva', 1),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'Soy pequeña como una pera, pero enciendo toda la casa.', 'La bombilla', 'Da luz eléctrica', 1),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'Cae del cielo y moja todo, pero no es lluvia.', 'La nieve', 'Es blanca y fría', 2),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'No me puedes ver pero me puedes sentir.', 'El viento', 'Sopla fuerte', 2),
((SELECT id FROM riddle_categories WHERE name='Naturaleza'), 'Viste de chaleco blanco y zapatos de charol.', 'El pingüino', 'Vive en el frío', 2),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Tengo hojas y no soy árbol, tengo lomo y no soy animal.', 'El libro', 'Te cuenta historias', 1),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'No tengo pies pero camino, no tengo boca pero digo la hora.', 'El reloj', 'Tic-tac', 1),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Tiene cuatro patas y no anda.', 'La mesa', 'Comes sobre ella', 1),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Doy calorcito, soy ojo de gato, y de noche alumbro tu cuarto.', 'La vela', 'Tiene fuego', 1),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Subo llena, bajo vacía, si no me doy prisa la sopa se enfría.', 'La cuchara', 'Sirve para comer sopa', 1),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Chiquito como un ratón, cuida toda la casa como un león.', 'La llave', 'Abre puertas', 1),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Entre más le quitas, más grande se hace.', 'El hoyo', 'Está en el suelo', 2),
((SELECT id FROM riddle_categories WHERE name='Objetos'), 'Puedo volar sin alas. Puedo llorar sin ojos.', 'La nieve', 'Es fría y blanca', 2),
((SELECT id FROM riddle_categories WHERE name='Cuerpo'), 'No soy reloj pero hago tic-tac, vivo en tu pecho, nunca paro.', 'El corazón', 'Late siempre', 1),
((SELECT id FROM riddle_categories WHERE name='Cuerpo'), 'Una señorita muy señoreada, siempre va en coche y siempre va mojada.', 'La lengua', 'Está en tu boca', 1),
((SELECT id FROM riddle_categories WHERE name='Cuerpo'), 'Dos niñas asomaditas, cada una a su ventanita.', 'Los ojos', 'Están en tu cara', 1),
((SELECT id FROM riddle_categories WHERE name='Cuerpo'), 'Dos hermanos igualitos que cuando llegan a viejitos se doblan.', 'Las rodillas', 'Están en tus piernas', 2),
((SELECT id FROM riddle_categories WHERE name='Cuerpo'), 'Diez amigos en una cueva, ni se mueven ni se quejan.', 'Los dedos de los pies', 'Están en tu zapato', 2),
((SELECT id FROM riddle_categories WHERE name='Cuerpo'), 'Me muevo sin pies, abro sin manos.', 'El viento', 'Es invisible', 2),
((SELECT id FROM riddle_categories WHERE name='Escuela'), 'Soy un palito largo y fino, dibujo en tu cuaderno el camino.', 'El lápiz', 'Escribes con él', 1),
((SELECT id FROM riddle_categories WHERE name='Escuela'), 'En la escuela me enseñan, los números me llaman.', 'Las matemáticas', 'Sumas y restas', 1),
((SELECT id FROM riddle_categories WHERE name='Escuela'), 'Soy redonda como el mundo, y sin mí no hay geografía.', 'El globo terráqueo', 'Está en tu salón', 1),
((SELECT id FROM riddle_categories WHERE name='Escuela'), 'Tengo ciudades pero no casas, tengo montañas pero no árboles.', 'El mapa', 'Muestra países', 2),
((SELECT id FROM riddle_categories WHERE name='Escuela'), 'Si me nombras desaparezco.', 'El silencio', 'No hagas ruido', 3),
((SELECT id FROM riddle_categories WHERE name='Escuela'), 'Dos en el cielo, dos en la tierra, dos en cada continente.', 'La letra E', 'Es una vocal', 3)
ON CONFLICT DO NOTHING;

-- REWARDS
INSERT INTO rewards (id, name, description, type, emoji, rarity, cost_points) VALUES
('avatar_01', 'Estrella Rosa', 'Tu primer avatar ⭐', 'avatar', '⭐', 'common', 0),
('avatar_02', 'Unicornio Mágico', 'Un unicornio brillante', 'avatar', '🦄', 'rare', 100),
('avatar_03', 'Gatita Kawaii', 'La gatita más tierna', 'avatar', '🐱', 'common', 50),
('avatar_04', 'Hada Brillante', 'Con alas de cristal', 'avatar', '🧚', 'epic', 200),
('avatar_05', 'Dragona Arcoíris', 'Legendaria y poderosa', 'avatar', '🐲', 'legendary', 500),
('avatar_06', 'Sirena Marina', 'De las profundidades', 'avatar', '🧜', 'rare', 150),
('badge_first_win', 'Primera Victoria', '¡Ganaste tu primera partida!', 'badge', '🏆', 'common', 0),
('badge_5_streak', 'Racha de 5', '5 victorias seguidas', 'badge', '🔥', 'rare', 0),
('badge_riddle_master', 'Maestra Adivinanzas', 'Gana 10 Riddle Battles', 'badge', '🧠', 'epic', 0),
('badge_social', 'Mariposa Social', 'Agrega 5 amigas', 'badge', '🦋', 'rare', 0),
('badge_collector', 'Coleccionista', 'Desbloquea 10 recompensas', 'badge', '💎', 'epic', 0),
('title_newbie', 'Novata', 'Todos empezamos aquí', 'title', '🌱', 'common', 0),
('title_pro', 'Pro Player', 'Juega 50 partidas', 'title', '⚡', 'rare', 100),
('title_queen', 'Reina del Juego', 'Gana 100 partidas', 'title', '👑', 'legendary', 300),
('title_brain', 'Cerebrito', 'Máxima puntuación en Riddle Battle', 'title', '🧠', 'epic', 200),
('title_speed', 'Velocista', 'Gana Tutti Frutti en menos de 30s', 'title', '⚡', 'rare', 150)
ON CONFLICT (id) DO NOTHING;
