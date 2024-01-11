import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentService } from './investment.service';
import { PrismaService } from '../prisma-client/prisma-client.service';

import { HttpException, HttpStatus } from '@nestjs/common';
import { Investment as Pinvestment } from '@prisma/client';
import { Investment as InvestmentEntity } from './entities/investment.entity';


describe('InvestmentService', () => {
  let investmentService: InvestmentService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [InvestmentService,PrismaService],
    }).compile();

    investmentService = module.get<InvestmentService>(InvestmentService);   
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

  xdescribe('testes da rota de view',()=>{
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

//Calculate Gain
  xdescribe('casos de teste da função calcular ganho',()=>{
    it('simula calculo do balanço e atualização do valor e data de ultimo pagamento',async()=>{
    
    const investment = {
      id: 1,
      amount: 1000,
      balance: 500,
      createdAt: new Date(2022, 0, 1),
      lastPaymentDate: new Date(2022, 1, 1),
    };

   
    jest.spyOn(InvestmentService.prototype, 'update').mockResolvedValueOnce(
      {    
        id: 1,
        name:'any',
        owner:'any',
        amount: 1000,
        balance: 760, // simulando ganho
        createdAt: new Date(2022, 0, 1),
        lastPaymentDate: new Date(), // simulando atualização da data
    }
    );

    const result = await investmentService.calculateGain(investment);

    expect(result).toEqual({
      id: 1,
      amount: 1000,
      balance: 760,
      createdAt: new Date(2022, 0, 1),
      lastPaymentDate: expect.any(Date),
    });

    jest.restoreAllMocks();
    })


    it('mostra apenas a simulação de proximo pagamento', async()=>{
      
    const investment = {
      id: 1,
      amount: 1000,
      balance: 500,
      createdAt: new Date(2022, 0, 1),
      lastPaymentDate: new Date(2022, 2, 1), 
    };

    const result = await investmentService.calculateGain(investment);

  
    expect(result).toEqual({
      id: 1,
      amount: 1000,
      balance: 760, 
      createdAt: new Date(2022, 0, 1),
      lastPaymentDate: new Date(2022, 2, 1), //simulando sem alteração de data de pagamento
    });
    })

    it('simulação caso parametro balanço venha nulo', async()=>{ 
    const investment = {
      id: 1,
      amount: 500,
      balance: null,
      createdAt: new Date(2022, 0, 1),
      lastPaymentDate: new Date(2022, 2, 1), 
    };

    const result = await investmentService.calculateGain(investment);

  
    expect(result).toEqual({
      id: 1,
      amount: 500,
      balance: 760, 
      createdAt: new Date(2022, 0, 1),
      lastPaymentDate: new Date(2022, 2, 1),
    });
    })
  })

  
//função de calcular taxas
  xdescribe('calculo de taxas',()=>{
    it('coeficiente de taxa de 0.15',async()=>{
      const actualDate = new Date()
      
      const investment = {
        amount: 1000,
        balance: 1200,
        createdAt: new Date(2019, 0, 1), // maior que 2 years
      };
      console.log(actualDate.getFullYear() - investment.createdAt.getFullYear())
      const result = await investmentService.calculateTax(investment);
  
      expect(result).toBeCloseTo(30, 2); 
    })

    it('coeficiente de taxa de 0.185',async()=>{
      const actualDate = new Date()
      
      const investment = {
        amount: 1000,
        balance: 1200,
        createdAt: new Date(2022, 0, 1), // maior que 1 ano
      };
      console.log(actualDate.getFullYear() - investment.createdAt.getFullYear())
      const result = await investmentService.calculateTax(investment);

      expect(result).toBeCloseTo(37, 2); 
    })
    it('coeficiente de taxa de 0.225',async()=>{
      const actualDate = new Date()
      
      const investment = {
        amount: 1000,
        balance: 1200,
        createdAt: new Date(2024, 0, 1), // menor que 1 ano
      };
      console.log(actualDate.getFullYear() - investment.createdAt.getFullYear()<=1)
      const result = await investmentService.calculateTax(investment);
  
      expect(result).toBeCloseTo(45, 2); 
    })
  })


  //Withdrawal
  describe('Casos de teste da Rota de saque',()=>{
    it('sem saldo para saque',async()=>{
      const investment = {
        id:1,
        owner:'any',
        name:'any',
        amount: 0,
        balance: 200,
        createdAt: new Date(2019, 0, 1),
        lastPaymentDate: new Date(2019, 0, 1),
      };
    jest.spyOn(InvestmentService.prototype, 'findOne').mockResolvedValueOnce(investment);

    const result = await investmentService.withdrawal(1);

    expect(result).toBe('Saldo Insuficiente!');

    jest.restoreAllMocks();
    })
    it('com saldo para saque taxa 0.15',async()=>{
        const investment = {
          id:1,
          owner:'any',
          name:'any',
          amount: 200,
          balance: 400,
          createdAt: new Date(2019, 0, 1),
          lastPaymentDate: new Date(2019, 0, 1),
        };
      jest.spyOn(InvestmentService.prototype, 'findOne').mockResolvedValueOnce(investment);
  
      const result = await investmentService.withdrawal(1);
  
      expect(result).toBe(`O valor sacado foi dê: ${370} foram descontados: ${30} em taxas `);
  
      jest.restoreAllMocks();
    })
    it('com saldo para saque taxa 0.185',async()=>{
      const investment = {
        id:1,
        owner:'any',
        name:'any',
        amount: 200,
        balance: 400,
        createdAt: new Date(2022, 0, 1),
        lastPaymentDate: new Date(2019, 0, 1),
      };
    jest.spyOn(InvestmentService.prototype, 'findOne').mockResolvedValueOnce(investment);

    const result = await investmentService.withdrawal(1);

    expect(result).toBe(`O valor sacado foi dê: ${363} foram descontados: ${37} em taxas `);

    jest.restoreAllMocks();
    })
    it('com saldo para saque taxa 0.225',async()=>{
      const investment = {
        id:1,
        owner:'any',
        name:'any',
        amount: 200,
        balance: 400,
        createdAt: new Date(2024, 0, 1),
        lastPaymentDate: new Date(2019, 0, 1),
      };
    jest.spyOn(InvestmentService.prototype, 'findOne').mockResolvedValueOnce(investment);

    const result = await investmentService.withdrawal(1);

    expect(result).toBe(`O valor sacado foi dê: ${355} foram descontados: ${45} em taxas `);

    jest.restoreAllMocks();
    })
  })

});
