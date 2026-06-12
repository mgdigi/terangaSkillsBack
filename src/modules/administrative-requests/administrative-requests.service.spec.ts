import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativeRequestsService } from './administrative-requests.service';

describe('AdministrativeRequestsService', () => {
  let service: AdministrativeRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministrativeRequestsService],
    }).compile();

    service = module.get<AdministrativeRequestsService>(AdministrativeRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
