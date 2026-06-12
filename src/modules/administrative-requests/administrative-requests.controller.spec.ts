import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativeRequestsController } from './administrative-requests.controller';

describe('AdministrativeRequestsController', () => {
  let controller: AdministrativeRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministrativeRequestsController],
    }).compile();

    controller = module.get<AdministrativeRequestsController>(AdministrativeRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
