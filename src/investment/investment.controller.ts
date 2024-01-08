import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvestmentService } from './investment.service';

import { Prisma } from '@prisma/client';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async create(@Body() investment: Prisma.InvestmentCreateInput) {
    return this.investmentService.create(investment);
  }


  // @Get()
  // findAll() {
  //   return this.investmentService.findAll();
  // }

  @Get(':id')
  view(@Param('id') id: string) {
    return this.investmentService.view(+id);
  }
  
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateInvestmentDto: UpdateInvestmentDto) {
  //   return this.investmentService.update(+id, updateInvestmentDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentService.remove(+id);
  }
}
