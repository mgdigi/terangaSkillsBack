import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentProjectsService } from './investment-projects.service';

describe('InvestmentProjectsService', () => {
  let service: InvestmentProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestmentProjectsService],
    }).compile();

    service = module.get<InvestmentProjectsService>(InvestmentProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
