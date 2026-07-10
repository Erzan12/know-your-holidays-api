import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from 'src/config/prisma/prisma.service';

interface HolidayResponse {
  countryCode: string;
  date: string;
  localName: string;
  name: string;
  county: string | null;
  global: boolean;
  launchYear: number | null;
  types: string[];
}

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
}
