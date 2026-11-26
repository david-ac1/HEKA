import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import arcjet, { shield, detectBot, fixedWindow } from '@arcjet/node';
import type { ArcjetNode, ArcjetDecision, ArcjetNodeRequest } from '@arcjet/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ArcjetService implements OnModuleInit {
  private readonly logger = new Logger(ArcjetService.name);
  private aj: ArcjetNode<Record<string, any>> | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const key = this.configService.get<string>('ARCJET_KEY');
    const mode = this.configService.get<string>('ARCJET_MODE', 'DRY_RUN');

    if (!key || key === 'ARCJET_KEY') {
      this.logger.warn(
        'ARCJET_KEY is not configured. Arcjet protection is disabled.',
      );
      return;
    }

    this.aj = arcjet({
      key,
      rules: [
        // Shield: OWASP/WAF protection (block SQL injection, XSS, etc.)
        shield({ mode: mode as 'LIVE' | 'DRY_RUN' }),

        // Bot detection: block automated clients except search engines
        detectBot({
          mode: mode as 'LIVE' | 'DRY_RUN',
          allow: ['CATEGORY:SEARCH_ENGINE'],
        }),

        // Rate limit: 100 requests per minute per IP
        fixedWindow({
          mode: mode as 'LIVE' | 'DRY_RUN',
          window: '1m',
          max: 100,
          characteristics: ['ip.src'],
        }),
      ],
    });

    this.logger.log(`Arcjet initialized in ${mode} mode`);
  }

  async protect(req: ArcjetNodeRequest): Promise<ArcjetDecision | null> {
    if (!this.aj) return null;
    return this.aj.protect(req);
  }
}