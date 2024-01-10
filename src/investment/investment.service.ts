import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client/prisma-client.service';
import { Prisma } from '@prisma/client';
import { Investment} from './entities/investment.entity';


@Injectable()
export class InvestmentService {
  constructor(private prisma:PrismaService){};

  async create(investment: Prisma.InvestmentCreateInput) {
    if(investment.amount<=0){
      
      return new HttpException("Valor Inválido", HttpStatus.BAD_REQUEST)
    }
    const actualDate = new Date()
    const oldDate = new Date(investment.createdAt)
    if(oldDate > actualDate ){
      return new HttpException("Data inválida: data do investimento precisa ser igual ou anterior a data atual", HttpStatus.BAD_REQUEST)
    }
    
    const createdInvestment = await this.prisma.investment.create({ data: investment })
    return createdInvestment;
  }
  
  // findAll(investment: Prisma.InvestmentCreateInput) {
  //   const actualDate = new Date()
  //   const oldDate = new Date(investment.createdAt)
  //   if(oldDate > actualDate ){
  //     console.log('quack')
  //     return new HttpException("Data inválida: data do investimento precisa ser igual ou anterior a data atual", HttpStatus.BAD_REQUEST)
  //   }
  //   return `This action returns all investment`;
  // }

  async findOne(id: number) {
    const res= await this.prisma.investment.findUnique({where:{id:id}})
    return res;
  }

  async findOneByName(owner: string) {
    const res = await this.prisma.investment.findMany({where:{owner:owner}})
    return res;
  }

  async calculateGain(investment:Investment){
    const {id,amount,balance,createdAt,lastPaymentDate} = investment
    const actualDate = new Date()
    let paymentDate
    if(amount == 0){
      return investment
    }

    //-----------------------------------------
    if(lastPaymentDate == null){
      paymentDate = createdAt
    }if(lastPaymentDate != null){
      paymentDate = lastPaymentDate
    } 
    
    const quota = 0.52
    let monthNumber
    if(actualDate.getFullYear() - paymentDate.getFullYear() == 1){
      monthNumber = actualDate.getMonth()+12
    }else{
      monthNumber = actualDate.getMonth()
    }
    console.log(actualDate.getDate())
    console.log(createdAt.getDate())
    if(monthNumber - paymentDate.getMonth() == 1 && actualDate.getDate() == createdAt.getDate()){
      const total = balance + (balance*quota)
      //Atualiza valor do balance e adiciona/atualiza data do ultimo pagamento feito.
      const investment = new Investment
      investment.amount = amount
      investment.balance = total
      investment.lastPaymentDate = actualDate 

      const updatedValue = await this.update(id,investment)
      return updatedValue
    }
    
    const expectedBalance = balance + (balance*quota)
    investment.balance = expectedBalance
    return investment
  }


  async view(id:number){
    const viewObjt = await this.findOne(id)
    const updatedInvestment = await this.calculateGain(viewObjt)
    return updatedInvestment;
  }

  async update(id: number, investment: Prisma.InvestmentUpdateInput) {
    
    const invest = await this.prisma.investment.update({
      where:{
        id: id
      },
      data:{
        owner:investment.owner,
        name:investment.name,
        balance:investment.balance,
        amount:investment.amount,
        createdAt:investment.createdAt,
        lastPaymentDate:investment.lastPaymentDate
      }
    })
    return invest;
  }

  async remove(id: number) {
    return await this.prisma.investment.delete({ where: {id} });
  }
  
  async whithdrawal(id:number){
    const object = await this.findOne(id)
    if(object.amount == 0){  
      return "Saldo Insuficiente!"
    }

    //----
      const gains = object.balance - object.amount
      const investment = new Investment
      investment.balance = gains
      investment.amount = 0
     await this.update(id,investment)
    //----
    const tax = await this.calculateTax(object)
    let value = object.balance - tax
    return `O valor sacado foi dê: ${value} foram descontados ${tax} em taxas `
  }

  async calculateTax(investment: Investment){
    const actualDate = new Date
    const {balance,amount,createdAt} = investment
    const gains = balance - amount
    let tax
    if(actualDate.getFullYear() - createdAt.getFullYear()>=2){
      tax = gains*0.15
    }else if(actualDate.getFullYear() - createdAt.getFullYear()>=1 ||actualDate.getFullYear() - createdAt.getFullYear()< 2 ){
      tax = gains*0.185
    }else(actualDate.getFullYear() - createdAt.getFullYear()<1 )
      tax = gains*0.225
    return tax;
  }

}


// Taxation
// When money is withdrawn, tax is triggered. Taxes apply only to the profit/gain portion of the money withdrawn. For example, if the initial investment was 1000.00, the current balance is 1200.00, then the taxes will be applied to the 200.00.

// The tax percentage changes according to the age of the investment:

// If it is less than one year old, the percentage will be 22.5% (tax = 45.00).
// If it is between one and two years old, the percentage will be 18.5% (tax = 37.00).
// If older than two years, the percentage will be 15% (tax = 30.00).
