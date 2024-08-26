import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthenticationDto } from './dto/create-authentication.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Authentication } from './entities/authentication.entity';
import { DataSource, Repository } from 'typeorm';
import { CustomUtils } from 'src/publicComponents/utils';
import { Constraint } from 'src/publicComponents/constraint';
import { ApiClient } from 'src/publicComponents/apiClient';

@Injectable()
export class AuthenticationService {

  constructor(
    @InjectRepository(Authentication) private aRepo : Repository<Authentication>,
    private readonly customUtils : CustomUtils,
    private readonly constraint : Constraint,
    private readonly apiClient : ApiClient,
    private dataSource: DataSource
  ){}

  create(createAuthenticationDto: CreateAuthenticationDto) {
    
    return 'This action adds a new authentication';
  }

  async sendAuthEmail(email : string) : Promise<boolean>{

    let res = false;

    const auth : Authentication = new Authentication();
    console.log(email); 

    if (!email || !this.constraint.isValidEmail(email)){
      throw new HttpException({
        errCode : 21,
        error : "email value is required"
      }, HttpStatus.BAD_REQUEST);
    }

    const prevAuth = await this.findByEmailAdmin(email);
    if (prevAuth && prevAuth.length >0 && (new Date().getTime() - prevAuth[0].CreateDate.getTime() < 120000)){
      throw new HttpException({
        errCode : 23,
        error : "identical email was enrolled, please try again in a few minutes"
      }, HttpStatus.TOO_MANY_REQUESTS);
    }

    auth.Email = email;
    // 6자리 수
    auth.AuthCode = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    auth.IsAuth = 0;

    // 디비에 인증번호랑 등록
    let saveRes = await this.aRepo.save(auth);
    console.log(saveRes);

    if (!saveRes.Email || !saveRes.AuthCode){
      throw new HttpException({
        errCode : 22,
        error : "authcode create error, please try again"
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 이메일 보내고 => 이건 안기다려도 될듯
    if (false){

    }    
    
    // 컨트롤러와 상관 없이 리턴값 생성
    // 결과 리턴
    res = true;
    return res;    

  }

  findAll() {
    return `This action returns all authentication`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  async findByEmailAdmin(email : string) : Promise<Authentication[]> {
    let res = this.aRepo.find({
      where : {
        Email : email,
      },
      order : {
        CreateDate : "DESC"
      }
    })
    return res;    
  }

  update(id: number, updateAuthenticationDto: UpdateAuthenticationDto) {
    return `This action updates a #${id} authentication`;
  }

  async checkAuthCode(authKey : string, authCode : string) : Promise<boolean> {
    let res = false;
    // 비교해서 5분 이내에 인증했으면 완료 아니면 실패
    const prevAuth = await this.findByEmailAdmin(authKey);
    console.log(authKey, authCode);
    console.log(prevAuth);
    for (const pA of prevAuth){
      if (pA.AuthCode == authCode && (new Date().getTime() - pA.CreateDate.getTime() < 300000)){
        const change = await this.aRepo.update({
          Email : authKey,
          AuthCode : authCode
        }, {
          IsAuth : 1,
          UpdateDate : this.customUtils.getUTCDate()
        });
        if (change.affected == 1){
          res = true;
        }        
        break;
      }
    }
    // 아니면 에러    
    return res;
  }

  remove(id: number) {
    return `This action removes a #${id} authentication`;
  }
}
