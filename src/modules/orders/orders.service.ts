import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CustomException } from 'src/common/exceptions/customException';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, status, orderItems } = createOrderDto;
  
    // Verified items array type with product entity and quantity/price
    type VerifiedItem = {
      product: Product;
      quantity: number;
      price: number;
    };
    const verifiedItems: VerifiedItem[] = [];
  
    for (const item of orderItems) {
      const product = await this.productRepository.findOneBy({ id: item.productId });
      if (!product) {
        throw new NotFoundException(`Product with id ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new CustomException(1011); //${product.title}
      }
      verifiedItems.push({
        product,
        quantity: item.quantity,
        price: +product.price, // override client price with real price
      });
    }
  
    const order: Order = this.orderRepository.create({
      customerId,
      status,
    });
    await this.orderRepository.save(order);
  
    for (const item of verifiedItems) {
      const orderItem: OrderItem = this.orderItemRepository.create({
        order,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);
  
      // Decrement stock
      item.product.stock -= item.quantity;
      await this.productRepository.save(item.product);
    }
  
    order.orderItems = verifiedItems.map((item) => ({
      // Map to order item shape
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })) as OrderItem[];
  
    return order;
  }
  
  

  // Find all orders for a specific user(customerId)
  async findAllByUser(customerId: number): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({
      where: { customerId },
      relations: ['orderItems', 'orderItems.product'],
    });
  
    return orders.map(order => ({
      ...order,
      total: order.orderItems.reduce((sum, item) => sum + item.quantity * Number(item.price), 0),
    }));
  }
  

  // Find one order for a user by id, verifies order belongs to user
  async findOneByUser(id: number, customerId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, customerId },
      relations: ['orderItems', 'orderItems.product'],
    });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found for this user`);
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    // Consider updating order items if needed (complex logic)

    await this.orderRepository.save(order);
    return order;
  }

  async remove(id: number): Promise<void> {
    await this.orderItemRepository.delete({ order: { id } });
    await this.orderRepository.delete(id);
  }

  // existing findOne method kept if needed, or remove if replaced by findOneByUser
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }
}
