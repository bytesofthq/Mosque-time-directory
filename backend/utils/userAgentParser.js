/**
 * User-Agent & Request Parsing Utility for Last Login Tracking
 */

const parseUserAgent = (userAgentString = '') => {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';

  const ua = userAgentString;

  // Device Detection
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    device = 'Mobile';
  }

  // OS Detection
  if (/windows nt 10\.0/i.test(ua)) os = 'Windows 10/11';
  else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1';
  else if (/windows nt 6\.2/i.test(ua)) os = 'Windows 8';
  else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser Detection
  if (/edg/i.test(ua)) {
    const match = ua.match(/Edg\/([0-9.]+)/i);
    browser = `Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) {
    const match = ua.match(/(?:Chrome|CriOS)\/([0-9.]+)/i);
    browser = `Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (/firefox|fxios/i.test(ua)) {
    const match = ua.match(/(?:Firefox|FxIOS)\/([0-9.]+)/i);
    browser = `Firefox ${match ? match[1].split('.')[0] : ''}`;
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    const match = ua.match(/Version\/([0-9.]+)/i);
    browser = `Safari ${match ? match[1].split('.')[0] : ''}`;
  } else if (/opera|opr/i.test(ua)) {
    const match = ua.match(/(?:Opera|OPR)\/([0-9.]+)/i);
    browser = `Opera ${match ? match[1].split('.')[0] : ''}`;
  }

  return { browser, os, device };
};

const extractClientIp = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req?.ip || req?.socket?.remoteAddress || '127.0.0.1';
};

const generateLastLoginData = (req) => {
  const now = new Date();
  const userAgent = req?.headers?.['user-agent'] || '';
  const { browser, os, device } = parseUserAgent(userAgent);
  const ipAddress = extractClientIp(req);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const day = days[now.getDay()];
  const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours.toString().padStart(2, '0');
  const time = `${formattedHours}:${minutes} ${ampm}`;

  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    timezone = 'UTC';
  }

  return {
    timestamp: now,
    date,
    time,
    day,
    timezone,
    ipAddress,
    device,
    browser,
    os
  };
};

module.exports = {
  parseUserAgent,
  extractClientIp,
  generateLastLoginData
};
