import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldsService } from './fields.service';
import { FieldsController } from './fields.controller';
import { Field } from './entities/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Field])],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}
