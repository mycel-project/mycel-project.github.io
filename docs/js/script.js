const BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? '/docs/' : '/';

const PLATFORM_ICONS = {
    apk: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M8 12h8M12 8v8"/></svg>`,
    default: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
};

function platformLabel(name) {
    const n = name.toLowerCase();
    if (n.endsWith('.apk')) return 'Android (APK)';
    if (n.endsWith('.ipa')) return 'iOS';
    if (n.endsWith('.exe') || n.includes('windows')) return 'Windows';
    if (n.endsWith('.dmg') || n.includes('macos') || n.includes('mac')) return 'macOS';
    if (n.endsWith('.deb') || n.includes('linux')) return 'Linux';
    if (n.endsWith('.appimage')) return 'Linux (AppImage)';
    return name;
}

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildCard(release) {
    const isPrerelease = release.prerelease;
    const assets = (release.assets || []).filter(
        a => !a.name.endsWith('.sha256') && !a.name.endsWith('.sig')
    );

    const template = document.getElementById('card-template');
    const card = template.content.firstElementChild.cloneNode(true);

    const version = card.querySelector('.version');
    const badge = card.querySelector('.badge');
    const date = card.querySelector('.release-date');
    const platforms = card.querySelector('.platforms');
    const toggle = card.querySelector('.changelog-toggle');
    const log = card.querySelector('.changelog');
    const releaseLink = card.querySelector(".release-link .gh-btn")

    version.textContent = release.tag_name;

    badge.textContent = isPrerelease ? 'pre-release' : 'stable';
    badge.classList.add(isPrerelease ? 'badge-pre' : 'badge-stable');

    date.textContent = formatDate(release.published_at);

    if (assets.length > 0) {
        assets.forEach(asset => {
            const a = document.createElement('a');
            a.href = asset.browser_download_url;
            a.className = 'dl-btn';
            a.innerHTML = `${PLATFORM_ICONS.default} ${platformLabel(asset.name)}`;
            platforms.appendChild(a);
        });
    } else {
        platforms.innerHTML = `
            <span style="font-size:13px;color:var(--muted)">
                No downloadable assets for this release.
            </span>
        `;
    }

    if (release.body && release.body.trim()) {
        log.style.display = 'none';
        log.textContent = release.body.trim();

	releaseLink.setAttribute("href", release.html_url)

        toggle.addEventListener('click', () => {
            const open = log.style.display !== 'none';
            log.style.display = open ? 'none' : 'block';
            toggle.textContent = open
                ? '+ show changelog'
                : '− hide changelog';
        });
    } else {
        toggle.remove();
        log.remove();
    }

    return card;
}

function emptyState(message) {
    return `<div class="empty-state">
    <div class="empty-icon">○</div>
    <p>${message}</p>
  </div>`;
}

function switchTab(repoId, btn) {
    document.querySelectorAll('.repo-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(repoId).classList.add('active');
    btn.classList.add('active');
}

async function load() {
    const projects = [
        {
            repo: "mycel-project/mycelium",
            stableEl: document.getElementById('mycelium-stable-container'),
            preEl: document.getElementById('mycelium-pre-container')
        },
        {
            repo: "mycel-project/mycel",
            stableEl: document.getElementById('mycel-stable-container'),
            preEl: document.getElementById('mycel-pre-container')
        }
    ];

    for (const project of projects) {
        const { repo, stableEl, preEl } = project;

        if (!stableEl || !preEl) continue;

        try {
            const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=20`);
            if (!res.ok) throw new Error(`${res.status}`);
            const releases = await res.json();

            const stable = releases.find(r => !r.prerelease && !r.draft);
            const prerelease = releases.find(r => r.prerelease && !r.draft);

            stableEl.innerHTML = '';
            if (stable) {
                stableEl.appendChild(buildCard(stable));
            } else {
                stableEl.innerHTML = emptyState('No stable release yet.');
            }

            preEl.innerHTML = '';
            if (prerelease) {
                preEl.appendChild(buildCard(prerelease));
            } else {
                preEl.innerHTML = emptyState('No pre-release available.');
            }

        } catch (err) {
            stableEl.innerHTML = `<div class="error-msg">Error: ${err.message}. <a href="https://github.com/${repo}/releases">GitHub ↗</a></div>`;
            preEl.innerHTML = '';
        }
    }
}

window.addEventListener("load", () => {
    load();
})

class SiteNavbar extends HTMLElement {
    async connectedCallback() {
	const rootPaths = ['/', '/index.html', '/docs/', '/docs/index.html', '/download.html', '/docs/download.html'];
	const isRoot = rootPaths.includes(window.location.pathname);
        const delay = isRoot ? new Promise(r => setTimeout(r, 200)) : Promise.resolve();

        try {
            const [res] = await Promise.all([
                fetch(`${BASE}components/navbar.html`),
                delay
            ]);
            this.innerHTML = await res.text();
        } catch (e) {
            console.error('navbar fetch failed', e);
        } finally {
            if (isRoot) {
                const loader = document.getElementById('loader');
                loader?.classList.add('fade-out');
                setTimeout(() => loader?.remove(), 400);
            }
        }
    }
}

customElements.define('site-navbar', SiteNavbar);

class SiteFooter extends HTMLElement {
    async connectedCallback() {
	const res = await fetch(`${BASE}components/footer.html`);
        this.innerHTML = await res.text();
    }
}

customElements.define('site-footer', SiteFooter);
