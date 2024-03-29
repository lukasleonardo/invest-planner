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
  async findAll(){
    return await this.prisma.investment.findMany()
  }

  async findOne(id: number) {
    const res= await this.prisma.investment.findUnique({
      where:{id}
    })
    return res;
  }

  async findByName(owner, page) {
    const limit = 10;
    let lastPage = 1;
    const qtdInv = await this.prisma.investment.count({where:{owner}})
    if(qtdInv !== 0 ){
      lastPage = Math.ceil(qtdInv/limit)   
    }else{
      return new HttpException('Nenhum Registro encontrado',HttpStatus.BAD_GATEWAY)
    }

    const res = await this.prisma.investment.findMany({
    
      where:{owner},
      orderBy:{id:'asc'},
      skip:Number(page*limit)-limit,
      take:limit,
    })
    let pagination = {
      path:'/investment',
      page,
      prev_page: Number(page)-Number(1) >= 1? Number(page)-Number(1):false ,
      next_page: Number(page)+Number(1) > lastPage ? false:Number(page)+Number(1),
      lastPage,
      qtdInv
    }
    return {res,pagination};
    
  }

  async calculateGain(investment:Investment){
    const {id,amount,balance,createdAt,lastPaymentDate} = investment
    const actualDate = new Date()
    let paymentDate,tempBalance
    const quota = 0.52
    //-----------------------------------------
    if(balance == null){
      tempBalance = amount
    }else{
      tempBalance = balance
    }


    if(lastPaymentDate == null){
      paymentDate = new Date(createdAt)
    }if(lastPaymentDate != null){
      paymentDate = new Date(lastPaymentDate)
    } 
    
    
    let monthNumber
    if(actualDate.getFullYear() - paymentDate.getFullYear() == 1){
      monthNumber = actualDate.getMonth()+12
    }else{
      monthNumber = actualDate.getMonth()
    }
  

    if(monthNumber - paymentDate.getMonth() == 1 && actualDate.getDate() == createdAt.getDate()){
      const total = tempBalance + (tempBalance*quota)
      //Atualiza valor do balance e adiciona/atualiza data do ultimo pagamento feito.
      const investment = new Investment
      investment.amount = amount
      investment.balance = total
      investment.lastPaymentDate = actualDate 

      const updatedValue = await this.update(id,investment)
      return updatedValue
    }
    
    const expectedBalance = tempBalance + (tempBalance*quota)
    investment.balance = expectedBalance
    // valor futuro, previsão de quanto será ganho. nada é persistido.
    return investment
  }


  async view(id:number){
    //Foi escolhido o retorno do objeto por inteiro nas view para a manipulação como necessaria dos dados
    const viewObjt = await this.findOne(id)
    if(viewObjt.amount == 0){ 
      return viewObjt
    }
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
  
  async withdrawal(id:number){
    const object = await this.findOne(id)
    if(object.amount == 0){  
      return "Saldo Insuficiente!"
    }

    //----
      const gains = object.balance - object.amount
      const investment = new Investment
      investment.balance = gains
      investment.amount = 0
      const tax = await this.calculateTax(object)
      let value = object.balance - tax
     await this.update(id,investment)
    //----
    return `O valor sacado foi dê: ${value} foram descontados: ${tax} em taxas `
  }

  async calculateTax(investment: Investment){
    const actualDate = new Date
    const {balance,amount,createdAt} = investment
    const gains = balance - amount
    let tax
    if(actualDate.getFullYear() - createdAt.getFullYear()> 2){
      tax = gains*0.15
    }else if(actualDate.getFullYear() - createdAt.getFullYear()>1 && actualDate.getFullYear() - createdAt.getFullYear()<= 2 ){
      tax = gains*0.185
    }else{tax = gains*0.225}
      
    return tax;
  }

}


// Taxation
// When money is withdrawn, tax is triggered. Taxes apply only to the profit/gain portion of the money withdrawn. For example, if the initial investment was 1000.00, the current balance is 1200.00, then the taxes will be applied to the 200.00.

// The tax percentage changes according to the age of the investment:

// If it is less than one year old, the percentage will be 22.5% (tax = 45.00).
// If it is between one and two years old, the percentage will be 18.5% (tax = 37.00).
// If older than two years, the percentage will be 15% (tax = 30.00).
