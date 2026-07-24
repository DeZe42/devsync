import { IsString, IsNotEmpty } from 'class-validator';

export class SyncPullRequestsDto {
  @IsString({ message: 'Az owner-nek szövegnek kell lennie!' })
  @IsNotEmpty({ message: 'Az owner megadása kötelező!' })
  owner!: string;

  @IsString({ message: 'A repo-nak szövegnek kell lennie!' })
  @IsNotEmpty({ message: 'A repo megadása kötelező!' })
  repo!: string;
}