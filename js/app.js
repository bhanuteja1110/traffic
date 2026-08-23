(function() {
  'use strict';
  
  // Fallbacks if data.js is delayed or incomplete.
  const FALLBACK_DATA = {
    primaryRoute: { normalTime: 30 },
    scenarios: {
      normal: {
        eta: 30, message: "Traffic is flowing smoothly.", delayDetected: false,
        conditions: {
          traffic: { severity: 'low', level: 'clear' },
          construction: { severity: 'low', level: 'none' },
          weather: { severity: 'low', level: 'clear' },
          peakHours: { severity: 'low', level: 'inactive' }
        },
        riskBreakdown: { traffic: 5, construction: 0, weather: 5, peakHours: 5 }
      },
      busy: {
        eta: 41, message: "Traffic is slightly heavier than usual.", delayDetected: true,
        conditions: {
          traffic: { severity: 'medium', level: 'moderate' },
          construction: { severity: 'low', level: 'none' },
          weather: { severity: 'low', level: 'clear' },
          peakHours: { severity: 'medium', level: 'active' }
        },
        riskBreakdown: { traffic: 25, construction: 0, weather: 5, peakHours: 25 }
      },
      disruption: {
        eta: 47, message: "Your usual route looks unusual today.", delayDetected: true,
        conditions: {
          traffic: { severity: 'high', level: 'high' },
          construction: { severity: 'high', level: 'detected' },
          weather: { severity: 'medium', level: 'moderate' },
          peakHours: { severity: 'high', level: 'active' }
        },
        riskBreakdown: { traffic: 25, construction: 30, weather: 10, peakHours: 20 },
        contextDetails: {
          publicEvent: { name: 'Public Event', location: 'City Centre', impact: 'Moderate', recommendation: 'Use alternate route' }
        }
      }
    }
  };

  const App = {
    currentScreen: 'splash-screen',
    currentScenario: 'disruption',
    history: [],
    
    init() {
      this.setupEventListeners();
      this.showSplash();
      this.setDemoScenario(this.currentScenario);
    },
    
    setupEventListeners() {
      // Back buttons
      document.querySelectorAll('.back-btn[data-back]').forEach(btn => {
        btn.addEventListener('click', () => this.goBack());
      });
      
      // Bottom Nav tabs
      document.querySelectorAll('.nav-item').forEach(navBtn => {
        navBtn.addEventListener('click', (e) => {
          document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          const btn = e.currentTarget;
          btn.classList.add('active');
          const targetScreen = btn.dataset.screen;
          this.history = []; // Clear history stack on top-level nav
          this.navigateTo(targetScreen, false);
        });
      });
      
      // Demo Control
      const demoToggleBtn = document.getElementById('demo-toggle-btn');
      const demoOptions = document.getElementById('demo-options');
      if (demoToggleBtn) {
        demoToggleBtn.addEventListener('click', () => {
          demoOptions.classList.toggle('active');
        });
      }
      
      document.querySelectorAll('.demo-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.demo-option').forEach(n => n.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.setDemoScenario(e.currentTarget.dataset.scenario);
        });
      });
      
      // Screen Navigations
      const btnViewAnalysis = document.getElementById('view-analysis-btn');
      if (btnViewAnalysis) btnViewAnalysis.addEventListener('click', () => this.navigateTo('analysis-screen'));
      
      const btnViewRoutes = document.getElementById('view-routes-btn');
      if (btnViewRoutes) btnViewRoutes.addEventListener('click', () => this.navigateTo('route-options-screen'));
      
      const btnAnalysisViewRoutes = document.getElementById('analysis-view-routes-btn');
      if (btnAnalysisViewRoutes) btnAnalysisViewRoutes.addEventListener('click', () => this.navigateTo('route-options-screen'));
      
      const btnUseRouteB = document.getElementById('use-route-b-btn');
      if (btnUseRouteB) btnUseRouteB.addEventListener('click', () => this.navigateTo('navigation-screen'));
      
      const btnEndTrip = document.getElementById('end-trip-btn');
      if (btnEndTrip) btnEndTrip.addEventListener('click', () => this.navigateTo('trip-complete-screen'));
      
      const btnSaveTrip = document.getElementById('save-trip-btn');
      if (btnSaveTrip) btnSaveTrip.addEventListener('click', () => this.saveTrip());
      
      const btnLeaveEarlier = document.getElementById('leave-earlier-btn');
      if (btnLeaveEarlier) btnLeaveEarlier.addEventListener('click', () => this.showToast('Alarm set for 7:40 AM'));
      
      // Modal Actions
      const btnAddRoute = document.getElementById('add-route-btn');
      if (btnAddRoute) btnAddRoute.addEventListener('click', () => this.showModal());
      
      const btnModalClose = document.getElementById('modal-close-btn');
      if (btnModalClose) btnModalClose.addEventListener('click', () => this.hideModal());
      
      const btnSaveRoute = document.getElementById('save-route-btn');
      if (btnSaveRoute) btnSaveRoute.addEventListener('click', () => this.saveRoute());
      
      // Close modal on overlay click
      const modalOverlay = document.getElementById('add-route-modal');
      if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) this.hideModal();
        });
      }
    },
    
    showSplash() {
      setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
          splash.classList.add('splash-fade-out');
          setTimeout(() => {
            this.navigateTo('dashboard-screen', false);
          }, 500); // Wait for fade out
        }
      }, 2500);
    },
    
    navigateTo(screenId, addToHistory = true) {
      if (this.currentScreen === screenId) return;
      
      if (addToHistory && this.currentScreen !== 'splash-screen') {
        this.history.push(this.currentScreen);
      }
      
      const current = document.getElementById(this.currentScreen);
      const target = document.getElementById(screenId);
      
      if (current) current.classList.remove('active');
      if (target) target.classList.add('active');
      
      this.currentScreen = screenId;
      
      // Manage Bottom Nav visibility
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) {
        if (screenId === 'navigation-screen' || screenId === 'trip-complete-screen' || screenId === 'splash-screen') {
          bottomNav.classList.add('hidden');
        } else {
          bottomNav.classList.remove('hidden');
        }
      }
    },
    
    goBack() {
      if (this.history.length > 0) {
        const prevScreen = this.history.pop();
        this.navigateTo(prevScreen, false);
      }
    },
    
    setDemoScenario(scenario) {
      this.currentScenario = scenario;
      
      const smartData = window.SmartRouteData || FALLBACK_DATA;
      const scenarioData = smartData.scenarios[scenario] || FALLBACK_DATA.scenarios[scenario];
      
      if (!scenarioData) return;
      
      this.updateDashboard(scenarioData, smartData);
      this.updateAnalysis(scenarioData, smartData);
      this.updateRouteOptions(scenarioData);
      this.updateRiskScore(scenario, scenarioData);
    },
    
    updateDashboard(scenarioData, smartData) {
      const normalTime = smartData.primaryRoute.normalTime;
      
      const elNormal = document.getElementById('normal-time');
      const elToday = document.getElementById('today-time');
      if (elNormal) elNormal.textContent = normalTime + ' min';
      if (elToday) {
        elToday.textContent = scenarioData.eta + ' min';
        elToday.style.color = scenarioData.eta > normalTime ? 'var(--danger)' : 'var(--success)';
      }

      const delay = Math.max(0, scenarioData.eta - normalTime);
      const delayBadge = document.getElementById('delay-badge');
      if (delayBadge) {
        if (delay > 0) {
          delayBadge.textContent = `+${delay} min slower than usual`;
          delayBadge.style.display = 'block';
        } else {
          delayBadge.style.display = 'none';
        }
      }

      const delayMessage = document.getElementById('delay-message');
      if (delayMessage) {
        delayMessage.textContent = scenarioData.message;
      }

      if (scenarioData.conditions) {
        this.updateConditions(scenarioData.conditions);
      }

      this.updateRecommendation(scenarioData);
    },
    
    updateConditions(conditions) {
      const updateCard = (elementId, conditionData) => {
        if (!conditionData) return;
        const card = document.getElementById(elementId);
        if (card) {
          card.className = 'condition-card severity-' + conditionData.severity;
          const levelEl = card.querySelector('.condition-level');
          if (levelEl) {
            levelEl.textContent = conditionData.level.toUpperCase();
            if (conditionData.severity === 'high') {
              levelEl.style.color = 'var(--danger)';
            } else if (conditionData.severity === 'medium') {
              levelEl.style.color = 'var(--warning)';
            } else {
              levelEl.style.color = 'var(--success)';
            }
          }
        }
      };
      
      updateCard('cond-traffic', conditions.traffic);
      updateCard('cond-construction', conditions.construction);
      updateCard('cond-weather', conditions.weather);
      updateCard('cond-peak', conditions.peakHours);
    },
    
    updateRecommendation(scenarioData) {
      const recCard = document.getElementById('recommendation-card');
      if (!recCard) return;
      
      if (scenarioData.delayDetected || scenarioData.eta > 39) {
        recCard.style.display = 'block';
        const expected = document.getElementById('rec-expected');
        if (expected) expected.textContent = scenarioData.eta + ' min';
      } else {
        recCard.style.display = 'none';
      }
    },
    
    updateAnalysis(scenarioData, smartData) {
      const normalTime = smartData.primaryRoute.normalTime;
      const threshold = 39; 
      
      const todayValue = document.getElementById('today-value');
      if (todayValue) todayValue.textContent = scenarioData.eta + ' min';
      
      const thresholdValue = document.getElementById('threshold-value');
      if (thresholdValue) thresholdValue.textContent = threshold + ' min';
      
      const barToday = document.getElementById('bar-today');
      if (barToday) {
        if (scenarioData.eta <= normalTime) {
          barToday.style.width = '0%';
        } else {
          const excess = scenarioData.eta - normalTime;
          barToday.style.width = (excess * 2) + '%';
          barToday.style.background = scenarioData.eta >= threshold ? 'var(--danger)' : 'var(--warning)';
        }
      }
      
      const delayResult = document.getElementById('delay-result');
      if (delayResult) {
        if (scenarioData.eta > threshold) {
          delayResult.innerHTML = `<span class="delay-formula">${scenarioData.eta} > ${threshold}</span><span class="delay-verdict" style="color:var(--danger);">Delay Detected</span>`;
        } else {
          delayResult.innerHTML = `<span class="delay-formula">${scenarioData.eta} < ${threshold}</span><span class="delay-verdict" style="color:var(--success);">No Significant Delay</span>`;
        }
      }
      
      const toggleContext = (id, condition) => {
        const el = document.getElementById(id);
        if (el) {
          if (condition && condition.severity !== 'low') {
            el.style.display = 'block';
            const badge = el.querySelector('.badge');
            if (badge) {
              badge.textContent = condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1);
              badge.className = `badge badge-${condition.severity}`;
            }
          } else {
            el.style.display = 'none';
          }
        }
      };
      
      if (scenarioData.conditions) {
        toggleContext('ctx-traffic', scenarioData.conditions.traffic);
        toggleContext('ctx-construction', scenarioData.conditions.construction);
        toggleContext('ctx-weather', scenarioData.conditions.weather);
        toggleContext('ctx-peak', scenarioData.conditions.peakHours);
      }

      // Handle optional event card
      const eventCard = document.getElementById('ctx-event');
      if (eventCard) {
        if (scenarioData.contextDetails && scenarioData.contextDetails.publicEvent) {
          eventCard.style.display = 'block';
        } else {
          eventCard.style.display = 'none';
        }
      }
    },
    
    updateRouteOptions(scenarioData) {
      const routeATime = document.getElementById('routeA-time');
      if (routeATime) routeATime.textContent = scenarioData.eta + ' min';
      
      const savedVal = document.getElementById('time-saved-value');
      if (savedVal) {
        const saved = scenarioData.eta - 34; // 34 is hardcoded recommended route time
        savedVal.textContent = saved > 0 ? saved : 0;
      }
    },
    
    updateRiskScore(scenario, scenarioData) {
      const scoreEl = document.getElementById('risk-score');
      const badgeEl = document.getElementById('risk-level-badge');
      
      let score = scenarioData.riskScore || 15;
      let breakdown = scenarioData.riskBreakdown || { traffic: 5, construction: 0, weather: 5, peakHours: 5 };
      
      if (scoreEl) scoreEl.textContent = score;
      if (badgeEl) {
        if (score >= 70) {
          badgeEl.textContent = 'HIGH RISK';
          badgeEl.className = 'badge badge-high';
        } else if (score >= 40) {
          badgeEl.textContent = 'MEDIUM RISK';
          badgeEl.className = 'badge badge-medium';
        } else {
          badgeEl.textContent = 'LOW RISK';
          badgeEl.className = 'badge badge-low';
        }
      }
      
      const breakdownEl = document.getElementById('risk-breakdown');
      if (breakdownEl) {
        breakdownEl.innerHTML = `
          <div class="risk-breakdown-item">
            <span class="risk-factor-name" style="width:80px; text-align:left;">Traffic</span>
            <div class="risk-bar"><div class="risk-bar-fill" style="width:${breakdown.traffic}%; background:var(--danger);"></div></div>
            <span class="risk-factor-value" style="width:30px; text-align:right;">+${breakdown.traffic}</span>
          </div>
          <div class="risk-breakdown-item">
            <span class="risk-factor-name" style="width:80px; text-align:left;">Construction</span>
            <div class="risk-bar"><div class="risk-bar-fill" style="width:${breakdown.construction}%; background:var(--danger);"></div></div>
            <span class="risk-factor-value" style="width:30px; text-align:right;">+${breakdown.construction}</span>
          </div>
          <div class="risk-breakdown-item">
            <span class="risk-factor-name" style="width:80px; text-align:left;">Weather</span>
            <div class="risk-bar"><div class="risk-bar-fill" style="width:${breakdown.weather}%; background:var(--warning);"></div></div>
            <span class="risk-factor-value" style="width:30px; text-align:right;">+${breakdown.weather}</span>
          </div>
          <div class="risk-breakdown-item">
            <span class="risk-factor-name" style="width:80px; text-align:left;">Peak Hours</span>
            <div class="risk-bar"><div class="risk-bar-fill" style="width:${breakdown.peakHours}%; background:var(--accent-primary);"></div></div>
            <span class="risk-factor-value" style="width:30px; text-align:right;">+${breakdown.peakHours}</span>
          </div>
        `;
      }
    },
    
    showModal() {
      const modal = document.getElementById('add-route-modal');
      if (modal) modal.classList.add('active');
    },
    
    hideModal() {
      const modal = document.getElementById('add-route-modal');
      if (modal) {
        modal.querySelectorAll('input').forEach(i => i.value = '');
        modal.classList.remove('active');
      }
    },
    
    saveRoute() {
      const from = document.getElementById('route-from')?.value;
      const to = document.getElementById('route-to')?.value;
      if (from && to) {
        this.showToast('Route added!');
        this.hideModal();
      } else {
        this.showToast('Please fill all fields');
      }
    },
    
    saveTrip() {
      this.showToast('Trip saved!');
      setTimeout(() => {
        this.history = [];
        this.navigateTo('dashboard-screen', false);
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const homeNav = document.querySelector('.nav-item[data-tab="home"]');
        if (homeNav) homeNav.classList.add('active');
      }, 1000);
    },
    
    showToast(message) {
      const existing = document.querySelector('.toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.getElementById('app').appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  };
  
  document.addEventListener('DOMContentLoaded', () => App.init());
  window.SmartRouteApp = App;
})();
