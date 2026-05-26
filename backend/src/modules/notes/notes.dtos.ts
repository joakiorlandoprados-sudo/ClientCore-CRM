import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreateNoteDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;
}
