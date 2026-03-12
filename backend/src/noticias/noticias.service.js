import { Injectable } from '@nestjs/common';
import Parser from 'rss-parser';

const RSS_FEEDS = [
  { nombre: 'Ámbito Financiero', url: 'https://www.ambito.com/rss/economia.xml' },
  { nombre: 'El Cronista', url: 'https://www.cronista.com/files/rss/economia-politica.xml' },
  { nombre: 'iProfesional', url: 'https://www.iprofesional.com/rss/economia' },
];

@Injectable()
export class NoticiasService {
  constructor() {
    this.parser = new Parser({
      headers: { 'User-Agent': 'BCRA-Transparencia/1.0' },
      timeout: 10000,
    });
    this.cache = null;
    this.cacheTime = null;
    this.CACHE_TTL = 15 * 60 * 1000; // 15 minutos
  }

  async fetchNoticias() {
    if (this.cache && this.cacheTime && Date.now() - this.cacheTime < this.CACHE_TTL) {
      return this.cache;
    }

    const results = await Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const parsed = await this.parser.parseURL(feed.url);
        return (parsed.items || []).slice(0, 10).map((item) => ({
          titulo: item.title || '',
          link: item.link || '',
          fecha: item.pubDate || item.isoDate || '',
          fuente: feed.nombre,
          descripcion: (item.contentSnippet || item.content || '')
            .replace(/<[^>]*>/g, '')
            .substring(0, 200),
        }));
      }),
    );

    const noticias = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    this.cache = noticias;
    this.cacheTime = Date.now();
    return noticias;
  }
}
