import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional() // Nem kötelező megadni, lesz alapértelmezett értéke
  @Type(() => Number) // Az URL-ből jövő stringet számmá alakítja
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}