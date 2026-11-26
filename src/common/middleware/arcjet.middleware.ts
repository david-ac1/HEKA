import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { ArcjetNodeRequest } from '@arcjet/node';
import { ArcjetService } from '../../lib/arcjet/arcjet.service';

@Injectable()
export class ArcjetMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ArcjetMiddleware.name);

  constructor(private readonly arcjetService: ArcjetService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const arcjetReq = req as unknown as ArcjetNodeRequest;
      const decision = await this.arcjetService.protect(arcjetReq);

      if (decision && decision.isDenied()) {
        this.logger.warn(
          `Arcjet denied: ${decision.conclusion} - ${decision.reason}`,
        );
        return res.status(403).json({ error: 'Forbidden' });
      }

      next();
    } catch (error) {
      this.logger.error(
        'Arcjet protection error',
        (error as Error).stack ?? String(error),
      );
      // Fail open — allow the request if Arcjet errors
      next();
    }
  }
}