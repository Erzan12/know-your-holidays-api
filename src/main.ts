import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin: 'http://localhost:3000', // your Next.js frontend
  //   methods: 'GET,POST',
  //   credentials: true,
  // });

  // await app.listen(3002, () => {
  //   console.log('Server is running at http://localhost:3002');
  // })

  await app.listen(3002, '0.0.0.0');
}
bootstrap();
