/* ============================================================
   EL COLONIAL · app.js
   ⚙️ TODOS LOS DATOS A CAMBIAR ESTÁN EN EL OBJETO DATOS.
   Cualquier elemento con data-dato="clave" se rellena solo.
============================================================ */
const DATOS = {
  nombre:        'Bar Restaurante El Colonial',
  // TODO: fecha real. Formato ISO con zona de Cuba (-05:00 invierno / -04:00 verano)
  fechaApertura: '2026-12-15T19:00:00-05:00',
  telefono:      '+53 45 52 1234',          // TODO: teléfono real
  telefonoTel:   '+5345521234',             // mismo número, sin espacios
  whatsapp:      '5355551234',              // TODO: WhatsApp real (solo dígitos, con código de país)
  whatsappTexto: '+53 5 555 1234',
  correo:        'reservas@elcolonial.cu',  // TODO: correo real
  direccion1:    'Calzada #152, e/ Céspedes y Av. de las Palmas',
  direccion2:    'Cárdenas, Matanzas, Cuba',
  direccionMapa: 'Calzada 152, Cárdenas, Matanzas, Cuba',
  // TODO: pega aquí el enlace "Compartir" de Google Maps cuando tengas la ubicación exacta
  enlaceMapa:    ''
};

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const FECHA = new Date(DATOS.fechaApertura);
  const urlMapa = DATOS.enlaceMapa ||
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(DATOS.direccionMapa);

  /* ----------------------------------------------------------
     1. RELLENAR DATOS
  ---------------------------------------------------------- */
  const fechaTexto = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Havana'
  }).format(FECHA);

  const valores = { ...DATOS, fechaTexto, anio: new Date().getFullYear() };

  $$('[data-dato]').forEach(el => {
    const v = valores[el.dataset.dato];
    if (v !== undefined) el.textContent = v;
  });

  const enlaces = {
    tel:  () => 'tel:' + DATOS.telefonoTel,
    mail: () => 'mailto:' + DATOS.correo,
    wa:   () => 'https://wa.me/' + DATOS.whatsapp,
    waHola: () => 'https://wa.me/' + DATOS.whatsapp + '?text=' +
            encodeURIComponent('Hola, quiero ser de los primeros en El Colonial (Cárdenas).'),
    mapa: () => urlMapa
  };
  $$('[data-enlace]').forEach(a => {
    const fn = enlaces[a.dataset.enlace];
    if (fn) a.href = fn();
  });

  /* ----------------------------------------------------------
     2. NAV compacto, progreso y botón arriba
  ---------------------------------------------------------- */
  const nav = $('#nav');
  const progreso = $('#progreso');
  const btnArriba = $('#arriba');
  let ticking = false;

  function alScroll() {
    const y = window.scrollY;
    nav.classList.toggle('compacto', y > 40);
    btnArriba.classList.toggle('visible', y > 600);
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    progreso.style.width = alto > 0 ? (y / alto) * 100 + '%' : '0%';
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(alScroll); }
  }, { passive: true });
  alScroll();

  btnArriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ----------------------------------------------------------
     3. MENÚ MÓVIL (inert cuando está cerrado)
  ---------------------------------------------------------- */
  const hamburguesa = $('#hamburguesa');
  const menuMovil = $('#menuMovil');
  menuMovil.inert = true;

  function alternarMenu(abrir) {
    const abierto = abrir ?? !menuMovil.classList.contains('abierto');
    menuMovil.classList.toggle('abierto', abierto);
    hamburguesa.classList.toggle('abierto', abierto);
    hamburguesa.setAttribute('aria-expanded', abierto);
    hamburguesa.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    menuMovil.inert = !abierto;
    document.body.style.overflow = abierto ? 'hidden' : '';
  }
  hamburguesa.addEventListener('click', () => alternarMenu());
  $$('a', menuMovil).forEach(a => a.addEventListener('click', () => alternarMenu(false)));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuMovil.classList.contains('abierto')) {
      alternarMenu(false);
      hamburguesa.focus();
    }
  });
  window.matchMedia('(min-width:901px)').addEventListener('change', e => { if (e.matches) alternarMenu(false); });

  /* ----------------------------------------------------------
     4. REVEAL AL HACER SCROLL
  ---------------------------------------------------------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(el => obs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     5. ENLACE ACTIVO EN LA NAVEGACIÓN
  ---------------------------------------------------------- */
  const enlacesNav = $$('.enlaces a');
  if ('IntersectionObserver' in window) {
    const obsSec = new IntersectionObserver(entradas => {
      entradas.forEach(en => {
        if (!en.isIntersecting) return;
        enlacesNav.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-20% 0px -60% 0px' });
    $$('main section[id]').forEach(s => obsSec.observe(s));
  }

  /* ----------------------------------------------------------
     6. CARTA: pestañas accesibles (flechas, Home, End)
  ---------------------------------------------------------- */
  const tabs = $$('.tab');
  const panel = $('#panelCarta');
  const platos = $$('.plato', panel);

  function activarTab(tab, enfocar) {
    tabs.forEach(t => {
      const activa = t === tab;
      t.setAttribute('aria-selected', activa);
      t.tabIndex = activa ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    let i = 0;
    platos.forEach(p => {
      const coincide = p.dataset.cat === tab.dataset.cat;
      p.hidden = !coincide;
      p.classList.remove('entrando');
      if (coincide) {
        p.style.animationDelay = (i++ * 55) + 'ms';
        void p.offsetWidth;
        p.classList.add('entrando');
      }
    });
    if (enfocar) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activarTab(tab));
    tab.addEventListener('keydown', e => {
      let destino = null;
      if (e.key === 'ArrowRight') destino = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft')  destino = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') destino = tabs[0];
      if (e.key === 'End')  destino = tabs[tabs.length - 1];
      if (destino) { e.preventDefault(); activarTab(destino, true); }
    });
  });
  if (tabs[0]) activarTab(tabs[0]);

  /* ----------------------------------------------------------
     7. CUENTA REGRESIVA (solo en la sección de apertura)
  ---------------------------------------------------------- */
  const seccionApertura = $('#apertura');
  const elDias = $('#cdDias'), elHoras = $('#cdHoras'), elMin = $('#cdMin'), elSeg = $('#cdSeg');
  const avisoCuenta = $('#avisoCuenta');
  const avisoSuperior = $('#avisoApertura');
  const dos = n => String(n).padStart(2, '0');

  function actualizarCuenta() {
    const diff = FECHA - new Date();

    if (isNaN(diff)) return; // fecha mal escrita en DATOS

    if (diff <= 0) {
      seccionApertura.classList.add('abierta');
      avisoSuperior.textContent = '¡Ya estamos abiertos!';
      clearInterval(timer);
      return;
    }

    const dias  = Math.floor(diff / 864e5);
    const horas = Math.floor(diff / 36e5) % 24;
    const min   = Math.floor(diff / 6e4) % 60;
    const seg   = Math.floor(diff / 1e3) % 60;

    elDias.textContent = dias;
    elHoras.textContent = dos(horas);
    elMin.textContent = dos(min);
    elSeg.textContent = dos(seg);

    avisoSuperior.textContent =
      dias > 30 ? 'Gran apertura · Muy pronto' :
      dias > 1  ? 'Abrimos en ' + dias + ' días' :
      dias === 1 ? 'Abrimos mañana' : '¡Abrimos hoy!';

    avisoCuenta.innerHTML =
      dias > 1  ? 'Muy pronto en la <strong>Calzada de Cárdenas</strong>. Únete a la lista y sé de los primeros en vivir la noche de apertura.' :
      dias === 1 ? '<strong>¡Abrimos mañana!</strong> Escríbenos y te guardamos un lugar.' :
                   '<strong>¡Hoy es el día!</strong> Te esperamos en la Calzada #152.';
  }
  const timer = setInterval(actualizarCuenta, 1000);
  actualizarCuenta();

  /* ----------------------------------------------------------
     8. MAPA: se carga solo al pulsar (ahorra datos)
  ---------------------------------------------------------- */
  const btnMapa = $('#cargarMapa');
  if (btnMapa) {
    btnMapa.addEventListener('click', () => {
      const cont = $('#mapa');
      const f = document.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=' + encodeURIComponent(DATOS.direccionMapa) + '&output=embed';
      f.title = 'Mapa de ubicación de El Colonial';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      cont.appendChild(f);
      $('.mapa-texto', cont).hidden = true;
    });
  }

  /* ----------------------------------------------------------
     9. FORMULARIO → mensaje de WhatsApp prellenado
  ---------------------------------------------------------- */
  const form = $('#formReserva');
  const exito = $('#exito');
  const hoy = new Date().toISOString().split('T')[0];
  $('#fecha').min = hoy;

  $$('input, select, textarea', form).forEach(c => {
    const limpiar = () => c.closest('.campo')?.classList.remove('error');
    c.addEventListener('input', limpiar);
    c.addEventListener('change', limpiar);
  });

  function construirMensaje(d) {
    const l = ['Hola, quiero anotarme en la lista de apertura de El Colonial 🍹', ''];
    l.push('• Nombre: ' + d.nombre);
    l.push('• Personas: ' + d.personas);
    if (d.contacto) l.push('• Contacto: ' + d.contacto);
    if (d.fecha) {
      const [y, m, dd] = d.fecha.split('-');
      l.push('• Fecha tentativa: ' + dd + '/' + m + '/' + y);
    }
    if (d.hora) l.push('• Hora: ' + d.hora);
    if (d.zona && d.zona !== 'Sin preferencia') l.push('• Zona: ' + d.zona);
    if (d.mensaje) l.push('• Notas: ' + d.mensaje);
    return l.join('\n');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valido = true;
    ['nombre', 'personas'].forEach(id => {
      const campo = document.getElementById(id);
      const vacio = !campo.value.trim();
      campo.closest('.campo').classList.toggle('error', vacio);
      if (vacio) valido = false;
    });
    if (!valido) {
      const primero = $('.campo.error', form);
      primero.scrollIntoView({ behavior: 'smooth', block: 'center' });
      $('input, select', primero).focus();
      return;
    }

    const datos = Object.fromEntries(new FormData(form).entries());
    Object.keys(datos).forEach(k => { datos[k] = String(datos[k]).trim(); });

    const url = 'https://wa.me/' + DATOS.whatsapp + '?text=' + encodeURIComponent(construirMensaje(datos));

    // Abrir WhatsApp dentro del gesto del usuario (evita bloqueo de popups)
    window.open(url, '_blank', 'noopener');

    $('#nombreExito').textContent = datos.nombre.split(' ')[0];
    $('#reintentarWa').href = url;
    exito.classList.add('visible');
    $('h3', exito).focus();
  });

  $('#otraReserva').addEventListener('click', () => {
    form.reset();
    exito.classList.remove('visible');
    $('#nombre').focus();
  });

  /* ----------------------------------------------------------
     10. SCROLL SUAVE (ignora "#" sueltos y destinos inexistentes)
  ---------------------------------------------------------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') { e.preventDefault(); return; }
      const destino = document.getElementById(href.slice(1));
      if (!destino) return;
      e.preventDefault();
      const top = destino.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
      history.replaceState(null, '', href);
    });
  });
})();
