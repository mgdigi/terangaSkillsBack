import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentProjectsController } from './investment-projects.controller';

describe('InvestmentProjectsController', () => {
  let controller: InvestmentProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentProjectsController],
    }).compile();

    controller = module.get<InvestmentProjectsController>(InvestmentProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
