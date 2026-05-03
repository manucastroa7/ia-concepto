import { ExtractedFlyerData } from "./GeminiVisionService";

export interface AgencyConfig {
  name: string;
  phone: string;
  colorPrimary: string;
  colorAccent: string;
  slogan: string;
  logoFullUrl?: string;
  logoCompactUrl?: string;
}

export interface FlyerRenderOptions {
  heroImages?: string[];
  itemImages?: Record<string, string>;
  attractions?: Array<{ name: string; rating?: number | null; primaryType?: string }>;
  agencySettings?: any;
  format?: "post" | "story";
}

export class FlyerGeneratorService {
  private getAgencyConfig(category?: string, settings?: any): AgencyConfig & { flagEmoji?: string } {
    let config: AgencyConfig & { flagEmoji?: string } = {
      name: settings?.name || process.env.AGENCY_NAME || "Concepto Evt",
      phone: settings?.phone || process.env.AGENCY_PHONE || "",
      colorPrimary: settings?.colorPrimary || process.env.AGENCY_COLOR_PRIMARY || "#1e3a5f",
      colorAccent: settings?.colorAccent || process.env.AGENCY_COLOR_ACCENT || "#f97316",
      slogan: settings?.slogan || process.env.AGENCY_SLOGAN || "Viajá con quien sabe",
      logoFullUrl: settings?.logoFullUrl,
      logoCompactUrl: settings?.logoCompactUrl,
      flagEmoji: "🌎"
    };

    switch (category?.trim()?.toLowerCase()) {
      case 'brasil':
        config.colorPrimary = settings?.colorPrimary || '#14532d';
        config.colorAccent = settings?.colorAccent || '#22c55e';
        config.flagEmoji = '🏖️';
        break;
      case 'caribe':
        config.colorPrimary = settings?.colorPrimary || '#0c4a6e';
        config.colorAccent = settings?.colorAccent || '#38bdf8';
        config.flagEmoji = '🏝️';
        break;
      case 'sports':
        config.colorPrimary = settings?.colorPrimary || '#7c2d12';
        config.colorAccent = settings?.colorAccent || '#f97316';
        config.flagEmoji = '⚽';
        break;
      case 'usa':
        config.colorPrimary = settings?.colorPrimary || '#1e1b4b';
        config.colorAccent = settings?.colorAccent || '#4338ca';
        config.flagEmoji = '🇺🇸';
        break;
      case 'salidas grupales':
        config.colorPrimary = settings?.colorPrimary || '#78350f';
        config.colorAccent = settings?.colorAccent || '#f59e0b';
        config.flagEmoji = '👥';
        break;
      case 'europa':
        config.colorPrimary = settings?.colorPrimary || '#450a0a';
        config.colorAccent = settings?.colorAccent || '#ef4444';
        config.flagEmoji = '🏰';
        break;
      case 'argentina':
        config.colorPrimary = settings?.colorPrimary || '#1e3a8a';
        config.colorAccent = settings?.colorAccent || '#60a5fa';
        config.flagEmoji = '🧉';
        break;
      default:
        break;
    }
    
    return config;
  }

  private getDestinationImage(destination: string = ''): string {
    const dest = destination.toLowerCase().trim();
    const mapping: Record<string, string> = {
      'maragogi': 'https://images.unsplash.com/photo-1590402444811-bfee29d1df67?auto=format&fit=crop&w=1200&h=600&q=80',
      'brasil': 'https://images.unsplash.com/photo-1518151841381-f62f928e4695?auto=format&fit=crop&w=1200&h=600&q=80',
      'buzios': 'https://images.unsplash.com/photo-1589394815804-964ed9be2eb5?auto=format&fit=crop&w=1200&h=600&q=80',
      'cancun': 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&h=600&q=80',
      'disney': 'https://images.unsplash.com/photo-1505843490701-5be5d2b332c1?auto=format&fit=crop&w=1200&h=600&q=80',
      'bariloche': 'https://images.unsplash.com/photo-1601773003221-a3f2b9666c0d?auto=format&fit=crop&w=1200&h=600&q=80',
      'iguazu': 'https://images.unsplash.com/photo-1536704689258-a53ec6e2e96d?auto=format&fit=crop&w=1200&h=600&q=80',
      'punta cana': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&h=600&q=80',
      'calafate': 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=1200&h=600&q=80',
      'mendoza': 'https://images.unsplash.com/photo-1557008075-7f2c5efa4cfd?auto=format&fit=crop&w=1200&h=600&q=80',
      'jamaica': 'https://images.unsplash.com/photo-1557456170-0cf4f4d0d362?auto=format&fit=crop&w=1200&h=600&q=80',
      'miami': 'https://images.unsplash.com/photo-1514364179612-429a1bd14da2?auto=format&fit=crop&w=1200&h=600&q=80',
      'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&h=600&q=80',
      'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&h=600&q=80',
      'roma': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&h=600&q=80',
      'londres': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&h=600&q=80',
      'nueva york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&h=600&q=80',
    };

    for (const key in mapping) {
      if (dest.includes(key)) return mapping[key];
    }

    const fallbackImages = [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&h=600&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&h=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&h=600&q=80'
    ];
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }

  private generateStoryFlyerHtml(data: ExtractedFlyerData | any, options: FlyerRenderOptions = {}): string {
    const ag = this.getAgencyConfig(data.category, options.agencySettings);
    const summarizedDates = this.summarizeDates(data.dates);
    let heroImages = options.heroImages && options.heroImages.length > 0 ? options.heroImages : [this.getDestinationImage(data.destination)];
    const itemImages = options.itemImages || {};
    const packages = (data.packages || []).filter((pkg: any) => pkg.showInFlyer !== false).slice(0, 4);

    const airplaneSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>`;
    const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const mapSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const fireSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;

    let minPrice = Infinity;
    let minCurrency = "USD";
    packages.forEach((pkg: any) => {
      if (pkg.prices) {
        pkg.prices.forEach((p: any) => {
          if (!p.amount) return;
          const amt = parseFloat(p.amount.toString().replace(/[^0-9.]/g, ''));
          if (!isNaN(amt) && amt < minPrice) {
            minPrice = amt;
            minCurrency = p.currency || "USD";
          }
        });
      }
    });
    const minPriceStr = minPrice === Infinity ? "CONSULTAR" : `${minCurrency} ${minPrice}`;

    return `<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Poppins:wght@400;600;700;800&display=swap');
  
  .flyer-canvas, .flyer-canvas * { margin: 0; padding: 0; box-sizing: border-box; }
  
  .flyer-canvas {
    font-family: 'Poppins', sans-serif;
    width: 1080px;
    height: 1920px;
    background: #000;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .bg-img {
    position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;
  }
  .gradient-overlay-bottom {
    position: absolute; width: 100%; height: 100%; top: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,1) 100%);
    z-index: 2;
  }

  .header-ui {
    position: absolute; top: 60px; left: 0; right: 0; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
  }
  .logo { max-height: 250px; max-width: 700px; object-fit: contain; filter: drop-shadow(0 6px 15px rgba(0,0,0,0.4)) brightness(0) invert(1); margin-bottom: 35px; transform: scale(1.5); transform-origin: center top; }
  .pills-row { display: flex; gap: 20px; margin-bottom: 30px; }
  .pill { display: flex; align-items: center; gap: 10px; padding: 12px 30px; border-radius: 100px; font-weight: 800; font-size: 20px; letter-spacing: 1px; }
  .pill.dark { background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); color: white; border: 1px solid rgba(255,255,255,0.2); }
  .pill.orange { background: ${ag.colorAccent}; color: white; box-shadow: 0 4px 20px rgba(234,88,12,0.4); }
  .pill svg { width: 24px; height: 24px; }

  .hero-title { font-family: 'Montserrat', sans-serif; font-size: 150px; font-weight: 900; color: white; text-transform: uppercase; text-shadow: 0 10px 40px rgba(0,0,0,0.8); line-height: 1; margin-bottom: 10px; text-align: center; letter-spacing: -2px; }
  .hero-subtitle { font-size: 32px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 4px 15px rgba(0,0,0,0.8); margin-bottom: 35px; }
  .hero-price-btn { 
    background: ${ag.colorAccent}; color: white; font-size: 30px; font-weight: 900; 
    padding: 22px 60px; border-radius: 100px; box-shadow: 0 15px 40px rgba(0,0,0,0.5); 
    letter-spacing: 2px; border: 2px solid rgba(255,255,255,0.2);
  }

  .glass-container {
    position: absolute; top: 900px; left: 60px; right: 60px;
    background: rgba(30,41,59,0.75); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 50px;
    padding: 20px 0; z-index: 10;
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
  }
  .hotel-row {
    display: flex; align-items: center; padding: 20px 45px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .hotel-row:last-child { border-bottom: none; }
  .hotel-circle { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid rgba(255,255,255,0.2); flex-shrink: 0; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
  .hotel-info { flex-grow: 1; margin: 0 35px; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .hotel-name { 
    font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 800; color: white; 
    line-height: 1.1; margin-bottom: 2px; white-space: normal; word-break: break-word;
    display: block;
  }
  .hotel-sub { font-size: 18px; font-weight: 600; color: #cbd5e1; display: block; margin-bottom: 6px; }
  .hotel-location { font-size: 22px; font-weight: 800; color: ${ag.colorAccent}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  
  .hotel-price-container { display: flex; gap: 25px; align-items: center; flex-shrink: 0; }
  .price-item { display: flex; flex-direction: column; align-items: flex-end; }
  .price-type { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 2px; }
  .price-val { display: flex; align-items: baseline; gap: 4px; }
  .price-item .currency { font-size: 16px; font-weight: 800; color: #cbd5e1; }
  .price-item .amount { font-size: 40px; font-weight: 900; color: ${ag.colorAccent}; text-shadow: 0 4px 15px rgba(0,0,0,0.5); line-height: 1; }

  .footer-ui {
    position: absolute; bottom: 60px; left: 0; right: 0; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
  }
  .inclusions-title { font-size: 20px; font-weight: 800; color: white; margin-bottom: 25px; letter-spacing: 2px; text-transform: uppercase; }
  .inclusions-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; max-width: 950px; }
  .inc-pill { 
    display: flex; align-items: center; gap: 12px; 
    background: rgba(0,0,0,0.6); padding: 15px 30px; border-radius: 100px; 
    border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    font-size: 22px; font-weight: 700; color: white; 
  }
  .inc-pill svg { width: 28px; height: 28px; color: ${ag.colorAccent}; }
</style>

<div class="flyer-canvas">
  <img class="bg-img" src="${heroImages[0]}" crossorigin="anonymous" />
  <div class="gradient-overlay-bottom"></div>

  <!-- HEADER -->
  <div class="header-ui">
    ${ag.logoFullUrl 
      ? `<img class="logo" src="${ag.logoFullUrl}" crossorigin="anonymous" />`
      : `<div style="font-size: 60px; font-weight: 900; color: white; margin-bottom: 40px; text-transform: uppercase;">${ag.name}</div>`
    }
    
    <div class="pills-row">
      <div class="pill dark">
        ${mapSvg}
        <span>${data.destination?.substring(0, 20) || 'DESTINO'}</span>
      </div>
      <div class="pill orange">
        ${fireSvg}
        <span>OFERTA</span>
      </div>
    </div>

    <div class="hero-title">${data.destination?.substring(0, 30) || 'VIAJE INCREÍBLE'}</div>
    <div class="hero-subtitle">
      ${data.duration ? `${data.duration} • ` : ''}${summarizedDates || 'SALIDA A CONFIRMAR'}
    </div>
    
    <div class="hero-price-btn">
      TARIFAS DESDE ${minPriceStr}
    </div>
  </div>

  <!-- BODY: HOTELS LIST -->
  ${packages.length > 0 ? `
    <div class="glass-container">
      ${packages.map((pkg: any) => {
        const imageUrl = itemImages[pkg.hotelName] || pkg.googlePhoto;
        return `
          <div class="hotel-row">
             <img class="hotel-circle" src="${imageUrl || 'https://placehold.co/150x150/1e293b/cbd5e1'}" crossorigin="anonymous" />
             <div class="hotel-info">
                <div class="hotel-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${pkg.subDestination || this.extractSubDestination(pkg.hotelName) || data.destination || 'Brasil'}
                </div>
                <div class="hotel-name">${pkg.hotelName}</div>
                <div class="hotel-sub">${pkg.boardBasis || 'All Inclusive'}</div>
             </div>
             <div class="hotel-price-container">
                ${(pkg.prices || []).slice(0, 2).map((p: any) => `
                  <div class="price-item">
                    <span class="price-type">${p.type || 'TARIFA'}</span>
                    <div class="price-val">
                      <span class="currency">${p.currency || 'USD'}</span>
                      <span class="amount">${p.amount}</span>
                    </div>
                  </div>
                `).join('')}
                ${(pkg.prices || []).length === 0 ? `
                  <div class="price-item">
                    <span class="price-type">Por Persona</span>
                    <span class="amount" style="font-size: 30px;">Consultar</span>
                  </div>
                ` : ''}
             </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="footer-ui">
     <div class="inclusions-title">INCLUYE</div>
     <div class="inclusions-row">
        <div class="inc-pill">${checkSvg} Aéreo</div>
        <div class="inc-pill">${checkSvg} Carry On</div>
        <div class="inc-pill">${checkSvg} Traslados</div>
        <div class="inc-pill">${checkSvg} Hotelería</div>
     </div>
  </div>
</div>`;
  }

  private summarizeDates(datesStr: string): string {
    if (!datesStr) return '';
    const dates = datesStr.split(',').map(d => d.trim()).filter(Boolean);
    if (dates.length <= 3) return datesStr;

    const first = dates[0];
    const last = dates[dates.length - 1];
    
    return `Salidas entre ${first} y ${last}`;
  }

  async generateFlyerHtml(data: ExtractedFlyerData | any, options: FlyerRenderOptions = {}): Promise<string> {
    if ((options.format || "post") === "story") {
      return this.generateStoryFlyerHtml(data, options);
    }

    const ag = this.getAgencyConfig(data.category, options.agencySettings);
    const summarizedDates = this.summarizeDates(data.dates);
    
    let heroImages = options.heroImages && options.heroImages.length > 0 
      ? options.heroImages 
      : [this.getDestinationImage(data.destination)];
    const itemImages = options.itemImages || {};
    const packages = (data.packages || []).filter((pkg: any) => pkg.showInFlyer !== false).slice(0, 4);

    const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const mapSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const fireSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;

    let minPrice = Infinity;
    let minCurrency = "USD";
    packages.forEach((pkg: any) => {
      if (pkg.prices) {
        pkg.prices.forEach((p: any) => {
          if (!p.amount) return;
          const amt = parseFloat(p.amount.toString().replace(/[^0-9.]/g, ''));
          if (!isNaN(amt) && amt < minPrice) {
            minPrice = amt;
            minCurrency = p.currency || "USD";
          }
        });
      }
    });
    const minPriceStr = minPrice === Infinity ? "CONSULTAR" : `${minCurrency} ${minPrice}`;

    return `<style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Poppins:wght@400;600;700;800&display=swap');
  
  .flyer-canvas, .flyer-canvas * { margin: 0; padding: 0; box-sizing: border-box; }
  
  .flyer-canvas {
    font-family: 'Poppins', sans-serif;
    width: 1080px;
    height: 1350px;
    background: #000;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .bg-img {
    position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;
  }
  .gradient-overlay-bottom {
    position: absolute; width: 100%; height: 100%; top: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,1) 100%);
    z-index: 2;
  }

  .header-ui {
    position: absolute; top: 40px; left: 0; right: 0; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
  }
  .logo { max-height: 200px; max-width: 600px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)) brightness(0) invert(1); margin-bottom: 30px; transform: scale(1.4); transform-origin: center top; }
  .pills-row { display: flex; gap: 20px; margin-bottom: 20px; }
  .pill { display: flex; align-items: center; gap: 10px; padding: 10px 24px; border-radius: 100px; font-weight: 800; font-size: 16px; letter-spacing: 1px; }
  .pill.dark { background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); color: white; border: 1px solid rgba(255,255,255,0.2); }
  .pill.orange { background: ${ag.colorAccent}; color: white; box-shadow: 0 4px 15px rgba(234,88,12,0.4); }
  .pill svg { width: 20px; height: 20px; }

  .hero-title { font-family: 'Montserrat', sans-serif; font-size: 110px; font-weight: 900; color: white; text-transform: uppercase; text-shadow: 0 10px 30px rgba(0,0,0,0.8); line-height: 1; margin-bottom: 10px; text-align: center; letter-spacing: -2px; }
  .hero-subtitle { font-size: 26px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 4px 10px rgba(0,0,0,0.8); margin-bottom: 20px; }
  .hero-price-btn { 
    background: ${ag.colorAccent}; color: white; font-size: 24px; font-weight: 900; 
    padding: 16px 45px; border-radius: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
    letter-spacing: 2px; border: 2px solid rgba(255,255,255,0.2);
  }

  .glass-container {
    position: absolute; top: 635px; left: 50px; right: 50px;
    background: rgba(30,41,59,0.75); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 35px;
    padding: 15px 0; z-index: 10;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  }
  .hotel-row {
    display: flex; align-items: center; padding: 15px 35px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .hotel-row:last-child { border-bottom: none; }
  .hotel-circle { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.2); flex-shrink: 0; box-shadow: 0 8px 15px rgba(0,0,0,0.3); }
  .hotel-info { flex-grow: 1; margin: 0 30px; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .hotel-name { 
    font-family: 'Montserrat', sans-serif; font-size: 26px; font-weight: 800; color: white; 
    line-height: 1.1; margin-bottom: 2px; white-space: normal; word-break: break-word;
    display: block;
  }
  .hotel-sub { font-size: 16px; font-weight: 600; color: #cbd5e1; display: block; }
  .hotel-location { font-size: 18px; font-weight: 800; color: ${ag.colorAccent}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; display: flex; align-items: center; gap: 4px; }
  
  .hotel-price-container { display: flex; gap: 20px; align-items: center; flex-shrink: 0; }
  .price-item { display: flex; flex-direction: column; align-items: flex-end; }
  .price-type { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 2px; }
  .price-val { display: flex; align-items: baseline; gap: 4px; }
  .price-item .currency { font-size: 14px; font-weight: 800; color: #cbd5e1; }
  .price-item .amount { font-size: 32px; font-weight: 900; color: ${ag.colorAccent}; text-shadow: 0 4px 10px rgba(0,0,0,0.5); line-height: 1; }

  .footer-ui {
    position: absolute; bottom: 35px; left: 0; right: 0; z-index: 10;
    display: flex; flex-direction: column; align-items: center;
  }
  .inclusions-title { font-size: 16px; font-weight: 800; color: white; margin-bottom: 15px; letter-spacing: 2px; text-transform: uppercase; }
  .inclusions-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; max-width: 950px; }
  .inc-pill { 
    display: flex; align-items: center; gap: 8px; 
    background: rgba(0,0,0,0.6); padding: 10px 24px; border-radius: 100px; 
    border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);
    font-size: 18px; font-weight: 700; color: white; 
  }
  .inc-pill svg { width: 22px; height: 22px; color: ${ag.colorAccent}; }
</style>

<div class="flyer-canvas">
  <img class="bg-img" src="${heroImages[0]}" crossorigin="anonymous" />
  <div class="gradient-overlay-bottom"></div>

  <!-- HEADER -->
  <div class="header-ui">
    ${ag.logoFullUrl 
      ? `<img class="logo" src="${ag.logoFullUrl}" crossorigin="anonymous" />`
      : `<div style="font-size: 45px; font-weight: 900; color: white; margin-bottom: 25px; text-transform: uppercase;">${ag.name}</div>`
    }
    
    <div class="pills-row">
      <div class="pill dark">
        ${mapSvg}
        <span>${data.destination?.substring(0, 20) || 'DESTINO'}</span>
      </div>
      <div class="pill orange">
        ${fireSvg}
        <span>OFERTA</span>
      </div>
    </div>

    <div class="hero-title">${data.destination?.substring(0, 30) || 'VIAJE INCREÍBLE'}</div>
    <div class="hero-subtitle">
      ${data.duration ? `${data.duration} • ` : ''}${summarizedDates || 'SALIDA A CONFIRMAR'}
    </div>
    
    <div class="hero-price-btn">
      TARIFAS DESDE ${minPriceStr}
    </div>
  </div>

  <!-- BODY: HOTELS LIST -->
  ${packages.length > 0 ? `
    <div class="glass-container">
      ${packages.map((pkg: any) => {
        const imageUrl = itemImages[pkg.hotelName] || pkg.googlePhoto;
        return `
          <div class="hotel-row">
             <img class="hotel-circle" src="${imageUrl || 'https://placehold.co/150x150/1e293b/cbd5e1'}" crossorigin="anonymous" />
             <div class="hotel-info">
                <div class="hotel-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${pkg.subDestination || this.extractSubDestination(pkg.hotelName) || data.destination || 'Brasil'}
                </div>
                <div class="hotel-name">${pkg.hotelName}</div>
                <div class="hotel-sub">${pkg.boardBasis || 'All Inclusive'}</div>
             </div>
             <div class="hotel-price-container">
                ${(pkg.prices || []).slice(0, 2).map((p: any) => `
                  <div class="price-item">
                    <span class="price-type">${p.type || 'TARIFA'}</span>
                    <div class="price-val">
                      <span class="currency">${p.currency || 'USD'}</span>
                      <span class="amount">${p.amount}</span>
                    </div>
                  </div>
                `).join('')}
                ${(pkg.prices || []).length === 0 ? `
                  <div class="price-item">
                    <span class="price-type">Por Persona</span>
                    <span class="amount" style="font-size: 24px;">Consultar</span>
                  </div>
                ` : ''}
             </div>
          </div>
        `;
      }).join('')}
    </div>
  ` : ''}

  <!-- FOOTER -->
  <div class="footer-ui">
     <div class="inclusions-title">INCLUYE</div>
     <div class="inclusions-row">
        <div class="inc-pill">${checkSvg} Aéreo</div>
        <div class="inc-pill">${checkSvg} Carry On</div>
        <div class="inc-pill">${checkSvg} Traslados</div>
        <div class="inc-pill">${checkSvg} Hotelería</div>
     </div>
  </div>
</div>`;
  }
  
  private extractSubDestination(hotelName: string): string | null {
    if (!hotelName) return null;
    const lower = hotelName.toLowerCase();
    
    // Brasil
    if (lower.includes('porto de galinhas')) return 'Porto de Galinhas';
    if (lower.includes('maragogi')) return 'Maragogi';
    if (lower.includes('cabo de santo agostinho') || lower.includes('resort cabo')) return 'Cabo de Santo Agostinho';
    if (lower.includes('muro alto') || lower.includes('porto alto')) return 'Muro Alto';
    if (lower.includes('buzios') || lower.includes('búzios')) return 'Búzios';
    if (lower.includes('rio de janeiro')) return 'Rio de Janeiro';
    if (lower.includes('natal')) return 'Natal';
    if (lower.includes('maceio') || lower.includes('maceió')) return 'Maceió';
    if (lower.includes('pipa')) return 'Pipa';
    if (lower.includes('salvador')) return 'Salvador de Bahía';
    if (lower.includes('imbassai') || lower.includes('imbassaí')) return 'Imbassaí';
    if (lower.includes('praia do forte')) return 'Praia do Forte';
    
    // Caribe
    if (lower.includes('punta cana')) return 'Punta Cana';
    if (lower.includes('cancun') || lower.includes('cancún')) return 'Cancún';
    if (lower.includes('playa del carmen')) return 'Playa del Carmen';
    if (lower.includes('bayahibe')) return 'Bayahibe';
    if (lower.includes('tulum')) return 'Tulum';
    if (lower.includes('isla mujeres')) return 'Isla Mujeres';
    
    return null;
  }
}
