import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { HolidaysController } from './modules/holidays/holidays.controller';
import { HolidaysService } from './modules/holidays/holidays.service';
import { HttpService } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HolidaysModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
