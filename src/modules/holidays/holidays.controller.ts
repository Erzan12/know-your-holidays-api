import { Controller, Get, Query } from '@nestjs/common';
import { HolidaysService } from './holidays.service';

@Controller('holidays')
export class HolidaysController {
  constructor(private holidayService: HolidaysService) {}

  @Get()
  getHolidays(
    @Query('country') country: string, 
    @Query('year') year: string
  ) {
    return this.holidayService.getHolidays(
      country.toUpperCase(),
      Number(year) || new Date().getFullYear(),
    );
  }

  // NEW ENDPOINT: get /holidays/school?country=PH&year=2026
  @Get('school')
  getSchoolHolidays(
    @Query('country') country: string,
    @Query('year') year: string,
  ){
    return this.holidayService.getSchoolHolidays(
      country.toUpperCase(),
      Number(year) || new Date().getFullYear(),
    );
  }
}
