import { Test, TestingModule } from '@nestjs/testing';
import { MissingDocumentsService } from './missing-documents.service';

describe('MissingDocumentsService', () => {
  let service: MissingDocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MissingDocumentsService],
    }).compile();

    service = module.get<MissingDocumentsService>(MissingDocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
