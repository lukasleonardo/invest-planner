import { Module } from '@nestjs/common';
import { InvestmentService } from './investment.service';
import { InvestmentController } from './investment.controller';
import { PrismaService } from 'src/prisma-client/prisma-client.service';



@Module({
  controllers: [InvestmentController],
  providers: [InvestmentService,PrismaService],
})
export class InvestmentModule {}
