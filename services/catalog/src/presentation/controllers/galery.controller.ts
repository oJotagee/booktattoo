import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FindGaleriesByUserUseCase } from '@/application/use-cases/galery/find-galeries-by-user.use-case';
import { UpdateGaleryImageUseCase } from '@/application/use-cases/galery/update-galery-image.use-case';
import { UpdateGaleryInfoUseCase } from '@/application/use-cases/galery/update-galery-info.use-case';
import { FindGaleryByIdUseCase } from '@/application/use-cases/galery/find-galery-by-id.use-case';
import { DeleteGaleryUseCase } from '@/application/use-cases/galery/delete-galery.use-case';
import { CreateGaleryUseCase } from '@/application/use-cases/galery/create-galery.use-case';
import { UpdateGaleryInfoRequestDto } from '../dtos/galery/update-galery-info.request.dto';
import { FilterGaleriesRequestDto } from '../dtos/galery/filter-galeries.request.dto';
import { CreateGaleryRequestDto } from '../dtos/galery/create-galery.request.dto';
import { UnsupportedGaleryImageTypeError } from '@/domain/errors/galery.error';
import {
  GaleryListResponseDto,
  GaleryResponseDto,
  GaleryUpdateImageResponseDto,
} from '../dtos/galery/galery.response.dto';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = /^image\/(jpeg|jpg|png|webp)$/;

const imageFilePipe = new ParseFilePipe({
  validators: [new MaxFileSizeValidator({ maxSize: MAX_IMAGE_SIZE_BYTES })],
});

@ApiTags('galeries')
@Controller('galeries')
export class GaleryController {
  constructor(
    private readonly createGalery: CreateGaleryUseCase,
    private readonly findGaleryById: FindGaleryByIdUseCase,
    private readonly findGaleriesByUser: FindGaleriesByUserUseCase,
    private readonly updateGaleryInfo: UpdateGaleryInfoUseCase,
    private readonly updateGaleryImage: UpdateGaleryImageUseCase,
    private readonly deleteGalery: DeleteGaleryUseCase,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GaleryListResponseDto })
  findMine(
    @TokenPayload() payload: SessionPayload,
    @Query() filter: FilterGaleriesRequestDto,
  ): Promise<GaleryListResponseDto> {
    return this.findGaleriesByUser.execute({
      userId: payload.sub,
      limit: filter.limit,
      offset: filter.offset,
      ...(filter.style && { style: filter.style }),
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GaleryResponseDto })
  findById(
    @Param('id') id: string,
    @TokenPayload() payload: SessionPayload,
  ): Promise<GaleryResponseDto> {
    return this.findGaleryById.execute({ id, userId: payload.sub });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateGaleryRequestDto })
  @ApiOkResponse({ type: GaleryResponseDto })
  create(
    @TokenPayload() payload: SessionPayload,
    @Body() body: CreateGaleryRequestDto,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
    @Headers('authorization') authorization: string,
  ): Promise<GaleryResponseDto> {
    this.assertImageType(file);

    return this.createGalery.execute({
      userId: payload.sub,
      authorization,
      serviceId: body.serviceId,
      title: body.title,
      size: body.size,
      price: body.price,
      style: body.style,
      image: {
        filename: file.originalname,
        contentType: file.mimetype,
        body: file.buffer,
      },
    });
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: GaleryResponseDto })
  update(
    @TokenPayload() payload: SessionPayload,
    @Param('id') id: string,
    @Body() body: UpdateGaleryInfoRequestDto,
  ): Promise<GaleryResponseDto> {
    return this.updateGaleryInfo.execute({ galeryId: id, userId: payload.sub, ...body });
  }

  @Put(':id/image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({ type: GaleryUpdateImageResponseDto })
  updateImage(
    @TokenPayload() payload: SessionPayload,
    @Param('id') id: string,
    @UploadedFile(imageFilePipe) file: Express.Multer.File,
  ): Promise<GaleryUpdateImageResponseDto> {
    this.assertImageType(file);

    return this.updateGaleryImage.execute({
      galeryId: id,
      userId: payload.sub,
      filename: file.originalname,
      contentType: file.mimetype,
      body: file.buffer,
    });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  delete(@Param('id') id: string, @TokenPayload() payload: SessionPayload): Promise<void> {
    return this.deleteGalery.execute({ id, userId: payload.sub });
  }

  private assertImageType(file: Express.Multer.File): void {
    if (!ALLOWED_IMAGE_MIME_TYPES.test(file.mimetype)) {
      throw new UnsupportedGaleryImageTypeError(file.mimetype);
    }
  }
}
