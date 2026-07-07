import { Module } from '@nestjs/common';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { HttpModule} from '@nestjs/axios';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [HolidaysController],
  providers: [HolidaysService, PrismaService]
})
export class HolidaysModule {}
