import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { join } from 'path';

@Injectable()
export class MetricsService {
  constructor() {
    const dbPath = join(process.cwd(), 'metrics.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        method TEXT NOT NULL,
        status_code INTEGER,
        user_agent TEXT,
        ip TEXT,
        referer TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)
    `);
  }

  trackRequest({ path, method, statusCode, userAgent, ip, referer }) {
    const stmt = this.db.prepare(
      'INSERT INTO page_views (path, method, status_code, user_agent, ip, referer) VALUES (?, ?, ?, ?, ?, ?)',
    );
    stmt.run(path, method, statusCode, userAgent || null, ip || null, referer || null);
  }

  getSummary() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM page_views').get();

    const today = this.db.prepare(
      "SELECT COUNT(*) as count FROM page_views WHERE created_at >= date('now')",
    ).get();

    const last7Days = this.db.prepare(
      "SELECT COUNT(*) as count FROM page_views WHERE created_at >= date('now', '-7 days')",
    ).get();

    const last30Days = this.db.prepare(
      "SELECT COUNT(*) as count FROM page_views WHERE created_at >= date('now', '-30 days')",
    ).get();

    return {
      total: total.count,
      today: today.count,
      last7Days: last7Days.count,
      last30Days: last30Days.count,
    };
  }

  getTopRoutes(limit = 20) {
    return this.db.prepare(
      'SELECT path, COUNT(*) as hits FROM page_views GROUP BY path ORDER BY hits DESC LIMIT ?',
    ).all(limit);
  }

  getDailyVisits(days = 30) {
    return this.db.prepare(
      `SELECT date(created_at) as date, COUNT(*) as visits
       FROM page_views
       WHERE created_at >= date('now', '-' || ? || ' days')
       GROUP BY date(created_at)
       ORDER BY date ASC`,
    ).all(days);
  }

  getHourlyDistribution() {
    return this.db.prepare(
      `SELECT cast(strftime('%H', created_at) as INTEGER) as hour, COUNT(*) as visits
       FROM page_views
       WHERE created_at >= date('now', '-7 days')
       GROUP BY hour
       ORDER BY hour ASC`,
    ).all();
  }

  getDeviceStats() {
    const rows = this.db.prepare(
      `SELECT user_agent, COUNT(*) as count FROM page_views
       WHERE user_agent IS NOT NULL
       GROUP BY user_agent
       ORDER BY count DESC LIMIT 50`,
    ).all();

    const stats = { mobile: 0, desktop: 0, bot: 0, other: 0 };
    for (const row of rows) {
      const ua = (row.user_agent || '').toLowerCase();
      if (/bot|crawler|spider|curl|wget/i.test(ua)) {
        stats.bot += row.count;
      } else if (/mobile|android|iphone|ipad/i.test(ua)) {
        stats.mobile += row.count;
      } else if (/mozilla|chrome|safari|firefox|edge/i.test(ua)) {
        stats.desktop += row.count;
      } else {
        stats.other += row.count;
      }
    }
    return stats;
  }

  getReferers(limit = 20) {
    return this.db.prepare(
      `SELECT referer, COUNT(*) as count FROM page_views
       WHERE referer IS NOT NULL AND referer != ''
       GROUP BY referer
       ORDER BY count DESC LIMIT ?`,
    ).all(limit);
  }

  getRecentRequests(limit = 50) {
    return this.db.prepare(
      'SELECT path, method, status_code, ip, user_agent, created_at FROM page_views ORDER BY id DESC LIMIT ?',
    ).all(limit);
  }
}
