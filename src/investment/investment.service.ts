import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma-client/prisma-client.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvestmentService {
  constructor(private prisma:PrismaService){};

  async create(investment: Prisma.InvestmentCreateInput) {
    const res = await this.prisma.investment.create({ data: investment })


    return res;
  }
  // findAll() {
  //   return `This action returns all investment`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} investment`;
  // }

  // update(id: number, updateInvestmentDto: UpdateInvestmentDto) {
  //   return `This action updates a #${id} investment`;
  // }

  async remove(id: number) {
    return await this.prisma.investment.delete({ where: { id: Number(id) } });
  }
}
