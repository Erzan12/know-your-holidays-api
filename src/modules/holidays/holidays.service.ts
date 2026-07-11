import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { HolidayResponse, OpenHolidaysSchoolResponse } from './types/holidays.interface';

@Injectable()
export class HolidaysService {
  constructor(
    private http: HttpService,
    private prisma: PrismaService,
  ) {}

  async getHolidays(country: string, year: number) {
    const cached = await this.prisma.holiday.findMany({
      where: { country, year },
      orderBy: { date: 'asc' },
    });

    if (cached.length > 0) return cached;

    // not cahced yet - fetch from Nager.Date
    const response = await firstValueFrom(
      this.http.get<HolidayResponse[]>(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`,
      ),
    );

    const records = response.data.map((h) => ({
      country,
      date: new Date(h.date),
      name: h.name,
      localName: h.localName,
      type: h.types?.[0] ?? 'Public',
      year,
    }));

    await this.prisma.holiday.createMany({
      data: records,
      skipDuplicates: true,
    });

    return this.prisma.holiday.findMany({
      where: { country, year },
      orderBy: { date: 'asc' },
    });
  }

  async getSchoolHolidays(country: string, year: number) {
    // check cache using the type discriminator
    const cached = await this.prisma.holiday.findMany({
      where: { country, year, type: 'SchoolHoliday' },
      orderBy: { date: 'asc' },
    });

    if (cached.length > 0) return cached;

    // build the precise boundary dates needed by OpenHolidays
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const response = await firstValueFrom(
      this.http.get<OpenHolidaysSchoolResponse[]>(
        `https://openholidaysapi.org/SchoolHolidays`, {
          params: {
            countryIsoCode: country.toUpperCase(),
            validFrom: startDate,
            validTo: endDate,
          }
        }
      ),
    );

    const records = response.data.map((h) => {
      // find english text or fallback gracefull to the first language entry found
      // const nameEn = h.name?.find((n) => n.language === 'en')?.text || h.name?.[0]?.text || 'School Break';
      const nameEn = h.name?.find((n) => n.language.toLowerCase() === 'en')?.text ?? h.name?.[0]?.text ?? 'School Break';
      // const nameLocal = h.name?.find((n) => n.language === country.toLowerCase())?.text || nameEn;
      const nameLocal = h.name?.find((n) => n.language.toLowerCase() === country.toLowerCase(),)?.text ?? nameEn;

      return {
        country,
        year,
        date: new Date(h.startDate), // cache the break start date
        name: nameEn,
        localName: nameLocal,
        type: 'SchoolHoliday', // key discriminator matching your frotnend Tabs
      };
    });

    if (records.length > 0) {
      await this.prisma.holiday.createMany({
        data: records,
        skipDuplicates: true,
      });
    }

    return this.prisma.holiday.findMany({
      where: { country, year, type: 'SchoolHoliday' },
      orderBy: { date: 'asc' },
    });
  }
}
