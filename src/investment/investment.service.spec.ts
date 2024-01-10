import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { PrismaService } from '../prisma-client/prisma-client.service';

import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { error } from 'console';


describe('InvestmentService', () => {
  let investmentService: InvestmentService;
  
  let prismaService:PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [InvestmentService,PrismaService],
    }).compile();

    investmentService = module.get<InvestmentService>(InvestmentService);
    prismaService = module.get<PrismaService>(PrismaService);

  });

  it('should be defined', () => {
    expect(investmentService).toBeDefined();
  });

  describe('Testes referentes a Rota de Criação de investimentos ',()=>{
    it('Deve retornar erro pois o valor é inválido', async ()=>{
      
      let investment = {name:'Amazon', owner:'jeff obesos', amount:0.0 };
      console.log(await investmentService.create(investment))
      expect(await investmentService.create(investment)).toEqual(new HttpException("Valor Inválido", HttpStatus.BAD_REQUEST));
      

    })
    it('Deve retornar erro pois a data é inválida',async ()=>{
      let investment = {name:'Amazon', owner:'jeff obesos', amount:10.0, createdAt:'2025-09-08T15:25:53Z'};
      expect(await investmentService.create(investment)).toEqual(new HttpException("Data inválida: data do investimento precisa ser igual ou anterior a data atual", HttpStatus.BAD_REQUEST))
    })
  })
});
