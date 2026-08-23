(function() {
  window.SmartRouteLogic = {
    THRESHOLD_MULTIPLIER: 1.3,
    calculateThreshold(normalTime) { 
      return Math.round(normalTime * this.THRESHOLD_MULTIPLIER); 
    },
    isDelayDetected(normalTime, currentEta) { 
      return currentEta > this.calculateThreshold(normalTime); 
    },
    getDelay(normalTime, currentEta) { 
      return currentEta - normalTime; 
    },
    getTimeSaved(currentEta, alternateTime) { 
      return currentEta - alternateTime; 
    },
    getArrivalTime(departureHour, departureMinute, travelMinutes) { 
      let d = new Date();
      d.setHours(departureHour, departureMinute + travelMinutes, 0, 0);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    },
    getRiskLevel(score) { 
      if(score >= 70) return 'HIGH'; 
      if(score >= 40) return 'MEDIUM'; 
      return 'LOW'; 
    },
    getRiskColor(level) { 
      switch(level) {
        case 'HIGH': return '#ff4757';
        case 'MEDIUM': return '#ffc312';
        case 'LOW': return '#00c48c';
        default: return '#8892a4';
      } 
    }
  };

  window.SmartRouteData = {
    user: { name: 'Bhanu', greeting: 'Good Morning' },
    currentDay: { day: 'Tuesday', time: '8:00 AM', departureHour: 8, departureMinute: 0 },
    primaryRoute: {
      id: 'home-college',
      from: { name: 'Home', icon: 'home' },
      to: { name: 'College', icon: 'graduation-cap' },
      normalTime: 30,
      distance: '30 km',
      distanceKm: 30,
      days: 'Every weekday',
      departure: '8:00 AM',
      status: 'Monitored'
    },
    secondaryRoute: {
      id: 'home-office',
      from: { name: 'Home', icon: 'home' },
      to: { name: 'Office', icon: 'briefcase' },
      normalTime: 42,
      distance: '38 km',
      distanceKm: 38,
      days: 'Mon–Fri',
      departure: '8:30 AM',
      status: 'Monitored'
    },
    alternateRoute: {
      name: 'Route B',
      label: 'SmartRoute Recommended',
      time: 34,
      distance: '32 km',
      distanceKm: 32,
      benefits: ['Lower traffic', 'No construction']
    },
    scenarios: {
      normal: {
        name: 'Normal Day',
        eta: 30,
        risk: 'LOW',
        riskScore: 15,
        message: 'Your route looks normal today.',
        delayDetected: false,
        conditions: {
          traffic: { level: 'Normal', severity: 'low', description: 'Traffic is flowing smoothly on your route.' },
          construction: { level: 'None', severity: 'low', description: 'No construction reported on your route.' },
          weather: { level: 'Clear', severity: 'low', description: 'Clear weather conditions.' },
          peakHours: { level: 'Off-Peak', severity: 'low', description: 'You are outside peak travel hours.' }
        },
        riskBreakdown: { traffic: 5, construction: 0, weather: 5, peakHours: 5 },
        contextDetails: {
          construction: { detected: false },
          weather: { condition: 'Clear', time: '', impact: 'None', estimatedDelay: '0 min' },
          peakHours: { school: 'Inactive', office: 'Inactive', period: '', departure: '8:00 AM', recommendation: 'No adjustment needed.' },
          publicEvent: null
        }
      },
      busy: {
        name: 'Busy Day',
        eta: 41,
        risk: 'MEDIUM',
        riskScore: 55,
        message: 'Traffic is higher than usual.',
        delayDetected: true,
        conditions: {
          traffic: { level: 'Moderate', severity: 'medium', description: 'Traffic is moderately heavier than your usual pattern.' },
          construction: { level: 'None', severity: 'low', description: 'No construction reported on your route.' },
          weather: { level: 'Clear', severity: 'low', description: 'Clear weather conditions.' },
          peakHours: { level: 'Active', severity: 'medium', description: 'Your departure overlaps with a regular peak period.' }
        },
        riskBreakdown: { traffic: 25, construction: 0, weather: 5, peakHours: 25 },
        contextDetails: {
          construction: { detected: false },
          weather: { condition: 'Clear', time: '', impact: 'None', estimatedDelay: '0 min' },
          peakHours: { school: 'Active', office: 'Active', period: '7:45 AM – 9:15 AM', departure: '8:00 AM', recommendation: 'Leave by 7:45 AM.' },
          publicEvent: null
        }
      },
      disruption: {
        name: 'Disruption Day',
        eta: 47,
        risk: 'HIGH',
        riskScore: 85,
        message: 'Your usual route looks unusual today.',
        delayDetected: true,
        conditions: {
          traffic: { level: 'High', severity: 'high', description: 'Traffic is heavier than your usual pattern.' },
          construction: { level: 'Detected', severity: 'high', description: 'Construction is affecting your regular route.' },
          weather: { level: 'Moderate', severity: 'medium', description: 'Rain conditions may slow travel.' },
          peakHours: { level: 'Active', severity: 'high', description: 'Your departure overlaps with a regular peak period.' }
        },
        riskBreakdown: { traffic: 25, construction: 30, weather: 10, peakHours: 20 },
        contextDetails: {
          construction: { detected: true, location: 'Main Road — 1.2 km ahead', impact: 'High', estimatedDelay: '+10–15 min', recommendation: 'Use Route B.' },
          weather: { condition: 'Rain expected', time: '7:45 AM – 9:00 AM', impact: 'Moderate', estimatedDelay: '+7 min' },
          peakHours: { school: 'Active', office: 'Active', period: '7:45 AM – 9:15 AM', departure: '8:00 AM', recommendation: 'Leave by 7:40 AM.' },
          publicEvent: { name: 'Public Event', location: 'City Centre', impact: 'Moderate', recommendation: 'Use alternate route' }
        }
      }
    },
    tripResult: {
      planned: 30,
      actual: 33,
      timeSaved: 14,
      benefits: ['Alternate route', 'Avoided construction', 'Reduced peak-hour traffic']
    },
    tripStats: { regularRoutes: 2, trips: 24, timeSaved: '2h 18m', alerts: 8 },
    savedLocations: [
      { name: 'Home', icon: 'home' },
      { name: 'College', icon: 'graduation-cap' },
      { name: 'Office', icon: 'briefcase' }
    ],
    previousAlerts: [
      { title: 'Unusual Delay', icon: 'alert-triangle', route: 'Home → College', delay: '+17 min', time: '8:00 AM', type: 'warning', reasons: ['Construction', 'Weather', 'Peak hours'], status: 'Action recommended' },
      { title: 'Route Normal', icon: 'check-circle', route: 'Home → College', time: 'Yesterday', type: 'success', status: 'No action needed' }
    ]
  };
})();
