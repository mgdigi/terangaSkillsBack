import { PartialType } from '@nestjs/swagger';
import { CreateInvestmentProjectDto } from './create-investment-project.dto';

export class UpdateInvestmentProjectDto extends PartialType(
  CreateInvestmentProjectDto,
) {}
