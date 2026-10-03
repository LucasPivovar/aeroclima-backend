import { Global, Module } from '@nestjs/common';
import { TravelProvidersService } from './travel-providers.service.js';

@Global()
@Module({
  providers: [TravelProvidersService],
  exports: [TravelProvidersService],
})
export class IntegrationsModule {}
