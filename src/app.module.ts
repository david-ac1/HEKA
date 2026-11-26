import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArcjetModule } from './lib/arcjet/arcjet.module';
import { ArcjetMiddleware } from './common/middleware/arcjet.middleware';
import { PrismaModule } from './lib/database/prisma.module';

@Module({
  imports: [ArcjetModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, ArcjetMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ArcjetMiddleware).forRoutes('*');
  }
}
