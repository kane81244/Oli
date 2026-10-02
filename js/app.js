/* ==========================================================================
   MVP Reels — application script
   Reads athleteData (js/data.js) and renders every section.
   Never edited per athlete: all client-specific text lives in data.js.
   ========================================================================== */

(function () {
  'use strict';

  if (typeof athleteData === 'undefined' || !athleteData) {
    console.error('MVP Reels: js/data.js did not define athleteData.');
    return;
  }

  var D = athleteData;
  var activeVideos = [];
  var activeCategory = '';

  var PLAY_SVG = '<svg width="18" height="20" viewBox="0 0 18 20" aria-hidden="true" focusable="false">' +
    '<path d="M2 1.5 16.5 10 2 18.5Z" fill="currentColor"></path></svg>';

  /* ---------- helpers ---------- */

  function $(id) {
    return document.getElementById(id);
  }

  function has(value) {
    if (value === null || value === undefined) return false;
    return String(value).trim() !== '';
  }

  /* Every value that reaches innerHTML goes through this first. */
  function esc(value) {
    return String(value === null || value === undefined ? '' : value).replace(
      /[&<>"']/g,
      function (character) {
        switch (character) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '"': return '&quot;';
          default: return '&#39;';
        }
      }
    );
  }

  function youtubeId(raw) {
    return String(raw || '').replace(/[^A-Za-z0-9_-]/g, '');
  }

  function listFrom(value) {
    return Array.isArray(value) ? value : [];
  }

  /* ---------- document chrome ---------- */

  function applyTheme() {
    var accent = D.theme && D.theme.accent;
    if (has(accent)) {
      document.documentElement.style.setProperty('--accent', String(accent).trim());
    }
  }

  function applyTitle() {
    var name = D.profile && D.profile.name;
    if (has(name)) document.title = String(name).trim() + ' — Recruiting profile';
  }

  /* ---------- 2. Hero ---------- */

  function loadHeroMedia(profile) {
    var video = $('heroVideo');
    var poster = $('heroPoster');

    if (has(profile.heroPoster)) {
      poster.src = profile.heroPoster;
      poster.hidden = false;
    }

    var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var reducedMotion = !!(motionQuery && motionQuery.matches);
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var saveData = !!(connection && connection.saveData);

    /* Data saver, reduced motion, or no video configured: keep the poster only. */
    if (saveData || reducedMotion || !has(profile.heroVideoBg)) return;

    video.src = profile.heroVideoBg;
    if (has(profile.heroPoster)) video.poster = profile.heroPoster;
    video.hidden = false;

    var playback = video.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        /* Autoplay blocked by the browser: the poster frame stays in place. */
      });
    }
  }

  function renderHero() {
    var profile = D.profile || {};

    var position = $('heroPosition');
    if (has(profile.position)) position.textContent = String(profile.position).trim();
    else position.hidden = true;

    $('heroName').textContent = has(profile.name) ? String(profile.name).trim() : '';

    var jersey = $('heroJersey');
    if (has(profile.jerseyNumber)) jersey.textContent = String(profile.jerseyNumber).trim();
    else jersey.hidden = true;

    var facts = [
      { label: 'School', value: profile.school },
      { label: 'Location', value: profile.location },
      { label: 'Class', value: profile.classYear },
      { label: 'Jersey', value: profile.jerseyNumber }
    ].filter(function (fact) {
      return has(fact.value);
    });

    var factsList = $('heroFacts');
    if (facts.length) {
      factsList.innerHTML = facts.map(function (fact) {
        return '<div class="hero__fact">' +
          '<dt>' + esc(fact.label) + '</dt>' +
          '<dd>' + esc(fact.value) + '</dd>' +
          '</div>';
      }).join('');
    } else {
      factsList.hidden = true;
    }

    var cvLink = $('cvLink');
    if (has(profile.resumeUrl)) {
      cvLink.setAttribute('href', String(profile.resumeUrl).trim());
      cvLink.setAttribute('download', '');
    } else {
      cvLink.hidden = true;
    }

    loadHeroMedia(profile);
  }

  /* ---------- 3. Measurables and academics ---------- */

  function valueClass(value) {
    return String(value).length > 8 ? 'row__value row__value--text' : 'row__value';
  }

  function rowHTML(label, detail, value) {
    return '<div class="row">' +
      '<dt class="row__label">' + esc(label) +
        (has(detail) ? '<span class="row__detail">' + esc(detail) + '</span>' : '') +
      '</dt>' +
      '<dd class="' + valueClass(value) + '">' + esc(value) + '</dd>' +
      '</div>';
  }

  function renderStats() {
    var physicals = listFrom(D.physicals).filter(function (item) {
      return item && has(item.label) && has(item.value);
    });

    if (physicals.length) {
      $('physicalRows').innerHTML = physicals.map(function (item) {
        return rowHTML(item.label, item.detail, item.value);
      }).join('');
    } else {
      $('physicalCol').hidden = true;
    }

    var academics = D.academics || {};
    var academicRows = [
      { label: 'GPA', value: academics.gpa },
      { label: 'SAT', value: academics.sat },
      { label: 'ACT', value: academics.act },
      { label: 'Major', value: academics.major },
      { label: 'NCAA ID', value: academics.ncaaId }
    ].filter(function (item) {
      return has(item.value);
    });

    if (academicRows.length) {
      $('academicRows').innerHTML = academicRows.map(function (item) {
        return rowHTML(item.label, '', item.value);
      }).join('');
    } else {
      $('academicCol').hidden = true;
    }

    if (!physicals.length && !academicRows.length) $('stats').hidden = true;
  }

  /* ---------- 4. Film room ---------- */

  function cardHTML(video) {
    var id = youtubeId(video.youtubeId);
    var thumbnail = 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
    var fallback = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';

    return '<article class="vcard">' +
      '<div class="vcard__media">' +
        '<button class="vcard__thumb" type="button" data-video="' + esc(id) + '" data-fallback="' + esc(fallback) + '" data-title="' + esc(video.title) + '" aria-label="Play ' + esc(video.title) + '">' +
          '<img src="' + esc(thumbnail) + '" alt="" loading="lazy" decoding="async">' +
          '<span class="vcard__play" aria-hidden="true">' + PLAY_SVG + '</span>' +
          (has(video.duration) ? '<span class="vcard__duration">' + esc(video.duration) + '</span>' : '') +
        '</button>' +
      '</div>' +
      (has(video.category) ? '<p class="vcard__cat">' + esc(video.category) + '</p>' : '') +
      '<h3 class="vcard__title">' + esc(video.title) + '</h3>' +
      '</article>';
  }

  function bindThumbnails(scope) {
    var images = scope.querySelectorAll('.vcard__thumb img');
    Array.prototype.forEach.call(images, function (image) {
      image.addEventListener('error', function () {
        var button = image.closest ? image.closest('.vcard__thumb') : null;
        if (!button) return;
        if (!image.getAttribute('data-tried')) {
          image.setAttribute('data-tried', '1');
          image.src = button.getAttribute('data-fallback');
        } else {
          image.remove(); /* dark frame with the play button remains */
        }
      });
    });
  }

  function startVideo(button) {
    var id = button.getAttribute('data-video');
    if (!id) return;

    var frame = document.createElement('div');
    frame.className = 'vcard__frame';

    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
    iframe.title = button.getAttribute('data-title') || 'YouTube video player';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    iframe.setAttribute('allowfullscreen', '');

    frame.appendChild(iframe);
    button.parentNode.replaceChild(frame, button);
  }

  function renderCards(category) {
    var grid = $('videoGrid');
    var list = activeVideos.filter(function (video) {
      return video.category === category;
    });

    grid.innerHTML = list.map(cardHTML).join('');
    bindThumbnails(grid);
  }

  function selectTab(index) {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('#filmTabs .tab'));
    if (!tabs.length) return;

    var safeIndex = Math.max(0, Math.min(index, tabs.length - 1));
    var active = tabs[safeIndex];

    tabs.forEach(function (tab, tabIndex) {
      var isActive = tabIndex === safeIndex;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    activeCategory = active.getAttribute('data-category') || '';
    $('videoGrid').setAttribute('aria-labelledby', active.id);
    renderCards(activeCategory);
  }

  function renderFilm() {
    var videos = listFrom(D.videos).filter(function (video) {
      return video && has(video.title) && has(video.category) && has(youtubeId(video.youtubeId));
    });

    if (!videos.length) {
      $('film').hidden = true;
      return;
    }

    activeVideos = videos;

    var categories = [];
    videos.forEach(function (video) {
      if (categories.indexOf(video.category) === -1) categories.push(video.category);
    });

    var tablist = $('filmTabs');
    tablist.innerHTML = categories.map(function (category, index) {
      return '<button class="tab" type="button" role="tab" id="filmTab' + index + '" ' +
        'aria-controls="videoGrid" data-category="' + esc(category) + '" ' +
        'aria-selected="' + (index === 0 ? 'true' : 'false') + '" ' +
        'tabindex="' + (index === 0 ? '0' : '-1') + '">' + esc(category) + '</button>';
    }).join('');

    tablist.addEventListener('click', function (event) {
      var tab = event.target.closest ? event.target.closest('.tab') : null;
      if (!tab) return;
      selectTab(Array.prototype.indexOf.call(tablist.children, tab));
    });

    tablist.addEventListener('keydown', function (event) {
      var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.tab'));
      var current = tabs.indexOf(document.activeElement);
      if (current === -1) return;

      var next = null;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;

      event.preventDefault();
      selectTab(next);
      tabs[next].focus();
    });

    var grid = $('videoGrid');
    grid.addEventListener('click', function (event) {
      var button = event.target.closest ? event.target.closest('.vcard__thumb') : null;
      if (!button) return;

      var buttons = Array.prototype.slice.call(grid.querySelectorAll('.vcard__thumb'));
      var position = buttons.indexOf(button);

      /* One video at a time: rebuild the grid so anything playing is stopped. */
      if (grid.querySelector('.vcard__frame')) {
        renderCards(activeCategory);
        var refreshed = grid.querySelectorAll('.vcard__thumb');
        button = refreshed[position] || refreshed[0];
      }

      if (button) startVideo(button);
    });

    selectTab(0);
  }

  /* ---------- 5. Scouting report ---------- */

  function renderScouting() {
    var honors = listFrom(D.accolades).filter(has);

    if (honors.length) {
      $('honorsList').innerHTML = honors.map(function (honor) {
        return '<li>' + esc(honor) + '</li>';
      }).join('');
    } else {
      $('honorsCol').hidden = true;
    }

    var coaches = listFrom(D.coaches).filter(function (coach) {
      return coach && has(coach.name);
    });

    if (coaches.length) {
      $('coachList').innerHTML = coaches.map(function (coach) {
        var links = '';
        if (has(coach.phone)) {
          var tel = String(coach.phone).replace(/[^\d+]/g, '');
          links += '<a href="tel:' + esc(tel) + '">' + esc(coach.phone) + '</a>';
        }
        if (has(coach.email)) {
          links += '<a href="mailto:' + esc(coach.email) + '">' + esc(coach.email) + '</a>';
        }

        return '<article class="coachCard">' +
          '<h3 class="coachCard__name">' + esc(coach.name) + '</h3>' +
          (has(coach.title) ? '<p class="coachCard__title">' + esc(coach.title) + '</p>' : '') +
          (links ? '<div class="coachCard__links">' + links + '</div>' : '') +
          '</article>';
      }).join('');
    } else {
      $('coachesCol').hidden = true;
    }

    if (!honors.length && !coaches.length) $('scouting').hidden = true;
  }

  /* ---------- 7. Footer ---------- */

  function renderFooter() {
    var socials = listFrom(D.social).filter(function (entry) {
      return entry && has(entry.label) && has(entry.url);
    });

    if (socials.length) {
      $('footerSocial').innerHTML = socials.map(function (entry) {
        return '<a href="' + esc(entry.url) + '" target="_blank" rel="noopener">' + esc(entry.label) + '</a>';
      }).join('');
    } else {
      $('footerSocial').hidden = true;
    }

    var name = D.profile && D.profile.name;
    $('copyright').textContent = '© ' + new Date().getFullYear() +
      (has(name) ? ' ' + String(name).trim() : '') + '. All rights reserved.';
  }

  /* ---------- links pointing at hidden sections ---------- */

  function hideDeadLinks() {
    var scope = document.querySelector('.nav__menu');
    var anchors = [];
    if (scope) anchors = anchors.concat(Array.prototype.slice.call(scope.querySelectorAll('a[href^="#"]')));
    anchors = anchors.concat(Array.prototype.slice.call($('heroActions').querySelectorAll('a[href^="#"]')));

    anchors.forEach(function (link) {
      var target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target || target.hidden) link.hidden = true;
    });

    var actions = $('heroActions');
    var visible = Array.prototype.filter.call(actions.children, function (child) {
      return !child.hidden;
    });
    if (!visible.length) actions.hidden = true;
  }

  /* ---------- 1. Navbar ---------- */

  function initNav() {
    var toggle = $('navToggle');
    var menu = $('navMenu');

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-open'));
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest && event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- 6. Recruiter portal ---------- */

  function initForm() {
    var form = $('inquiryForm');
    var status = $('formStatus');
    var submitBtn = $('submitBtn');
    var order = ['coachName', 'program', 'email', 'phone'];

    var rules = {
      coachName: function (value) {
        return value === '' ? 'Enter the name of the coach or recruiter.' : '';
      },
      program: function (value) {
        return value === '' ? 'Enter the program or school you represent.' : '';
      },
      email: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
          ? ''
          : 'Enter a valid email address, for example name@school.edu.';
      },
      phone: function (value) {
        return value.replace(/\D/g, '').length >= 7
          ? ''
          : 'Enter a phone number with at least 7 digits.';
      }
    };

    function fieldOf(key) {
      return document.getElementById(key);
    }

    function setError(key, message) {
      var input = fieldOf(key);
      document.getElementById(key + 'Error').textContent = message;
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      input.closest('.field').classList.toggle('is-invalid', Boolean(message));
    }

    function clearErrors() {
      order.forEach(function (key) {
        setError(key, '');
      });
    }

    order.forEach(function (key) {
      fieldOf(key).addEventListener('input', function () {
        if (fieldOf(key).getAttribute('aria-invalid') === 'true') {
          setError(key, rules[key](fieldOf(key).value.trim()));
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (submitBtn.disabled) return;

      var firstInvalid = null;
      order.forEach(function (key) {
        var message = rules[key](fieldOf(key).value.trim());
        setError(key, message);
        if (message && !firstInvalid) firstInvalid = fieldOf(key);
      });

      if (firstInvalid) {
        status.className = 'form__status is-error';
        status.textContent = 'Check the highlighted fields and try again.';
        firstInvalid.focus();
        return;
      }

      var recruiter = {
        coachName: fieldOf('coachName').value.trim(),
        program: fieldOf('program').value.trim(),
        division: $('division').value,
        email: fieldOf('email').value.trim(),
        phone: fieldOf('phone').value.trim(),
        note: $('note').value.trim()
      };

      var athleteName = has(D.profile && D.profile.name) ? D.profile.name : 'Athlete';
      var lines = [
        'New recruiting inquiry for ' + athleteName,
        'Coach: ' + recruiter.coachName,
        'Program: ' + recruiter.program,
        'Division: ' + (recruiter.division || 'Not specified'),
        'Email: ' + recruiter.email,
        'Phone: ' + recruiter.phone
      ];
      if (recruiter.note) lines.push('Note: ' + recruiter.note);

      var payload = {
        content: lines.join('\n'),
        athlete: athleteName,
        timestamp: new Date().toISOString(),
        recruiter: recruiter
      };

      function finish() {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send inquiry';
      }

      function succeed() {
        form.reset();
        clearErrors();
        status.className = 'form__status';
        status.textContent = 'Inquiry sent. You will hear back directly.';
        finish();
      }

      function fail() {
        status.className = 'form__status is-error';
        status.textContent = 'Could not send. Check your connection and try again.';
        finish();
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      status.className = 'form__status';
      status.textContent = '';

      if (!has(D.webhookUrl)) {
        /* Demo mode: nothing leaves the browser. */
        window.setTimeout(function () {
          console.log('Demo mode (webhookUrl is empty). Payload:', payload);
          succeed();
        }, 700);
        return;
      }

      window.fetch(D.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (!response.ok) throw new Error('Webhook responded with ' + response.status);
        succeed();
      }).catch(function (error) {
        console.error('MVP Reels: the inquiry could not be sent.', error);
        fail();
      });
    });
  }

  /* ---------- boot ---------- */

  function init() {
    applyTheme();
    applyTitle();
    renderHero();
    renderStats();
    renderFilm();
    renderScouting();
    renderFooter();
    hideDeadLinks();
    initNav();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
