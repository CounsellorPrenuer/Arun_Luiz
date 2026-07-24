const PROJECT_ID = 'k1fphtd3';
const DATASET = 'production';
const API_VERSION = '2023-05-03';

// Fetch function
async function fetchSanity(query) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.result;
  } catch (err) {
    console.error("Sanity fetch error:", err);
    return null;
  }
}

async function updateLiveContent() {
  const siteSettings = await fetchSanity('*[_type == "siteSettings"][0]');
  const heroSection = await fetchSanity('*[_type == "heroSection"][0]');
  const aboutSection = await fetchSanity('*[_type == "aboutSection"][0]');
  const services = await fetchSanity('*[_type == "service"]');
  const testimonials = await fetchSanity('*[_type == "testimonial"]');

  // 1. Site Settings
  if (siteSettings) {
    document.querySelectorAll('.nav-brand-name').forEach(el => el.textContent = siteSettings.founderName);
    document.querySelectorAll('.nav-brand-sub').forEach(el => el.textContent = siteSettings.subtitle);
    document.querySelectorAll('.footer-title').forEach(el => el.textContent = siteSettings.founderName);
    document.querySelectorAll('.footer-desc').forEach(el => el.textContent = siteSettings.subtitle);
    
    // Update contact phone
    const contactEls = document.querySelectorAll('.contact-item p');
    if (contactEls.length > 0) {
      contactEls[0].textContent = siteSettings.contactPhone;
    }
  }

  // 2. Hero Section
  if (heroSection) {
    const eyebrow = document.querySelector('.hero-eyebrow');
    if (eyebrow) eyebrow.textContent = heroSection.eyebrow;
    
    const h1 = document.querySelector('.hero-h1');
    if (h1) h1.innerHTML = heroSection.headline;
    
    const sub = document.querySelector('.hero-sub');
    if (sub) sub.textContent = heroSection.subheadline;

    if (heroSection.badges && heroSection.badges.length >= 3) {
      document.querySelector('.badge-a .badge-lbl').textContent = heroSection.badges[0].label;
      document.querySelector('.badge-a .badge-val').textContent = heroSection.badges[0].value;
      
      document.querySelector('.badge-b .badge-lbl').textContent = heroSection.badges[1].label;
      document.querySelector('.badge-b .badge-val').textContent = heroSection.badges[1].value;
      
      document.querySelector('.badge-c .badge-lbl').textContent = heroSection.badges[2].label;
      document.querySelector('.badge-c .badge-val').textContent = heroSection.badges[2].value;
    }
  }

  // 3. About Section
  if (aboutSection) {
    const aboutTitle = document.querySelector('.section-title');
    if (aboutTitle && aboutTitle.textContent.includes('About')) {
      aboutTitle.innerHTML = aboutSection.eyebrow;
    }
    
    const aboutH2 = document.querySelector('.about-content h2');
    if (aboutH2) aboutH2.innerHTML = aboutSection.headline;
    
    if (aboutSection.bioParagraphs) {
      const bioHtml = aboutSection.bioParagraphs.map(p => `<p class="about-p">${p}</p>`).join('');
      document.querySelectorAll('.about-p').forEach(el => el.remove());
      const cta = document.querySelector('.about-cta');
      if (cta) cta.insertAdjacentHTML('beforebegin', bioHtml);
    }
    
    const ctaSpan = document.querySelector('.about-cta span');
    if (ctaSpan) ctaSpan.textContent = aboutSection.ctaText;
  }

  // 4. Services Section
  if (services && services.length > 0) {
    const servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
      servicesGrid.innerHTML = '';
      services.forEach(s => {
        const tagsHtml = (s.tags || []).map(t => `<span class="s-tag">${t}</span>`).join('');
        servicesGrid.insertAdjacentHTML('beforeend', `
          <div class="service-card fade-up">
            <div class="s-ico">${s.iconSvg || ''}</div>
            <h3 class="s-title">${s.title}</h3>
            <p class="s-desc">${s.description}</p>
            <div class="s-tags">${tagsHtml}</div>
          </div>
        `);
      });
    }
  }

  // 5. Testimonials Section
  if (testimonials && testimonials.length > 0) {
    const testiGrid = document.querySelector('.testi-grid');
    if (testiGrid) {
      testiGrid.innerHTML = '';
      testimonials.forEach(t => {
        testiGrid.insertAdjacentHTML('beforeend', `
          <div class="testi-card fade-up">
            <div class="quote-mark">“</div>
            <p class="testi-text">${t.quote}</p>
            <div class="testi-author">
              <div class="t-av">${t.authorInitials || ''}</div>
              <div>
                <div class="t-name">${t.authorName}</div>
                <div class="t-role">${t.authorRole}</div>
              </div>
            </div>
          </div>
        `);
      });
    }
  }
}

// Run the update when the page loads
document.addEventListener('DOMContentLoaded', updateLiveContent);
