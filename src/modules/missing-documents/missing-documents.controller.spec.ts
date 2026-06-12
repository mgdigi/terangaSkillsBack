import { Test, TestingModule } from '@nestjs/testing';
import { MissingDocumentsController } from './missing-documents.controller';

describe('MissingDocumentsController', () => {
  let controller: MissingDocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissingDocumentsController],
    }).compile();

    controller = module.get<MissingDocumentsController>(MissingDocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
