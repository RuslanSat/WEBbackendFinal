window.APIKEY='db3143cadbd24592b354b98d1ce81244';
// Assignment Demo JavaScript (unique selectors)
if (window.jQuery) $(document).ready(function () {
    console.log("jQuery is ready!");

    // Live Search: real-time filter on keyup/input
    const $input = $('#live-search-input');
    const $listItems = $('#live-search-list .live-item');
    const $count = $('#live-search-count');
    const $clear = $('#live-search-clear');
    // Autocomplete suggestions container
    let $suggestions = $('#live-search-suggestions');
    if (!$suggestions.length && $input.length) {
        $suggestions = $('<ul id="live-search-suggestions" class="list-group mt-1"></ul>');
        $input.after($suggestions);
    }

// (GameBrain integration removed)

// Build suggestions source from list items
function getAllItems() {
    return $listItems.map(function () {
        return $(this).text().trim();
    }).get();
}

let activeIndex = -1; // keyboard selection

function updateList() {
    const query = ($input.val() || '').toString().toLowerCase();
    let visible = 0;
    $listItems.each(function () {
        const text = $(this).text().toLowerCase();
        const match = text.indexOf(query) !== -1;
        $(this).toggle(match);
        if (match) visible++;
    });
    $count.text(visible);
    updateSuggestions();
}

function updateSuggestions() {
    const query = ($input.val() || '').toString().trim().toLowerCase();
    $suggestions.empty();
    activeIndex = -1;
    if (!query) {
        return;
    }

    const items = getAllItems();
    const matches = items.filter(txt => txt.toLowerCase().includes(query)).slice(0, 8);
    if (matches.length === 0) {
        return;
    }

    matches.forEach((txt, i) => {
        const $li = $('<li class="list-group-item bg-dark text-light border-secondary" role="option"></li>');
        const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
        $li.html(txt.replace(re, '<span class="text-warning">$1<\/span>'));
        $li.on('mousedown', function (e) {
            e.preventDefault();
            selectSuggestion(txt);
        });
        $suggestions.append($li);
    });
}

function selectSuggestion(value) {
    $input.val(value);
    $suggestions.empty();
    updateList();
}

if ($input.length && $listItems.length) {
    // Initialize count and bind events
    updateList();
    $input.on('keyup input', updateList);
    $clear.on('click', function () {
        $input.val('');
        updateList();
        $input.trigger('focus');
    });

//

// Keyboard navigation for suggestions
$input.on('keydown', function (e) {
    const items = $suggestions.children('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        items.removeClass('active');
        $(items[activeIndex]).addClass('active');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        items.removeClass('active');
        $(items[activeIndex]).addClass('active');
    } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < items.length) {
            e.preventDefault();
            const text = $(items[activeIndex]).text();
            selectSuggestion(text);
        }
    } else if (e.key === 'Escape') {
        $suggestions.empty();
    }
});
}
// Search Highlight Feature
(function () {
    const $hSearch = $('#highlight-search');
    const $hClear = $('#clear-highlight');
    const $content = $('#article-content');

    if (!$hSearch.length || !$content.length) return;

    let originalHTML = $content.html();

    function highlight(searchTerm) {
        if (!searchTerm || !searchTerm.trim()) {
            $content.html(originalHTML);
            return;
        }
        const term = searchTerm.trim();
        let modified = originalHTML;
        const regex = new RegExp('(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        modified = modified.replace(regex, '<mark class="highlight-match bg-warning text-dark">$1</mark>');
        $content.html(modified);
    }

    $hSearch.on('input keyup', function () {
        highlight($(this).val());
    });

    $hClear.on('click', function () {
        $hSearch.val('');
        $content.html(originalHTML);
        $hSearch.focus();
    });
})();

});

document.addEventListener('DOMContentLoaded', function () {

    // Form Validation
    const registrationForm = document.getElementById('assignment-registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function (e) {
            let valid = true;

            const email = document.getElementById('assignment-email');
            const emailError = document.getElementById('assignment-email-error');
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value) {
                emailError.textContent = 'Email is required.';
                valid = false;
            } else if (!emailPattern.test(email.value)) {
                emailError.textContent = 'Enter a valid email address.';
                valid = false;
            } else {
                emailError.textContent = '';
            }

            const password = document.getElementById('assignment-password');
            const passwordError = document.getElementById('assignment-password-error');
            if (!password.value) {
                passwordError.textContent = 'Password is required.';
                valid = false;
            } else if (password.value.length < 6) {
                passwordError.textContent = 'Password must be at least 6 characters.';
                valid = false;
            } else {
                passwordError.textContent = '';
            }

            const confirmPassword = document.getElementById('assignment-confirm-password');
            const confirmPasswordError = document.getElementById('assignment-confirm-password-error');
            if (!confirmPassword.value) {
                confirmPasswordError.textContent = 'Please confirm your password.';
                valid = false;
            } else if (password.value !== confirmPassword.value) {
                confirmPasswordError.textContent = 'Passwords do not match.';
                valid = false;
            } else {
                confirmPasswordError.textContent = '';
            }

            if (!valid) {
                e.preventDefault();
            } else {
                alert("Successfully registered");
            }
        });
    }

    // Registration UX enhancements: password toggles and strength meter
    (function () {
        const pw = document.getElementById('assignment-password');
        const cpw = document.getElementById('assignment-confirm-password');
        const togglePw = document.getElementById('toggle-password');
        const toggleCpw = document.getElementById('toggle-confirm-password');
        const bar = document.getElementById('assignment-password-strength-bar');
        const label = document.getElementById('assignment-password-strength-text');

        function updateStrength(value) {
            if (!bar || !label) return;
            let score = 0;
            if (!value) score = 0;
            else {
                const lengthScore = Math.min(6, Math.max(0, value.length - 5)); // 0..6
                const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].reduce((s, re) => s + (re.test(value) ? 1 : 0), 0); // 0..4
                score = Math.min(10, lengthScore + variety * 2); // 0..10
            }
            const pct = (score / 10) * 100;
            bar.style.width = pct + '%';
            bar.classList.remove('bg-danger', 'bg-warning', 'bg-success');
            let text = 'Weak';
            if (pct >= 70) { bar.classList.add('bg-success'); text = 'Strong'; }
            else if (pct >= 40) { bar.classList.add('bg-warning'); text = 'Medium'; }
            else { bar.classList.add('bg-danger'); text = 'Weak'; }
            label.textContent = `Password strength: ${text}`;
        }

        if (pw) {
            pw.addEventListener('input', function () { updateStrength(pw.value); });
            // initialize on load
            updateStrength(pw.value || '');
        }

        function toggleVisibility(input, btn) {
            if (!input || !btn) return;
            btn.addEventListener('click', function () {
                const isText = input.type === 'text';
                input.type = isText ? 'password' : 'text';
                btn.textContent = isText ? 'Show' : 'Hide';
            });
        }

        toggleVisibility(pw, togglePw);
        toggleVisibility(cpw, toggleCpw);
    })();

    // Accordion
    const questions = document.querySelectorAll('.assignment-accordion-question');
    questions.forEach(q => {
        q.addEventListener('click', function () {
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                answer.style.padding = '0 1em';
            } else {
                document.querySelectorAll('.assignment-accordion-answer').forEach(a => {
                    a.style.maxHeight = null;
                    a.style.padding = '0 1em';
                });
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.padding = '1em';
            }
        });
    });
    document.querySelectorAll('.assignment-accordion-answer').forEach(a => {
        a.style.maxHeight = null;
        a.style.overflow = 'hidden';
        a.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
        a.style.padding = '0 1em';
    });

    // Popup
    const openPopupBtn = document.getElementById('assignment-open-popup-btn');
    const popupForm = document.getElementById('assignment-popup-form');
    const closePopupBtn = document.getElementById('assignment-close-popup-btn');
    if (openPopupBtn && popupForm && closePopupBtn) {
        openPopupBtn.addEventListener('click', function () {
            popupForm.style.display = 'flex';
        });
        closePopupBtn.addEventListener('click', function () {
            popupForm.style.display = 'none';
        });
        popupForm.addEventListener('click', function (e) {
            if (e.target === popupForm) {
                popupForm.style.display = 'none';
            }
        });
    }

    // Background Color
    const changeBgBtn = document.getElementById('assignment-change-bg-btn');
    const colors = ['#f8b400', '#6a89cc', '#38ada9', '#e55039', '#4a69bd', '#60a3bc', '#78e08f'];
    let colorIndex = 0;
    if (changeBgBtn) {
        changeBgBtn.addEventListener('click', function () {
            document.body.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        });
    }

    // Date and Time
    function updateDateTime() {
        const now = new Date();
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        const display = document.getElementById('assignment-date-time-display');
        if (display) display.textContent = now.toLocaleString('ru-Kz', options);
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Enhance date-time updater to support navbar
    (function () {
        function updateGlobalDateTime() {
            var now = new Date();
            var options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            var navEl = document.getElementById('navbar-date-time');
            if (navEl) navEl.textContent = now.toLocaleString('en-US', options);
        }

        updateGlobalDateTime();
        setInterval(updateGlobalDateTime, 1000);
    })();

    // Categories: search highlights on cards
    $(document).ready(function () {
        var $catSearch = $('#category-search-input');
        if ($catSearch.length) {
            $catSearch.on('input keyup', function () {
                var q = ($(this).val() || '').toString().trim().toLowerCase();
                var $cards = $('.game-bootstrap-card');
                if (!q) {
                    $cards.removeClass('search-highlight dimmed');
                    return;
                }
                $cards.each(function () {
                    var $c = $(this);
                    var title = $c.find('.card-title').text().toLowerCase();
                    var text = $c.find('.card-text').text().toLowerCase();
                    var match = title.includes(q) || text.includes(q);
                    $c.toggleClass('search-highlight', match);
                    $c.toggleClass('dimmed', !match);
                });
            });
        }
    });

    // RAWG.io: Recently Added Games on Categories page
    (function(){
        const listEl = document.getElementById('rawg-game-list');
        const loadMoreBtn = document.getElementById('rawg-load-more');
        const loadingEl = document.getElementById('rawg-loading');
        const errorEl = document.getElementById('rawg-error');
        const genreSelect = document.getElementById('rawg-genre-select');
        const genreClearBtn = document.getElementById('rawg-genre-clear');
        const searchInput = document.getElementById('rawg-search-input');
        const searchClearBtn = document.getElementById('rawg-search-clear');
        const sortSelect = document.getElementById('rawg-sort-select');
        // Sidebar filters
        const platChecks = Array.from(document.querySelectorAll('.rawg-plat'));
        const yearFromEl = document.getElementById('rawg-year-from');
        const yearToEl = document.getElementById('rawg-year-to');
        const onlyWishlistEl = document.getElementById('rawg-only-wishlist');
        const filtersResetBtn = document.getElementById('rawg-filters-reset');
        if (!listEl || !loadMoreBtn) return;

        const APIKEY = (typeof window.APIKEY !== 'undefined' && window.APIKEY) ? window.APIKEY : (localStorage.getItem('rawg.key') || '');
        let nextUrl = null;
        let selectedGenre = '';
        let searchQuery = '';
        let selectedOrdering = '-added';
        let selectedPlatforms = [];
        let yearFrom = '';
        let yearTo = '';
        // Restore persisted Only-wishlist switch
        try {
            const onlyW = localStorage.getItem('rawg.only_wishlist') === '1';
            if (onlyWishlistEl) onlyWishlistEl.checked = onlyW;
        } catch(_){}

        function getPlatformStr(platforms){
            try {
                const s = (platforms || []).map(pl => pl.platform?.name || '').filter(Boolean).join(', ');
                return s.length > 30 ? (s.slice(0, 30) + '...') : s;
            } catch(_) { return ''; }
        }

        function setLoading(v){ if (loadingEl) loadingEl.style.display = v ? 'flex' : 'none'; loadMoreBtn.disabled = v; }
        function setError(msg){ if (!errorEl) return; if (!msg) { errorEl.style.display='none'; errorEl.textContent=''; } else { errorEl.style.display='block'; errorEl.className='alert alert-danger'; errorEl.textContent = msg; } }

        function platformBadgeClass(name){
            const n = (name||'').toLowerCase();
            if (n.includes('xbox')) return 'xbox';
            if (n.includes('playstation') || n.includes('ps')) return 'ps';
            if (n.includes('nintendo') || n.includes('switch')) return 'nintendo';
            if (n.includes('mac')) return 'mac';
            if (n.includes('linux')) return 'linux';
            if (n.includes('ios') || n.includes('android') || n.includes('mobile')) return 'mobile';
            if (n.includes('pc') || n.includes('windows')) return 'pc';
            return 'other';
        }
        function platformAbbr(name){
            const n = (name||'').toLowerCase();
            if (n.includes('xbox')) return 'XB';
            if (n.includes('playstation') || n.includes('ps')) return 'PS';
            if (n.includes('nintendo') || n.includes('switch')) return 'NT';
            if (n.includes('mac')) return 'MAC';
            if (n.includes('linux')) return 'LNX';
            if (n.includes('ios') || n.includes('android') || n.includes('mobile')) return 'MB';
            if (n.includes('pc') || n.includes('windows')) return 'PC';
            return 'OTH';
        }
        function platformBadgesRow(parents){
            const list = (parents||[]).slice(0,6).map(p=>{
                const nm = p.platform?.name || '';
                const cls = platformBadgeClass(nm);
                const ab = platformAbbr(nm);
                return `<span class="rawg-pl rawg-pl-${cls}" title="${nm}">${ab}</span>`;
            });
            return list.join('');
        }
        function wishLabelHTML(wished){
            const icon = wished
                ? 'https://img.icons8.com/ios-glyphs/16/D4AF37/like--v1.png'
                : 'https://img.icons8.com/ios-glyphs/16/FFFFFF/like--v1.png';
            return `<img class="icon me-1" src="${icon}" alt="Heart">` + (wished ? 'Wishlisted' : 'Wishlist');
        }
        function itemHTML(game){
            const img = game.background_image || 'images/placeholder-game.png';
            const name = game.name || 'Untitled';
            const rating = (game.rating != null) ? game.rating : '';
            const released = game.released || '';
            const plats = getPlatformStr(game.parent_platforms || []);
            const platformRow = platformBadgesRow(game.parent_platforms||[]);
            const added = (game.added!=null)? game.added : null;
            const ratingsCount = (game.ratings_count!=null)? game.ratings_count : null;
            const mainGenre = Array.isArray(game.genres)&&game.genres[0]? game.genres[0].name : '';
            const wl = JSON.parse(localStorage.getItem('rawg.wishlist')||'[]');
            const wished = wl.includes(game.id);
            return (
                '<div class="col-lg-3 col-md-6 col-sm-12">\
                   <div class="item card h-100 rawg-card">\
                     <a href="game.html?id='+game.id+'&slug='+(encodeURIComponent(game.slug||''))+'" class="d-block">\
                       <img src="'+img+'" alt="'+name+' image" class="card-img-top" onerror="this.src=\'images/placeholder-game.png\'">\
                     </a>\
                     <div class="card-body">\
                        <div class="d-flex align-items-center text-muted small mb-2 rawg-platforms">'+platformRow+'</div>\
                        <h4 class="game-name h6 mb-2"><a href="game.html?id='+game.id+'&slug='+(encodeURIComponent(game.slug||''))+'" class="text-decoration-none text-light">'+name+'</a></h4>\
                        <div class="d-flex flex-wrap gap-2 mb-2">\
                          '+(added!=null?('<span class="rawg-chip"><img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/D4AF37/plus-math.png" alt="Added">'+added.toLocaleString()+'</span>'):'')+'\
                          '+(ratingsCount!=null?('<span class="rawg-chip"><img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/D4AF37/star--v1.png" alt="Ratings">'+ratingsCount.toLocaleString()+'</span>'):'')+'\
                          '+(rating!==''?('<span class="rawg-chip"><img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/D4AF37/star--v1.png" alt="Rating">'+rating+'</span>'):'')+'\
                          <button class="rawg-chip rawg-wish'+(wished?' active':'')+'" data-game-id="'+game.id+'">'+wishLabelHTML(wished)+'</button>\
                        </div>\
                       <div class="mb-2 d-flex gap-2">\
                         <button type="button" class="btn btn-sm btn-outline-primary rawg-stores-btn" data-game-id="'+game.id+'"><img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/FFFFFF/shopping-cart--v1.png" alt="Stores">Stores</button>\
                         <button type="button" class="btn btn-sm btn-primary rawg-details-btn" data-game-id="'+game.id+'"><img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/FFFFFF/info--v1.png" alt="Details">Details</button>\
                        </div>\
                        <div class="mt-2 small" id="stores-'+game.id+'" hidden></div>\
                     </div>\
                     ' +
                     '<div class="rawg-card-footer d-flex justify-content-between align-items-center small text-muted">\
                       <span>' + (mainGenre?('<img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/9AA0A6/tags.png" alt="Genre">'+mainGenre):'') + '</span>\
                       <span>' + (released?('<img class="icon me-1" src="https://img.icons8.com/ios-glyphs/16/9AA0A6/calendar--v1.png" alt="Release">'+released):'') + '</span>\
                     </div>\
                   </div>\
                 </div>'
            );
        }

        async function loadGames(url){
            setError('');
            if (!APIKEY) { setError('RAWG API key missing. Set window.APIKEY or localStorage "rawg.key".'); return; }
            setLoading(true);
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error('HTTP '+res.status);
                const data = await res.json();
                nextUrl = data.next || null;
                const games = Array.isArray(data.results) ? data.results : [];
                const html = games.map(itemHTML).join('');
                listEl.insertAdjacentHTML('beforeend', html);
                applyClientFilters();
                loadMoreBtn.style.display = nextUrl ? 'inline-block' : 'none';
            } catch (e){
                setError('Failed to load games: '+String(e.message||e));
            } finally { setLoading(false); }
        }

        const today = new Date();
        const start = '2022-01-01';
        const end = '2022-12-31';
        function buildBaseUrl(){
            const u = new URL('https://api.rawg.io/api/games');
            u.searchParams.set('key', APIKEY);
            // Dates: from sidebar if provided, else defaults
            const yFrom = (yearFrom||'').toString().trim();
            const yTo = (yearTo||'').toString().trim();
            const useDates = (yFrom && yTo) ? `${yFrom}-01-01,${yTo}-12-31` : `${start},${end}`;
            u.searchParams.set('dates', useDates);
            u.searchParams.set('ordering', selectedOrdering || '-added');
            if (selectedGenre) u.searchParams.set('genres', selectedGenre);
            if (searchQuery) u.searchParams.set('search', searchQuery);
            if (selectedPlatforms.length) u.searchParams.set('parent_platforms', selectedPlatforms.join(','));
            return u.toString();
        }
        async function populateGenres(){
            if (!genreSelect) return;
            try{
                const u = new URL('https://api.rawg.io/api/genres');
                u.searchParams.set('key', APIKEY);
                u.searchParams.set('page_size', '40');
                const res = await fetch(u.toString());
                if (!res.ok) throw new Error('HTTP '+res.status);
                const data = await res.json();
                const items = Array.isArray(data.results)? data.results:[];
                const options = items.map(g=>`<option value="${g.slug}">${g.name}</option>`).join('');
                genreSelect.insertAdjacentHTML('beforeend', options);
            }catch(_){ /* non-fatal */ }
        }
        function resetAndLoad(){ listEl.innerHTML=''; nextUrl=null; loadMoreBtn.style.display='none'; loadGames(buildBaseUrl()); }
        if (genreSelect){
            genreSelect.addEventListener('change', function(){ selectedGenre = this.value || ''; resetAndLoad(); });
        }
        if (genreClearBtn){
            genreClearBtn.addEventListener('click', function(){ if (genreSelect) genreSelect.value=''; if (selectedGenre){ selectedGenre=''; resetAndLoad(); } });
        }
        if (searchInput){
            let t=null; const deb = (fn,ms)=>{ return function(...a){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,a),ms); } };
            const onChange = deb(function(){ searchQuery = (searchInput.value||'').trim(); resetAndLoad(); }, 400);
            searchInput.addEventListener('input', onChange);
        }
        if (searchClearBtn){
            searchClearBtn.addEventListener('click', function(){ if (!searchInput) return; if (searchInput.value){ searchInput.value=''; } if (searchQuery){ searchQuery=''; resetAndLoad(); } });
        }
        if (sortSelect){
            sortSelect.addEventListener('change', function(){ selectedOrdering = this.value || '-added'; resetAndLoad(); });
        }
        // Sidebar handlers
        function readPlatforms(){
            const vals = [];
            platChecks.forEach(ch=>{ if (ch.checked) { vals.push(...String(ch.value).split(',').map(v=>v.trim()).filter(Boolean)); } });
            selectedPlatforms = Array.from(new Set(vals));
        }
        platChecks.forEach(ch=> ch.addEventListener('change', function(){ readPlatforms(); resetAndLoad(); }));
        function readYears(){ yearFrom = (yearFromEl?.value||'').slice(0,4); yearTo = (yearToEl?.value||'').slice(0,4); }
        yearFromEl && yearFromEl.addEventListener('change', function(){ readYears(); resetAndLoad(); });
        yearToEl && yearToEl.addEventListener('change', function(){ readYears(); resetAndLoad(); });
        filtersResetBtn && filtersResetBtn.addEventListener('click', function(){
            // clear sidebar
            platChecks.forEach(ch=> ch.checked=false);
            if (yearFromEl) yearFromEl.value=''; if (yearToEl) yearToEl.value='';
            if (onlyWishlistEl) { onlyWishlistEl.checked=false; try{ localStorage.removeItem('rawg.only_wishlist'); }catch(_){} }
            // clear top filters
            if (genreSelect) genreSelect.value=''; selectedGenre='';
            if (searchInput) searchInput.value=''; searchQuery='';
            if (sortSelect) sortSelect.value='-added'; selectedOrdering='-added';
            selectedPlatforms=[]; yearFrom=''; yearTo='';
            resetAndLoad();
        });

        // Client-side wishlist filter after render
        function applyClientFilters(){
            const onlyWishlist = !!(onlyWishlistEl && onlyWishlistEl.checked);
            let wl=[]; try{ wl=JSON.parse(localStorage.getItem('rawg.wishlist')||'[]'); if(!Array.isArray(wl)) wl=[]; }catch(_){ wl=[]; }
            const cards = listEl.querySelectorAll('.rawg-card');
            // reset visibility first
            cards.forEach(card=>{ if (card.parentElement) card.parentElement.style.display=''; });
            if (!onlyWishlist) return;
            cards.forEach(card=>{
                const wishBtn = card.querySelector('.rawg-wish');
                const id = wishBtn ? Number(wishBtn.getAttribute('data-game-id')) : NaN;
                if (!wl.includes(id) && card.parentElement) card.parentElement.style.display='none';
            });
        }
        populateGenres();
        loadGames(buildBaseUrl());
        loadMoreBtn.addEventListener('click', function(){ if (nextUrl) loadGames(nextUrl); });

        // Toggle wishlist from list
        listEl.addEventListener('click', function(e){
            const w = e.target.closest('.rawg-wish');
            if (!w) return;
            const id = Number(w.getAttribute('data-game-id'));
            if (!id) return;
            let wl = [];
            try { wl = JSON.parse(localStorage.getItem('rawg.wishlist')||'[]'); if(!Array.isArray(wl)) wl=[]; } catch(_) { wl=[]; }
            const idx = wl.indexOf(id);
            if (idx === -1) { wl.push(id); w.classList.add('active'); w.innerHTML = wishLabelHTML(true); }
            else { wl.splice(idx,1); w.classList.remove('active'); w.innerHTML = wishLabelHTML(false); }
            localStorage.setItem('rawg.wishlist', JSON.stringify(wl));
            // If Only wishlist filter is on, reflect immediately
            if (onlyWishlistEl && onlyWishlistEl.checked) {
                const col = w.closest('.col-lg-3, .col-md-6, .col-sm-12, .col');
                if (col) col.style.display = wl.includes(id) ? '' : 'none';
            }
        });

        // React to Only wishlist switch (persist + filter)
        onlyWishlistEl && onlyWishlistEl.addEventListener('change', function(){
            try { localStorage.setItem('rawg.only_wishlist', this.checked ? '1' : '0'); } catch(_){ }
            applyClientFilters();
        });

        async function fetchStores(gameId, { ordering = '', page = 1, page_size = 10 } = {}){
            const url = new URL(`https://api.rawg.io/api/games/${encodeURIComponent(gameId)}/stores`);
            url.searchParams.set('key', APIKEY);
            if (ordering) url.searchParams.set('ordering', ordering);
            if (page) url.searchParams.set('page', String(page));
            if (page_size) url.searchParams.set('page_size', String(page_size));
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }

        // Cache for store metadata (id -> { name, domain, slug })
        const storesCache = new Map();
        async function fetchAllStoresPage(page=1){
            const url = new URL('https://api.rawg.io/api/stores');
            url.searchParams.set('key', APIKEY);
            url.searchParams.set('page', String(page));
            url.searchParams.set('page_size', '40');
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }
        async function ensureStoresMeta(){
            if (storesCache.size) return;
            try {
                let page = 1, next = null;
                do {
                    const data = await fetchAllStoresPage(page);
                    const items = Array.isArray(data.results) ? data.results : [];
                    items.forEach(s => { if (s && typeof s.id !== 'undefined') storesCache.set(String(s.id), { name: s.name, domain: s.domain, slug: s.slug }); });
                    next = data.next; page += 1;
                } while (next && page <= 5); // cap pages for safety
            } catch(_) { /* non-fatal */ }
        }
        function unwrapRedirect(href){
            try {
                const u = new URL(href);
                if (u.pathname.includes('redirect') && u.searchParams.get('url')) {
                    return decodeURIComponent(u.searchParams.get('url'));
                }
            } catch(_) {}
            return href;
        }
        function resolveStoreUrl(storeItem){
            const meta = storeItem && storeItem.store ? storesCache.get(String(storeItem.store.id || storeItem.store_id)) : storesCache.get(String(storeItem.store_id));
            let href = storeItem.url || '';
            if (href) href = unwrapRedirect(href);
            if (!href && meta?.domain) href = 'https://' + meta.domain;
            if (!href) href = '#';
            const name = (storeItem && storeItem.store && storeItem.store.name) || meta?.name || 'Store';
            return { href, name };
        }

        listEl.addEventListener('click', async function(e){
            const btn = e.target.closest('.rawg-stores-btn');
            if (!btn) return;
            const gameId = btn.getAttribute('data-game-id');
            const box = document.getElementById('stores-'+gameId);
            if (!gameId || !box) return;
            if (!box.hasAttribute('hidden')) { box.setAttribute('hidden',''); return; }
            btn.disabled = true; btn.textContent = 'Loading...';
            try {
                const data = await fetchStores(gameId, { page_size: 10 });
                const items = Array.isArray(data.results) ? data.results : [];
                await ensureStoresMeta();
                if (!items.length) {
                    box.innerHTML = '<div class="text-muted">No store links available</div>';
                } else {
                    const html = items.map(s => {
                        const { href, name } = resolveStoreUrl(s);
                        return '<a class="badge bg-secondary me-1 mb-1" target="_blank" rel="noopener" href="'+href+'">'+name+'</a>';
                    }).join('');
                    box.innerHTML = html;
                }
                box.removeAttribute('hidden');
            } catch(err){
                box.innerHTML = '<div class="text-danger">Failed to load stores</div>';
                box.removeAttribute('hidden');
            } finally { btn.disabled = false; btn.textContent = 'Stores'; }
        });

        async function fetchGameDetails(id){
            const url = new URL(`https://api.rawg.io/api/games/${encodeURIComponent(id)}`);
            url.searchParams.set('key', APIKEY);
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }

        async function fetchScreenshots(id){
            const url = new URL(`https://api.rawg.io/api/games/${encodeURIComponent(id)}/screenshots`);
            url.searchParams.set('key', APIKEY);
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }

        async function fetchMovies(id){
            const url = new URL(`https://api.rawg.io/api/games/${encodeURIComponent(id)}/movies`);
            url.searchParams.set('key', APIKEY);
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('HTTP '+res.status);
            return res.json();
        }

        listEl.addEventListener('click', async function(e){
            const btn = e.target.closest('.rawg-details-btn');
            if (!btn) return;
            const gameId = btn.getAttribute('data-game-id');
            if (!gameId) return;
            btn.disabled = true; const old = btn.textContent; btn.textContent = 'Loading...';
            try {
                const loadingOverlay = document.getElementById('rawgDetailsLoading');
                if (loadingOverlay) loadingOverlay.classList.remove('d-none');
                const d = await fetchGameDetails(gameId);
                // Populate modal
                const titleEl = document.getElementById('rawgDetailsTitle');
                const imgEl = document.getElementById('rawgDetailsImage');
                const badgesEl = document.getElementById('rawgDetailsBadges');
                const descEl = document.getElementById('rawgDetailsDesc');
                const metaEl = document.getElementById('rawgDetailsMeta');
                const extraEl = document.getElementById('rawgDetailsExtra');
                const webEl = document.getElementById('rawgDetailsWebsite');
                const mcEl = document.getElementById('rawgDetailsMetacritic');
                const rdEl = document.getElementById('rawgDetailsReddit');
                const openRawgEl = document.getElementById('rawgOpenRawg');
                const copyBtnEl = document.getElementById('rawgCopyLink');
                const screensEl = document.getElementById('rawgScreensGrid');
                const moviesEl = document.getElementById('rawgMoviesGrid');
                const mediaEmptyEl = document.getElementById('rawgMediaEmpty');
                const storesWrap = document.getElementById('rawgStoresWrap');
                const storesEmpty = document.getElementById('rawgStoresEmpty');

                if (titleEl) titleEl.textContent = d.name || d.slug || 'Game';
                if (imgEl) {
                    const src = d.background_image || d.background_image_additional || '';
                    if (src) { imgEl.src = src; imgEl.style.display = ''; }
                    else { imgEl.style.display = 'none'; }
                }
                if (badgesEl) {
                    const plats = (Array.isArray(d.platforms)? d.platforms.map(p=>p.platform?.name).filter(Boolean) : []).slice(0,6);
                    const rating = (d.rating!=null? d.rating: null);
                    const released = d.released || '';
                    const meta = (d.metacritic!=null? d.metacritic: null);
                    const chips = [];
                    if (rating!=null) chips.push(`<span class="badge bg-warning text-dark">★ ${rating}</span>`);
                    if (meta!=null) chips.push(`<span class="badge bg-success">Metacritic ${meta}</span>`);
                    if (released) chips.push(`<span class="badge bg-secondary">${released}</span>`);
                    if (plats.length) chips.push(...plats.map(n=>`<span class="badge bg-dark">${n}</span>`));
                    badgesEl.innerHTML = chips.join(' ');
                }
                if (descEl) {
                    // RAWG returns HTML in description; trust limited or strip if needed
                    descEl.innerHTML = d.description || '';
                }
                if (metaEl) {
                    const rows = [];
                    if (d.playtime) rows.push(`<div class="col-6"><strong>Playtime:</strong> ${d.playtime}h</div>`);
                    if (d.ratings_count!=null) rows.push(`<div class="col-6"><strong>Ratings:</strong> ${d.ratings_count}</div>`);
                    if (d.screenshots_count!=null) rows.push(`<div class="col-6"><strong>Screenshots:</strong> ${d.screenshots_count}</div>`);
                    if (d.movies_count!=null) rows.push(`<div class="col-6"><strong>Trailers:</strong> ${d.movies_count}</div>`);
                    metaEl.innerHTML = rows.join('');
                }
                if (extraEl) {
                    const blocks = [];
                    // ESRB rating
                    if (d.esrb_rating?.name) {
                        blocks.push(`<div class="col-12"><strong>ESRB:</strong> ${d.esrb_rating.name}</div>`);
                    }
                    // PC requirements (minimum/recommended)
                    let reqMin = '', reqRec = '';
                    if (Array.isArray(d.platforms)) {
                        const pc = d.platforms.find(p => (p.platform?.slug||'').toLowerCase() === 'pc');
                        if (pc && pc.requirements) {
                            reqMin = pc.requirements.minimum || '';
                            reqRec = pc.requirements.recommended || '';
                        }
                    }
                    if (reqMin || reqRec) {
                        blocks.push(`<div class="col-12"><strong>PC Requirements:</strong></div>`);
                        if (reqMin) blocks.push(`<div class="col-12 small"><em>Minimum:</em> ${reqMin}</div>`);
                        if (reqRec) blocks.push(`<div class="col-12 small"><em>Recommended:</em> ${reqRec}</div>`);
                    }
                    extraEl.innerHTML = blocks.join('');
                }
                if (webEl) {
                    if (d.website) { webEl.href = d.website; webEl.style.display='inline-block'; } else { webEl.style.display='none'; }
                }
                if (mcEl) {
                    const mcu = d.metacritic_url || (d.metacritic ? `https://www.metacritic.com/` : '');
                    if (mcu) { mcEl.href = mcu; mcEl.style.display='inline-block'; } else { mcEl.style.display='none'; }
                }
                if (rdEl) {
                    if (d.reddit_url) { rdEl.href = d.reddit_url.startsWith('http') ? d.reddit_url : ('https://www.reddit.com/'+d.reddit_url.replace(/^\/+/,'')); rdEl.style.display='inline-block'; } else { rdEl.style.display='none'; }
                }
                if (openRawgEl) {
                    const slug = d.slug || '';
                    if (slug) { openRawgEl.href = `https://rawg.io/games/${slug}`; openRawgEl.style.display='inline-block'; }
                    else { openRawgEl.style.display='none'; }
                }
                if (copyBtnEl) {
                    const link = d.website || (d.slug ? `https://rawg.io/games/${d.slug}` : '');
                    if (link) {
                        copyBtnEl.style.display='inline-block';
                        copyBtnEl.onclick = async () => { try { await navigator.clipboard.writeText(link); showNotification('Link copied!', 'success'); } catch(_) {} };
                    } else { copyBtnEl.style.display='none'; copyBtnEl.onclick = null; }
                }

                // Media tab
                if (screensEl) screensEl.innerHTML = '';
                if (moviesEl) moviesEl.innerHTML = '';
                if (mediaEmptyEl) mediaEmptyEl.style.display = 'none';
                try {
                    const [sc, mv] = await Promise.allSettled([fetchScreenshots(gameId), fetchMovies(gameId)]);
                    let anyMedia = false;
                    if (sc.status === 'fulfilled') {
                        const itemsSc = Array.isArray(sc.value?.results) ? sc.value.results : [];
                        if (itemsSc.length && screensEl) {
                            window.__rawgShots = itemsSc.map(it => it.image).filter(Boolean);
                            const html = itemsSc.slice(0,12).map((s, i) => `
                              <div class="col-6 col-md-4 col-lg-3">
                                <img class="img-fluid rounded rawg-shot" data-idx="${i}" src="${s.image}" alt="Screenshot" loading="lazy"/>
                              </div>`).join('');
                            screensEl.innerHTML = html; anyMedia = true;
                        }
                    }
                    if (mv.status === 'fulfilled') {
                        const itemsMv = Array.isArray(mv.value?.results) ? mv.value.results : [];
                        if (itemsMv.length && moviesEl) {
                            const html = itemsMv.slice(0,4).map(v => {
                                const data = v?.data || {};
                                const mp4 = data.max || data['720'] || data['480'] || '';
                                const thumb = v?.preview || '';
                                if (mp4) {
                                    return `<div class="col-12 col-md-6">
                                        <div class="ratio ratio-16x9 rounded overflow-hidden">
                                          <video controls preload="metadata" src="${mp4}" poster="${thumb || ''}"></video>
                                        </div>
                                      </div>`;
                                }
                                // Fallback: clickable thumbnail to RAWG page
                                const rawgLink = d?.slug ? `https://rawg.io/games/${d.slug}` : '#';
                                return `<div class="col-12 col-md-6">
                                    <a class="d-block ratio ratio-16x9 rounded overflow-hidden" href="${rawgLink}" target="_blank" rel="noopener">
                                      <img src="${thumb}" alt="Trailer preview" class="w-100 h-100 object-fit-cover">
                                    </a>
                                  </div>`;
                            }).join('');
                            moviesEl.innerHTML = html; anyMedia = true;
                        }
                    }
                    if (!anyMedia && mediaEmptyEl) mediaEmptyEl.style.display = '';
                } catch(_) { if (mediaEmptyEl) mediaEmptyEl.style.display = ''; }

                // Stores tab in modal
                if (storesWrap) storesWrap.innerHTML = '';
                if (storesEmpty) storesEmpty.style.display = 'none';
                try {
                    await ensureStoresMeta();
                    const dataStores = await fetchStores(gameId, { page_size: 12 });
                    const items = Array.isArray(dataStores?.results) ? dataStores.results : [];
                    if (items.length && storesWrap) {
                        const html = items.map(s => {
                            const { href, name } = resolveStoreUrl(s);
                            return `<a class="badge bg-secondary" target="_blank" rel="noopener" href="${href}">${name}</a>`;
                        }).join(' ');
                        storesWrap.innerHTML = html;
                    } else if (storesEmpty) { storesEmpty.style.display = ''; }
                } catch(_) { if (storesEmpty) storesEmpty.style.display = ''; }

                const modalEl = document.getElementById('rawgDetailsModal');
                if (modalEl && window.bootstrap?.Modal) {
                    const m = new bootstrap.Modal(modalEl); m.show();
                }
            } catch(err){
                showNotification('Failed to load game details', 'info');
            } finally {
                const loadingOverlay = document.getElementById('rawgDetailsLoading');
                if (loadingOverlay) loadingOverlay.classList.add('d-none');
                btn.disabled = false; btn.textContent = old;
            }
        });
    })();

    // --- Всё остальное остаётся без изменений ---
    // (остальные функции: звёздочки, темы, галерея, фильтры, формы, язык и т.д.)

});


// DOM Cleanup: removed legacy .stars rating demo

// Theme Toggle Functionality (default: dark/night, persists via localStorage + cookie)
const themeToggleBtn = document.getElementById('theme-toggle-btn');

function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function getThemeFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('theme');
        if (q === 'day' || q === 'night') return q;
        const hash = (window.location.hash || '').replace('#', '');
        if (hash === 'day' || hash === 'night') return hash;
    } catch (_) {}
    return null;
}

const savedThemeLS = localStorage.getItem('theme'); // 'night' | 'day'
const savedThemeCookie = getCookie('theme');
const savedThemeUrl = getThemeFromUrl();
// Prefer localStorage first (site choice), then URL, then cookie, else default night
const initialTheme = savedThemeLS || savedThemeUrl || savedThemeCookie;
let isNightTheme = initialTheme ? (initialTheme === 'night') : true;

function applyTheme() {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    if (isNightTheme) {
        htmlEl.classList.add('night-theme');
        htmlEl.classList.remove('day-theme');
        bodyEl.classList.add('night-theme');
        bodyEl.classList.remove('day-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = 'Switch to Light Mode';
    } else {
        htmlEl.classList.remove('night-theme');
        htmlEl.classList.add('day-theme');
        bodyEl.classList.remove('night-theme');
        bodyEl.classList.add('day-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = 'Switch to Dark Mode';
    }
    const themeStr = isNightTheme ? 'night' : 'day';
    localStorage.setItem('theme', themeStr);
    setCookie('theme', themeStr);
    // Persist in URL for file:// navigation between standalone pages
    try {
        const url = new URL(window.location.href);
        url.searchParams.set('theme', themeStr);
        window.history.replaceState({}, '', url.toString());
    } catch (_) {}

    // Propagate to ALL internal html links (so theme persists between pages)
    document.querySelectorAll('a[href*=".html"]').forEach(a => {
        try {
            const linkUrl = new URL(a.getAttribute('href'), window.location.href);
            linkUrl.searchParams.set('theme', themeStr);
            a.setAttribute('href', linkUrl.toString());
        } catch (_) {}
    });
}

applyTheme();

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
        isNightTheme = !isNightTheme;
        applyTheme();
    });
}

// DOM Cleanup: removed read-more demo

// DOM Cleanup: removed gallery thumbs demo

// DOM Cleanup: removed greeting demo

// DOM Cleanup: removed random facts demo

// DOM Cleanup: removed demo card interactions

// DOM Cleanup: removed navbar hide-on-scroll demo

// Scroll Progress Bar Logic (horizontal top)
const progressBar = document.getElementById('scroll-progress-bar');
const progressGlow = document.getElementById('scroll-progress-glow');
const progressStripes = document.getElementById('scroll-progress-stripes');

function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
    const winHeight = window.innerHeight || document.documentElement.clientHeight;
    const totalScrollable = Math.max(docHeight - winHeight, 1);
    const progress = Math.min(100, Math.max(0, (scrollTop / totalScrollable) * 100));
    const width = progress + '%';
    progressBar.style.width = width;
    if (progressGlow) progressGlow.style.width = width;
    if (progressStripes) progressStripes.style.width = width;
}

updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, {passive: true});
window.addEventListener('resize', updateScrollProgress);

// Animated Number Counters (IntersectionObserver)
const counters = document.querySelectorAll('.counter[data-target]');
const hasCounted = new WeakSet();

function animateCounter(el) {
    const target = Number(el.getAttribute('data-target')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const durationMs = 1500; // total duration
    const startTime = performance.now();
    const startVal = 0;

    function format(val) {
        if (target >= 1000) return Math.floor(val).toLocaleString() + suffix;
        return Math.floor(val) + suffix;
    }

    function step(now) {
        const t = Math.min(1, (now - startTime) / durationMs);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        const value = startVal + (target - startVal) * eased;
        el.textContent = format(value);
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

if (counters.length) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted.has(entry.target)) {
                hasCounted.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, {threshold: 0.3});
    counters.forEach(el => io.observe(el));
}

// DOM Cleanup: removed time display demo

// DOM Cleanup: removed keyboard navigation demo

// Loading helpers for submit buttons
function startButtonLoading(button, loadingText = 'Please wait…') {
    if (!button) return;
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + loadingText;
    button.disabled = true;
}

function stopButtonLoading(button) {
    if (!button) return;
    button.innerHTML = button.dataset.originalHtml || 'Submit';
    button.disabled = false;
}

// Contact Form with Async Submission
const contactForm = document.getElementById('contact-form') || document.querySelector('.form_section form, form.needs-validation');
let contactFeedback = document.getElementById('contact-feedback');

if (contactForm) {
    if (!contactFeedback) {
        contactFeedback = document.createElement('div');
        contactFeedback.id = 'contact-feedback';
        contactFeedback.className = 'contact-feedback mt-3';
        contactForm.parentElement.appendChild(contactFeedback);
    }

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const submitButton = contactForm.querySelector('[type="submit"], button.btn-primary, button.btn');
        startButtonLoading(submitButton);

        // Show loading state
        contactFeedback.className = 'contact-feedback loading';
        contactFeedback.innerHTML = '<p>Sending message...</p>';

        // Get form data
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name') || (document.getElementById('contact-name') ? document.getElementById('contact-name').value : (document.getElementById('name') ? document.getElementById('name').value : '')),
            email: formData.get('email') || (document.getElementById('contact-email') ? document.getElementById('contact-email').value : (document.getElementById('email') ? document.getElementById('email').value : '')),
            message: formData.get('message') || (document.getElementById('contact-message') ? document.getElementById('contact-message').value : (document.getElementById('message') ? document.getElementById('message').value : ''))
        };

        // Simulate async submission
        setTimeout(() => {
            // Simulate success (in real app, this would be a fetch to server)
            contactFeedback.className = 'contact-feedback success';
            contactFeedback.innerHTML = `
                    <p>✅ Message sent successfully!</p>
                    <p>Thank you, ${data.name || 'friend'}! We'll get back to you soon.</p>
                `;

            // Reset form
            contactForm.reset();
            stopButtonLoading(submitButton);
        }, 2000);
    });
}

// LocalStorage Auth: Registration/Login + Validation for assignment-registration-form
(function(){
  const regForm = document.getElementById('assignment-registration-form');
  if (!regForm) return;

  const emailEl = document.getElementById('assignment-email');
  const passEl = document.getElementById('assignment-password');
  const pass2El = document.getElementById('assignment-confirm-password');
  const nameEl = document.getElementById('assignment-name');
  const phoneEl = document.getElementById('assignment-phone');
  const emailErr = document.getElementById('assignment-email-error');
  const passErr = document.getElementById('assignment-password-error');
  const pass2Err = document.getElementById('assignment-confirm-password-error');
  const nameErr = document.getElementById('assignment-name-error');
  const phoneErr = document.getElementById('assignment-phone-error');
  const strengthBar = document.getElementById('assignment-password-strength-bar');
  const strengthText = document.getElementById('assignment-password-strength-text');
  const togglePassBtn = document.getElementById('toggle-password');
  const togglePass2Btn = document.getElementById('toggle-confirm-password');

  function gmGet(key, def){
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e){ return def; }
  }
  function gmSet(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validateName(v){ return !!v && v.trim().length >= 2; }
  function normalizePhone(v){ return (v||'').replace(/[^0-9+]/g,''); }
  function validatePhone(v){
    const p = normalizePhone(v);
    // Allow leading + and 8-15 digits roughly (E.164-like)
    return /^\+?[1-9][0-9]{7,14}$/.test(p);
  }
  function passwordScore(p){
    let s = 0;
    if (!p) return 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(5, s);
  }
  function renderStrength(p){
    if (!strengthBar) return;
    const s = passwordScore(p);
    const pct = [0,20,40,60,80,100][s];
    strengthBar.style.width = pct + '%';
    let cls = 'bg-danger';
    if (s>=4) cls = 'bg-success'; else if (s>=2) cls = 'bg-warning';
    strengthBar.className = 'progress-bar ' + cls;
    if (strengthText) strengthText.textContent = s>=4 ? 'Strong password' : (s>=2 ? 'Medium password' : 'Weak password');
  }

  function showError(el, msg){ if(el){ el.textContent = msg || ''; el.style.color = msg ? '#dc3545' : ''; } }

  nameEl && nameEl.addEventListener('input', ()=>{
    showError(nameErr, validateName(nameEl.value) ? '' : 'Enter your name (2+ chars)');
  });
  emailEl && emailEl.addEventListener('input', ()=>{
    showError(emailErr, validateEmail(emailEl.value.trim()) ? '' : 'Enter a valid email');
  });
  passEl && passEl.addEventListener('input', ()=>{
    renderStrength(passEl.value);
    showError(passErr, (passEl.value && passEl.value.length>=6) ? '' : 'At least 6 characters');
    if (pass2El) showError(pass2Err, pass2El.value && pass2El.value===passEl.value ? '' : 'Passwords must match');
  });
  pass2El && pass2El.addEventListener('input', ()=>{
    showError(pass2Err, pass2El.value===passEl.value ? '' : 'Passwords must match');
  });
  phoneEl && phoneEl.addEventListener('input', ()=>{
    showError(phoneErr, validatePhone(phoneEl.value) ? '' : 'Enter phone like +15551234567');
  });

  if (togglePassBtn && passEl){
    togglePassBtn.addEventListener('click', ()=>{
      const t = passEl.getAttribute('type')==='password' ? 'text' : 'password';
      passEl.setAttribute('type', t);
      togglePassBtn.textContent = t==='password' ? 'Show' : 'Hide';
    });
  }
  if (togglePass2Btn && pass2El){
    togglePass2Btn.addEventListener('click', ()=>{
      const t = pass2El.getAttribute('type')==='password' ? 'text' : 'password';
      pass2El.setAttribute('type', t);
      togglePass2Btn.textContent = t==='password' ? 'Show' : 'Hide';
    });
  }

  function renderProfile(email){
    const card = regForm.closest('.auth-card');
    if (!card) return;
    const users = gmGet('gm.users', []);
    const user = users.find(u=>u.email===email) || {email};
    card.innerHTML = `
      <div class="card-body p-4 p-md-5">
        <h2 class="auth-title text-center mb-3">Welcome</h2>
        ${user.name ? `<div class=\"mb-1\"><strong>Name:</strong> ${user.name}</div>` : ''}
        <div class="mb-1"><strong>Email:</strong> ${user.email}</div>
        ${user.phone ? `<div class=\"mb-3 text-muted\">Phone: ${user.phone}</div>` : '<div class=\"mb-3\"></div>'}
        <div class="mb-4 text-muted">Your account is stored locally in this browser.</div>
        <div class="d-grid gap-2">
          <button id="gm-logout-btn" class="btn btn-outline-warning">Log out</button>
          <a href="index.html" class="btn btn-primary">Go to Home</a>
        </div>
      </div>`;
    const logout = document.getElementById('gm-logout-btn');
    if (logout){ logout.addEventListener('click', ()=>{ localStorage.removeItem('gm.current_user'); window.location.reload(); }); }
  }

  regForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = (nameEl?.value||'').trim();
    const email = (emailEl?.value||'').trim().toLowerCase();
    const pw = (passEl?.value||'').trim();
    const pw2 = (pass2El?.value||'').trim();
    const phone = (phoneEl?.value||'').trim();
    let ok = true;
    if (!validateName(name)){ showError(nameErr,'Enter your name (2+ chars)'); ok=false; }
    if (!validateEmail(email)){ showError(emailErr,'Enter a valid email'); ok=false; }
    if (!pw || pw.length<6){ showError(passErr,'At least 6 characters'); ok=false; }
    if (pw!==pw2){ showError(pass2Err,'Passwords must match'); ok=false; }
    if (!validatePhone(phone)){ showError(phoneErr,'Enter phone like +15551234567'); ok=false; }
    if (!ok) return;

    const users = gmGet('gm.users', []);
    const exists = users.find(u=>u.email===email);
    if (exists){
      // Treat as login flow
      if (exists.password !== pw){ showError(passErr,'Wrong password for existing account'); return; }
      gmSet('gm.current_user', { email });
      renderProfile(email);
      return;
    }
    users.push({ name, email, phone: normalizePhone(phone), password: pw, createdAt: new Date().toISOString() });
    gmSet('gm.users', users);
    gmSet('gm.current_user', { email });
    renderProfile(email);
  });

  // Auto-render profile if already logged in
  const cur = gmGet('gm.current_user', null);
  if (cur && cur.email){ renderProfile(cur.email); }
})();

// LocalStorage Auth: Dedicated Login form handling (assignment-login-form)
(function(){
  const loginForm = document.getElementById('assignment-login-form');
  if (!loginForm) return;

  const emailEl = document.getElementById('login-email');
  const passEl = document.getElementById('login-password');
  const emailErr = document.getElementById('login-email-error');
  const passErr = document.getElementById('login-password-error');
  const rememberEl = document.getElementById('rememberMe');
  const toggleBtn = document.getElementById('toggle-login-password');

  function showError(el, msg){ if(el){ el.textContent = msg || ''; el.style.color = msg ? '#dc3545' : ''; } }
  function validateEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function gmGet(key, def){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e){ return def; } }
  function gmSet(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  // Prefill email if remembered
  const remembered = gmGet('gm.remember_email', '');
  if (remembered && emailEl) emailEl.value = remembered;

  if (toggleBtn && passEl){
    toggleBtn.addEventListener('click', ()=>{
      const t = passEl.getAttribute('type')==='password' ? 'text' : 'password';
      passEl.setAttribute('type', t);
      toggleBtn.textContent = t==='password' ? 'Show' : 'Hide';
    });
  }

  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = (emailEl?.value||'').trim();
    const pw = passEl?.value||'';
    let ok = true;
    if (!validateEmail(email)){ showError(emailErr,'Enter a valid email'); ok=false; }
    if (!pw){ showError(passErr,'Enter your password'); ok=false; }
    if (!ok) return;

    const users = gmGet('gm.users', []);
    const user = users.find(u=>u.email===email);
    if (!user){ showError(emailErr,'No account found for this email'); return; }
    if (user.password !== pw){ showError(passErr,'Incorrect password'); return; }

    if (rememberEl && rememberEl.checked){ localStorage.setItem('gm.remember_email', JSON.stringify(email)); }
    else { localStorage.removeItem('gm.remember_email'); }

    gmSet('gm.current_user', { email });
    // Render profile in-place if card exists, else redirect
    const card = loginForm.closest('.auth-card');
    if (card){
      card.innerHTML = `
        <div class="card-body p-4 p-md-5">
          <h2 class="auth-title text-center mb-3">Welcome</h2>
          <div class="mb-3"><strong>Email:</strong> ${email}</div>
          <div class="mb-4 text-muted">You are logged in on this device.</div>
          <div class="d-grid gap-2">
            <button id="gm-logout-btn" class="btn btn-outline-warning">Log out</button>
            <a href="index.html" class="btn btn-primary">Go to Home</a>
          </div>
        </div>`;
      const logout = document.getElementById('gm-logout-btn');
      if (logout){ logout.addEventListener('click', ()=>{ localStorage.removeItem('gm.current_user'); window.location.reload(); }); }
    } else {
      window.location.href = 'index.html';
    }
  });
})();

// DOM Cleanup: removed multi-step form demo

// Product Filtering System with Switch Statements
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');
const filteredGamesContainer = document.getElementById('filtered-games');

// Sample game data
const gamesData = [
    {name: 'Minecraft', category: 'action', price: 29.99, priceRange: '20-50'},
    {name: 'Hollow Knight', category: 'action', price: 15.99, priceRange: 'under-20'},
    {name: 'Dark Souls 3', category: 'rpg', price: 59.99, priceRange: 'over-50'},
    {name: 'Hearts of Iron 4', category: 'strategy', price: 39.99, priceRange: '20-50'},
    {name: 'FIFA 24', category: 'sports', price: 69.99, priceRange: 'over-50'},
    {name: 'Among Us', category: 'action', price: 0, priceRange: 'free'},
    {name: 'Civilization VI', category: 'strategy', price: 49.99, priceRange: '20-50'},
    {name: 'The Witcher 3', category: 'rpg', price: 39.99, priceRange: '20-50'}
];

function renderGames(games) {
    if (filteredGamesContainer) {
        filteredGamesContainer.innerHTML = games.map(game => `
                <div class="game-item">
                    <h6>${game.name}</h6>
                    <div class="game-category">Category: ${game.category.toUpperCase()}</div>
                    <div class="game-price">$${game.price === 0 ? 'Free' : game.price}</div>
                </div>
            `).join('');
    }
}

function filterGames() {
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedPrice = priceFilter ? priceFilter.value : 'all';

    let filteredGames = gamesData;

    // Filter by category using switch statement
    switch (selectedCategory) {
        case 'action':
            filteredGames = filteredGames.filter(game => game.category === 'action');
            break;
        case 'rpg':
            filteredGames = filteredGames.filter(game => game.category === 'rpg');
            break;
        case 'strategy':
            filteredGames = filteredGames.filter(game => game.category === 'strategy');
            break;
        case 'sports':
            filteredGames = filteredGames.filter(game => game.category === 'sports');
            break;
        case 'all':
        default:
            // No filtering by category
            break;
    }

    // Filter by price using switch statement
    switch (selectedPrice) {
        case 'free':
            filteredGames = filteredGames.filter(game => game.price === 0);
            break;
        case 'under-20':
            filteredGames = filteredGames.filter(game => game.price > 0 && game.price < 20);
            break;
        case '20-50':
            filteredGames = filteredGames.filter(game => game.price >= 20 && game.price <= 50);
            break;
        case 'over-50':
            filteredGames = filteredGames.filter(game => game.price > 50);
            break;
        case 'all':
        default:
            // No filtering by price
            break;
    }

    renderGames(filteredGames);
}

// Add event listeners for filtering
if (categoryFilter) {
    categoryFilter.addEventListener('change', filterGames);
}
if (priceFilter) {
    priceFilter.addEventListener('change', filterGames);
}

// Initialize games display
renderGames(gamesData);

// Language Selector with Switch Statements
const languageButtons = document.querySelectorAll('.language-btn');
const welcomeText = document.getElementById('welcome-text');
const descriptionText = document.getElementById('description-text');
const featuresText = document.getElementById('features-text');

const translations = {
    en: {
        welcome: 'Welcome to GoldMine Gaming Platform!',
        description: 'Discover amazing games and connect with fellow gamers.',
        features: 'Features: Game Discovery, Expert Reviews, Community Hub'
    },
    ru: {
        welcome: 'Добро пожаловать на игровую платформу GoldMine!',
        description: 'Откройте для себя удивительные игры и общайтесь с единомышленниками.',
        features: 'Возможности: Поиск игр, Экспертные обзоры, Сообщество'
    },
    kz: {
        welcome: 'GoldMine ойын платформасына қош келдіңіз!',
        description: 'Керемет ойындарды ашып, ойыншылармен байланысыңыз.',
        features: 'Мүмкіндіктер: Ойын іздеу, Эксперттік шолулар, Қауымдастық'
    }
};

function changeLanguage(lang) {
    // Update button states
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    // Update content using switch statement
    switch (lang) {
        case 'en':
            if (welcomeText) welcomeText.textContent = translations.en.welcome;
            if (descriptionText) descriptionText.textContent = translations.en.description;
            if (featuresText) featuresText.textContent = translations.en.features;
            break;
        case 'ru':
            if (welcomeText) welcomeText.textContent = translations.ru.welcome;
            if (descriptionText) descriptionText.textContent = translations.ru.description;
            if (featuresText) featuresText.textContent = translations.ru.features;
            break;
        case 'kz':
            if (welcomeText) welcomeText.textContent = translations.kz.welcome;
            if (descriptionText) descriptionText.textContent = translations.kz.description;
            if (featuresText) featuresText.textContent = translations.kz.features;
            break;
        default:
            console.log('Unsupported language');
    }

    // Store language preference
    localStorage.setItem('selectedLanguage', lang);
}

// Add event listeners for language buttons
languageButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        changeLanguage(this.dataset.lang);
    });
});

// Load saved language preference
const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
changeLanguage(savedLanguage);

// Time-based Greeting with Switch Statement
function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    let greeting;

    switch (true) {
        case hour >= 5 && hour < 12:
            greeting = 'Good Morning';
            break;
        case hour >= 12 && hour < 17:
            greeting = 'Good Afternoon';
            break;
        case hour >= 17 && hour < 21:
            greeting = 'Good Evening';
            break;
        default:
            greeting = 'Good Night';
    }

    return greeting;
}

// Update greeting periodically
setInterval(() => {
    const greeting = getTimeBasedGreeting();
    const greetingElements = document.querySelectorAll('.time-based-greeting');
    greetingElements.forEach(element => {
        element.textContent = greeting;
    });
}, 60000); // Update every minute

// Additional Event Handling Examples

// Form Reset Button
const resetButtons = document.querySelectorAll('.reset-form-btn');
resetButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        const form = this.closest('form');
        if (form) {
            document.querySelectorAll('input').forEach(input => input.value = '');
            document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
            document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
            console.log('Form reset successfully');
        }
    });
});

// Dynamic Content Loading (Simulated)
const loadMoreBtn = document.getElementById('load-more-btn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function () {
        this.textContent = 'Loading...';
        this.disabled = true;

        // Simulate content loading
        setTimeout(() => {
            const newContent = document.createElement('div');
            newContent.innerHTML = `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">New Game ${Date.now()}</h5>
                            <p class="card-text">This is dynamically loaded content!</p>
                        </div>
                    </div>
                `;

            const container = document.getElementById('dynamic-content-container');
            if (container) {
                container.appendChild(newContent);
            }

            this.textContent = 'Load More';
            this.disabled = false;
        }, 1000);
    });
}

// Advanced JavaScript Features

// JavaScript Objects and Methods - Game Library Management
class GameLibrary {
    constructor() {
        this.games = [];
        this.nextId = 1;
    }

    addGame(name, genre, rating) {
        const game = {
            id: this.nextId++,
            name: name,
            genre: genre,
            rating: rating,
            dateAdded: new Date().toLocaleDateString()
        };
        this.games.push(game);
        return game;
    }

    getAllGames() {
        return this.games;
    }

    sortByRating() {
        return this.games.sort((a, b) => b.rating - a.rating);
    }

    getGamesByGenre(genre) {
        return this.games.filter(game => game.genre.toLowerCase() === genre.toLowerCase());
    }

    getAverageRating() {
        if (this.games.length === 0) return 0;
        const total = this.games.reduce((sum, game) => sum + game.rating, 0);
        return (total / this.games.length).toFixed(2);
    }

    getTotalGames() {
        return this.games.length;
    }
}

const gameLibrary = new GameLibrary();

// Initialize with sample games
gameLibrary.addGame("Minecraft", "Sandbox", 9);
gameLibrary.addGame("Hollow Knight", "Metroidvania", 8);
gameLibrary.addGame("Dark Souls 3", "Action RPG", 9);
gameLibrary.addGame("Hearts of Iron 4", "Strategy", 7);

// Game Library Form Handler
const addGameForm = document.getElementById('add-game-form');
const gameLibraryDisplay = document.getElementById('game-library-display');
const sortGamesBtn = document.getElementById('sort-games-btn');

if (addGameForm && gameLibraryDisplay) {
    addGameForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('game-name').value;
        const genre = document.getElementById('game-genre').value;
        const rating = parseInt(document.getElementById('game-rating').value);

        const newGame = gameLibrary.addGame(name, genre, rating);
        displayGames();

        // Clear form
        addGameForm.reset();

        // Show success message
        showNotification(`Game "${name}" added successfully!`, 'success');
    });
}

if (sortGamesBtn) {
    sortGamesBtn.addEventListener('click', function () {
        const sortedGames = gameLibrary.sortByRating();
        displayGames(sortedGames);
        this.textContent = 'Sorted by Rating ✓';
        setTimeout(() => {
            this.textContent = 'Sort by Rating';
        }, 2000);
    });
}

function displayGames(games = null) {
    if (!gameLibraryDisplay) return;

    const gamesToShow = games || gameLibrary.getAllGames();
    gameLibraryDisplay.innerHTML = '';

    if (gamesToShow.length === 0) {
        gameLibraryDisplay.innerHTML = '<p class="text-muted">No games in library</p>';
        return;
    }

    gamesToShow.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-item-display';
        gameElement.innerHTML = `
                <h6>${game.name}</h6>
                <p class="mb-1"><strong>Genre:</strong> ${game.genre}</p>
                <p class="mb-1"><strong>Rating:</strong> <span class="game-rating">${game.rating}/10</span></p>
                <small class="text-muted">Added: ${game.dateAdded}</small>
            `;
        gameLibraryDisplay.appendChild(gameElement);
    });
}

// Initialize display
displayGames();

// Arrays and Loops Demo
const achievementsData = [
    "First Victory", "Speed Runner", "Collector", "Explorer", "Master Builder",
    "Boss Slayer", "Treasure Hunter", "Puzzle Solver", "Team Player", "Legend"
];

const playerStats = [
    {label: "Games Played", value: 0},
    {label: "Hours Played", value: 0},
    {label: "Achievements", value: 0},
    {label: "High Score", value: 0}
];

const generateAchievementsBtn = document.getElementById('generate-achievements-btn');
const achievementsList = document.getElementById('achievements-list');
const calculateStatsBtn = document.getElementById('calculate-stats-btn');
const statsDisplay = document.getElementById('stats-display');

if (generateAchievementsBtn && achievementsList) {
    generateAchievementsBtn.addEventListener('click', function () {
        achievementsList.innerHTML = '';

        // Use for loop to generate random achievements
        const numAchievements = Math.floor(Math.random() * 5) + 3;
        const usedAchievements = new Set();

        for (let i = 0; i < numAchievements; i++) {
            let randomAchievement;
            do {
                randomAchievement = achievementsData[Math.floor(Math.random() * achievementsData.length)];
            } while (usedAchievements.has(randomAchievement));

            usedAchievements.add(randomAchievement);

            const achievementElement = document.createElement('div');
            achievementElement.className = 'achievement-item';
            achievementElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>🏆 ${randomAchievement}</span>
                        <small class="text-muted">${new Date().toLocaleDateString()}</small>
                    </div>
                `;
            achievementsList.appendChild(achievementElement);
        }
    });
}

if (calculateStatsBtn && statsDisplay) {
    calculateStatsBtn.addEventListener('click', function () {
        statsDisplay.innerHTML = '';

        // Use while loop to calculate random stats
        let i = 0;
        while (i < playerStats.length) {
            const stat = playerStats[i];
            stat.value = Math.floor(Math.random() * 1000) + 100;

            const statElement = document.createElement('div');
            statElement.className = 'stat-item-display';
            statElement.innerHTML = `
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                `;
            statsDisplay.appendChild(statElement);
            i++;
        }
    });
}

// Higher-Order Functions Demo
const gameCollection = [
    {name: "Minecraft", rating: 9, genre: "Sandbox"},
    {name: "Hollow Knight", rating: 8, genre: "Metroidvania"},
    {name: "Dark Souls 3", rating: 9, genre: "Action RPG"},
    {name: "Hearts of Iron 4", rating: 7, genre: "Strategy"},
    {name: "Among Us", rating: 6, genre: "Social"},
    {name: "The Witcher 3", rating: 10, genre: "RPG"}
];

const gameCollectionDisplay = document.getElementById('game-collection');
const filterHighRatedBtn = document.getElementById('filter-high-rated-btn');
const filteredGamesDisplay = document.getElementById('filtered-games-display');
const mapGameNamesBtn = document.getElementById('map-game-names-btn');
const mappedNamesDisplay = document.getElementById('mapped-names-display');

// Display initial collection using forEach
function displayGameCollection(games, container) {
    if (!container) return;

    container.innerHTML = '';
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'collection-game-item';
        gameElement.innerHTML = `
                <div class="game-name">${game.name}</div>
                <div class="game-rating">Rating: ${game.rating}/10</div>
                <small class="text-muted">Genre: ${game.genre}</small>
            `;
        container.appendChild(gameElement);
    });
}

// Initialize collection display
displayGameCollection(gameCollection, gameCollectionDisplay);

if (filterHighRatedBtn && filteredGamesDisplay) {
    filterHighRatedBtn.addEventListener('click', function () {
        // Use filter higher-order function
        const highRatedGames = gameCollection.filter(game => game.rating > 7);
        displayGameCollection(highRatedGames, filteredGamesDisplay);
        this.textContent = `Found ${highRatedGames.length} High Rated Games`;
    });
}

if (mapGameNamesBtn && mappedNamesDisplay) {
    mapGameNamesBtn.addEventListener('click', function () {
        // Use map higher-order function
        const gameNames = gameCollection.map(game => game.name.toUpperCase());

        mappedNamesDisplay.innerHTML = '';
        gameNames.forEach(name => {
            const nameElement = document.createElement('div');
            nameElement.className = 'mapped-name-item';
            nameElement.textContent = name;
            mappedNamesDisplay.appendChild(nameElement);
        });

        this.textContent = `Mapped ${gameNames.length} Names`;
    });
}

// Sound Effects Demo
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.volume = 0.5;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playSuccessSound() {
        this.playTone(523, 0.2); // C5
        setTimeout(() => this.playTone(659, 0.2), 100); // E5
        setTimeout(() => this.playTone(784, 0.3), 200); // G5
    }

    playErrorSound() {
        this.playTone(200, 0.5, 'sawtooth');
    }

    playNotificationSound() {
        this.playTone(800, 0.1);
        setTimeout(() => this.playTone(600, 0.1), 150);
        setTimeout(() => this.playTone(400, 0.1), 300);
    }

    playVictorySound() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((note, index) => {
            setTimeout(() => this.playTone(note, 0.3), index * 150);
        });
    }

    setVolume(volume) {
        this.volume = volume / 100;
    }
}

const audioManager = new AudioManager();

// Sound effect buttons
const playSuccessSoundBtn = document.getElementById('play-success-sound');
const playErrorSoundBtn = document.getElementById('play-error-sound');
const playNotificationSoundBtn = document.getElementById('play-notification-sound');
const playVictorySoundBtn = document.getElementById('play-victory-sound');
const testAllSoundsBtn = document.getElementById('test-all-sounds-btn');
const volumeControl = document.getElementById('volume-control');
const volumeDisplay = document.getElementById('volume-display');
const audioStatus = document.getElementById('audio-status');

if (playSuccessSoundBtn) {
    playSuccessSoundBtn.addEventListener('click', function () {
        audioManager.playSuccessSound();
        updateAudioStatus('Success sound played!', 'success');
    });
}

if (playErrorSoundBtn) {
    playErrorSoundBtn.addEventListener('click', function () {
        audioManager.playErrorSound();
        updateAudioStatus('Error sound played!', 'error');
    });
}

if (playNotificationSoundBtn) {
    playNotificationSoundBtn.addEventListener('click', function () {
        audioManager.playNotificationSound();
        updateAudioStatus('Notification sound played!', 'success');
    });
}

if (playVictorySoundBtn) {
    playVictorySoundBtn.addEventListener('click', function () {
        audioManager.playVictorySound();
        updateAudioStatus('Victory sound played!', 'success');
    });
}

if (testAllSoundsBtn) {
    testAllSoundsBtn.addEventListener('click', function () {
        updateAudioStatus('Playing all sounds...', 'success');
        audioManager.playSuccessSound();
        setTimeout(() => audioManager.playNotificationSound(), 1000);
        setTimeout(() => audioManager.playVictorySound(), 2000);
    });
}

if (volumeControl && volumeDisplay) {
    volumeControl.addEventListener('input', function () {
        const volume = this.value;
        volumeDisplay.textContent = volume;
        audioManager.setVolume(volume);
    });
}

function updateAudioStatus(message, type) {
    if (!audioStatus) return;

    audioStatus.innerHTML = `<p class="status-${type}">${message}</p>`;
    setTimeout(() => {
        audioStatus.innerHTML = '<p class="text-muted">Click a sound button to test audio functionality</p>';
    }, 3000);
}

// Global mute toggle with persistence
const muteToggle = document.getElementById('mute-toggle');
const savedMuted = localStorage.getItem('audioMuted') === 'true';
if (muteToggle) {
    muteToggle.checked = savedMuted;
    if (savedMuted && typeof audioManager?.setVolume === 'function') {
        audioManager.setVolume(0);
        if (volumeDisplay) volumeDisplay.textContent = '0';
        if (volumeControl) volumeControl.value = 0;
    }
    muteToggle.addEventListener('change', function () {
        const muted = this.checked;
        localStorage.setItem('audioMuted', String(muted));
        if (muted) {
            if (typeof audioManager?.setVolume === 'function') audioManager.setVolume(0);
            if (volumeDisplay) volumeDisplay.textContent = '0';
            if (volumeControl) volumeControl.value = 0;
        } else {
            if (typeof audioManager?.setVolume === 'function') audioManager.setVolume(volumeControl ? volumeControl.value : 50);
            if (volumeDisplay && volumeControl) volumeDisplay.textContent = volumeControl.value;
        }
    });
}

// Animations Demo
const animationTarget = document.getElementById('animation-target');
const animatedElement = animationTarget ? animationTarget.querySelector('.animated-element') : null;

const fadeInBtn = document.getElementById('fade-in-btn');
const fadeOutBtn = document.getElementById('fade-out-btn');
const slideInBtn = document.getElementById('slide-in-btn');
const bounceBtn = document.getElementById('bounce-btn');
const rotateBtn = document.getElementById('rotate-btn');
const pulseBtn = document.getElementById('pulse-btn');
const resetAnimationsBtn = document.getElementById('reset-animations-btn');

function applyAnimation(animationClass) {
    if (!animatedElement) return;

    // Remove all animation classes
    animatedElement.classList.remove('fade-in', 'fade-out', 'slide-in', 'bounce', 'rotate', 'pulse');

    // Force reflow
    animatedElement.offsetHeight;

    // Add new animation class
    animatedElement.classList.add(animationClass);

    // Remove animation class after animation completes
    setTimeout(() => {
        animatedElement.classList.remove(animationClass);
    }, 1000);
}

if (fadeInBtn) {
    fadeInBtn.addEventListener('click', () => applyAnimation('fade-in'));
}

if (fadeOutBtn) {
    fadeOutBtn.addEventListener('click', () => applyAnimation('fade-out'));
}

if (slideInBtn) {
    slideInBtn.addEventListener('click', () => applyAnimation('slide-in'));
}

if (bounceBtn) {
    bounceBtn.addEventListener('click', () => applyAnimation('bounce'));
}

if (rotateBtn) {
    rotateBtn.addEventListener('click', () => applyAnimation('rotate'));
}

if (pulseBtn) {
    pulseBtn.addEventListener('click', () => applyAnimation('pulse'));
}

if (resetAnimationsBtn) {
    resetAnimationsBtn.addEventListener('click', function () {
        if (animatedElement) {
            animatedElement.classList.remove('fade-in', 'fade-out', 'slide-in', 'bounce', 'rotate', 'pulse');
            animatedElement.style.transform = '';
            animatedElement.style.opacity = '';
        }
    });
}

// Konami code easter egg: up up down down left right left right b a
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const recentKeys = [];
document.addEventListener('keydown', (e) => {
    recentKeys.push(e.key);
    if (recentKeys.length > konamiSequence.length) recentKeys.shift();
    if (konamiSequence.every((k, i) => recentKeys[i]?.toLowerCase() === k.toLowerCase())) {
        // fun: confetti-like animation and victory sound
        try {
            audioManager.playVictorySound();
        } catch (err) {
        }
        triggerConfetti();
        showNotification('Konami code activated! 🎉', 'success');
        recentKeys.length = 0;
    }
});

function triggerConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#d4af37', '#ffd700', '#17a2b8', '#28a745', '#dc3545', '#6c757d'];
    const pieces = 120;
    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement('span');
        piece.style.position = 'absolute';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.top = '-10px';
        piece.style.width = '8px';
        piece.style.height = '14px';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        piece.style.opacity = '0.9';
        piece.style.borderRadius = '2px';
        container.appendChild(piece);

        const duration = 3000 + Math.random() * 2000;
        const translateX = (Math.random() - 0.5) * 200;
        piece.animate([
            {transform: `translate(0, 0) rotate(0deg)`, opacity: 1},
            {transform: `translate(${translateX}px, 100vh) rotate(720deg)`, opacity: 0.7}
        ], {duration, easing: 'cubic-bezier(.17,.67,.83,.67)', fill: 'forwards'});
    }
    setTimeout(() => container.remove(), 5500);
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}
;

// Part 3: jQuery Features for Assignment 7
// Toast Notification System
window.showToast = function (message) {
    $('#notification-toast').stop(true).text(message).fadeIn(300).delay(2000).fadeOut(600);
};
$(document).on('click', 'button[data-action="wishlist"]', function () {
    var game = $(this).data('game') || "Game";
    showToast(game + ' added to your wishlist!');
});
// Copy to Clipboard Button
$(document).on('click', '.copy-btn', function () {
    var $btn = $(this);
    var targetEl = $($btn.data('clipboard-target'))[0];
    if (!targetEl) return;
    var copied = targetEl.tagName === 'PRE' ? targetEl.innerText : $(targetEl).text();
    navigator.clipboard.writeText(copied).then(function () {
        $btn.text('✔ Copied!');
        setTimeout(function () {
            $btn.text('Copy');
        }, 1200);
    });
});

// Image Lazy Loading
function lazyLoad() {
    $('.lazy-img').each(function () {
        var $img = $(this);
        if ($img.attr('src') !== $img.data('src') &&
            $img.offset().top < $(window).scrollTop() + $(window).height() + 150) {
            $img.attr('src', $img.data('src'));
        }
    });
}

$(window).on('scroll resize', lazyLoad);
lazyLoad();
