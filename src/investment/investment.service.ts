import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-client/prisma-client.service';
import { Prisma } from '@prisma/client';


@Injectable()
export class InvestmentService {
  constructor(private prisma:PrismaService){};

  async create(investment: Prisma.InvestmentCreateInput) {
    if(investment.amount<0){
      const date = new Date()
      if(investment.createdAt < date){
        throw new HttpException("Data inválida: investimento precisa ser igual ou anterior atual", HttpStatus.BAD_REQUEST)
      }
      throw new HttpException("Valor inválido", HttpStatus.BAD_REQUEST)
    }
    const res = await this.prisma.investment.create({ data: investment })


    return res;
  }
  // findAll() {
  //   return `This action returns all investment`;
  // }

  async findOne(id: number) {
    const res= await this.prisma.investment.findUnique({where:{id:id}})
    return res;
  }

  async view(id:number){
    const invest = await this.findOne(+id)
    const quota= 0.52
    const initInvest = invest.amount
    const balance = initInvest + (initInvest*quota)
  }

  // update(id: number, updateInvestmentDto: UpdateInvestmentDto) {
  //   return `This action updates a #${id} investment`;
  // }

  async remove(id: number) {
    return await this.prisma.investment.delete({ where: { id: Number(id) } });
  }
}
