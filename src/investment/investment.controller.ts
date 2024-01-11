import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { InvestmentService } from './investment.service';

import { Prisma } from '@prisma/client';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async create(@Body() investment: Prisma.InvestmentCreateInput) {
    return this.investmentService.create(investment);
  }


  // @Get('/test')
  // findAll(@Body() investment: Prisma.InvestmentCreateInput) {
  //   return this.investmentService.findAll(investment);
  // }

  @Get(':id')
  view(@Param('id') id: string) {
    return this.investmentService.view(+id);
  }
  @Post(':id')
  withdrawal(@Body('id') id: string) {
    return this.investmentService.withdrawal(+id);
  }

  @Get(':id')
  findOneByName(@Param('owner') owner: string) {
    return this.investmentService.findOneByName(owner);
  }
  
  @Put(':id')
  update(@Param('id') id: string, @Body() investment: Prisma.InvestmentUpdateInput) {
    return this.investmentService.update(+id, investment);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentService.remove(+id);
  }
}
