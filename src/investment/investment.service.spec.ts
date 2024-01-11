import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { PrismaService } from '../prisma-client/prisma-client.service';

import { HttpException, HttpStatus } from '@nestjs/common';
import { Investment as Pinvestment } from '@prisma/client';
import { Investment as InvestmentEntity } from './entities/investment.entity';


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

  xdescribe('Testes referentes a Rota de Criação de investimentos ',()=>{
    it('Deve retornar erro pois o valor é inválido', async ()=>{
      
      let investment = {name:'Amazon', owner:'jeff obesos', amount:0.0 };
      console.log(await investmentService.create(investment))
      expect(await investmentService.create(investment)).toEqual(new HttpException("Valor Inválido", HttpStatus.BAD_REQUEST));
    })
    it('Deve retornar erro pois a data é inválida',async ()=>{
      let investment = {name:'Amazon', owner:'jeff obesos', amount:10.0, createdAt:'2025-09-08T15:25:53Z'};
      expect(await investmentService.create(investment)).toEqual(new HttpException("Data inválida: data do investimento precisa ser igual ou anterior a data atual", HttpStatus.BAD_REQUEST))
    })

    it('Deve retornar objeto criado',async ()=>{
      const mockdata = new Date('2023-09-08T15:25:53.000Z')
      let investment = {name:'Amazon', owner:'jeff obesos', amount:10.0, createdAt:'2023-09-08T15:25:53Z'};
      let resolvedValue = {"amount": 10, "balance": null, "createdAt": mockdata, "id": 7, "lastPaymentDate": null, "name": "Amazon", "owner": "jeff obesos"}
      jest.spyOn(investmentService,'create').mockResolvedValue(resolvedValue)
      const res = await investmentService.create(investment)
      expect(res).toBe(resolvedValue)
    })
  })

  describe('testes da rota de view',()=>{
    it('retorno sem atualização de balanço',async ()=>{
      const mockData = new Date('2023-09-08T15:25:53Z')
      const mockLastData = new Date('2023-10-08T15:25:53Z')
      let investment:Pinvestment = {id:1,name:'Amazon', owner:'jeff obesos', amount:0.0, balance:205.05, createdAt:mockData, lastPaymentDate:mockLastData};
      jest.spyOn(InvestmentService.prototype, 'findOne').mockResolvedValueOnce(investment)
      expect(await investmentService.view(1)).toEqual(investment)
    })

    it('retorno com atualização de balanço',async()=>{
      const mockData = new Date('2023-11-08T15:25:53Z')
      const mockLastData = new Date('2023-12-11T15:25:53Z')
      let investment:Pinvestment = {id:1, name:'Amazon', owner:'jeff obesos', amount:1.0, balance:205.05, createdAt:mockData, lastPaymentDate:mockLastData};
      let attInvestment = {id:1, name:'Amazon', owner:'jeff obesos', amount:1.0, balance:205.05, createdAt:mockData, lastPaymentDate:mockLastData}
      jest.spyOn(InvestmentService.prototype, 'findOne').mockResolvedValueOnce(investment)
      jest.spyOn(InvestmentService.prototype, 'calculateGain').mockResolvedValueOnce(attInvestment)

      const res = await investmentService.view(1)
      expect(res).toEqual(attInvestment)
    })
  })


  xdescribe('testes da função de calculo de balanço',()=>{
    it('retorno sem atualização de balanço',()=>{

    })
    it('retorno com atualização de balanço',()=>{

    })
  })



});
