import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvestmentModule } from './investment/investment.module';
import { PrismaClientService } from './prisma-client/prisma-client.service';

@Module({
  imports: [InvestmentModule],
  controllers: [AppController],
  providers: [AppService, PrismaClientService],
})
export class AppModule {}
