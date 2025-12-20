import { Controller, Get, Post, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Controller('api/fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  create(@Body() dto: CreateFieldDto) {
    // you may later restrict this to admins if desired
    return this.fieldsService.create(dto);
  }

  @Get()
  findAll(@Query('q') q?: string) {
    return this.fieldsService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFieldDto) {
    return this.fieldsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldsService.remove(id);
  }
}
