import { DealStage } from "@prisma/client";
import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateDealDto {
  @IsString()
  title!: string;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsUUID()
  clientId!: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsISO8601()
  expectedCloseDate!: string;
}

export class UpdateDealDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsISO8601()
  expectedCloseDate?: string;
}

export class MoveDealStageDto {
  @IsEnum(DealStage)
  stage!: DealStage;
}
