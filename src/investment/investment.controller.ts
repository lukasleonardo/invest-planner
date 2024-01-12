import { Controller, Get, Post, Body, Param, Delete, Put, Query, Req } from '@nestjs/common';
import { InvestmentService } from './investment.service';

import { Prisma } from '@prisma/client';

@Controller('investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  async create(@Body() investment: Prisma.InvestmentCreateInput) {
    return this.investmentService.create(investment);
  }

  @Get('list?:page')
  findByName(@Body('owner') owner:string, @Query('page')page=1) {
    return this.investmentService.findByName(owner,+page);
  }

  @Get('listAll')
  findAll(){
    return this.investmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string){
    return this.investmentService.findOne(+id);
  }

  @Get(':id')
  view(@Param('id') id: string) {
    return this.investmentService.view(+id);
  }
  @Post(':id')
  withdrawal(@Body('id') id: string) {
    return this.investmentService.withdrawal(+id);
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
