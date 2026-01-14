import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Sport } from 'src/common/enums/enums';

@ApiTags('Fields')
@Controller('api/fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new field (Admin)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateFieldDto })
  @ApiCreatedResponse({ description: 'Field created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid field data' })
  create(@Body() dto: CreateFieldDto) {
    return this.fieldsService.create(dto);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Get()
  @ApiOperation({ summary: 'Get all fields with optional search' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search by name or location',
    example: 'football',
  })
  @ApiResponse({
    status: 200,
    description: 'List of fields',
    schema: {
      example: [
        {
          id: 'uuid',
          name: 'Central Park Field',
          sport: 'football',
          location: 'New York',
          pricePerHour: 50,
        },
      ],
    },
  })
  async findAll(
    @Query('sport') sport?: Sport,
    @Query('date') date?: string,
    @Query('q') q?: string,
    @Query('priceFrom') priceFrom?: string,
    @Query('priceTo') priceTo?: string,
    @Query('address') address?: string,
  ) {
    return this.fieldsService.findAll({
      sport,
      date,
      q,
      priceFrom: priceFrom ? parseInt(priceFrom) : undefined,
      priceTo: priceTo ? parseInt(priceTo) : undefined,
      address,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get field by ID' })
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Field details' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Patch(':id')
  @ApiOperation({ summary: 'Update field (Admin)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiBody({ type: UpdateFieldDto })
  @ApiResponse({ status: 200, description: 'Field updated successfully' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  update(@Param('id') id: string, @Body() dto: UpdateFieldDto) {
    return this.fieldsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete field (Admin)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Field deleted successfully' })
  @ApiResponse({ status: 404, description: 'Field not found' })
  remove(@Param('id') id: string) {
    return this.fieldsService.remove(id);
  }
}
