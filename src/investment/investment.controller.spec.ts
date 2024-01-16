import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';

describe('InvestmentController', () => {
  let controller: InvestmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentController],
      providers: [InvestmentService],
    }).compile();

    controller = module.get<InvestmentController>(InvestmentController);
  });

  xit('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
