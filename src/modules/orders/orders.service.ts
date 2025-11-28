import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CustomException } from 'src/common/exceptions/customException';
import { Product } from '../products/entities/product.entity';
import { ShippingService } from '../shipping-methods/shipping-methods.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private shippingService: ShippingService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    customerId: number,
  ): Promise<Order> {
    const { orderItems, shippingMethodId } = createOrderDto;

    // 1. Verify products and calculate subtotal
    type VerifiedItem = { product: Product; quantity: number; price: number };
    const verifiedItems: VerifiedItem[] = [];
    let subtotal = 0;

    for (const item of orderItems) {
      const product = await this.productRepository.findOneBy({
        id: item.productId,
      });
      if (!product)
        throw new NotFoundException(
          `Product with id ${item.productId} not found`,
        );
      if (product.stock < item.quantity) throw new CustomException(1011);

      verifiedItems.push({
        product,
        quantity: item.quantity,
        price: +product.price,
      });
      subtotal += product.price * item.quantity;
    }

    // 2. Get shipping cost
    const shippingMethod =
      await this.shippingService.findById(shippingMethodId);
    const shippingCost = shippingMethod.price;
    const total = +subtotal + +shippingCost;

    // 3. Create order
    const order = this.orderRepository.create({
      customerId,
      status: 'pending',
      shippingMethodId,
      shippingCost,
      total,
    });
    const savedOrder = await this.orderRepository.save(order);

    // 4. Create order items and update stock
    for (const item of verifiedItems) {
      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);

      item.product.stock -= item.quantity;
      await this.productRepository.save(item.product);
    }

    // 5. Return with relations (FIXED)
    return this.orderRepository.findOneOrFail({
      where: { id: savedOrder.id },
      relations: ['orderItems', 'orderItems.product'],
    });
  }

  async findAllByUser(
    customerId: number,
  ): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({
      where: { customerId },
      relations: ['orderItems', 'orderItems.product', 'shippingMethod'], // Added shippingMethod here
    });

    return orders.map((order) => ({
      ...order,
      subTotal: order.orderItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.price),
        0,
      ),
    }));
  }

  async findOneByUser(
    id: number,
    customerId: number,
  ): Promise<Order & { subTotal: number }> {
    const order = await this.orderRepository.findOne({
      where: { id, customerId },
      relations: ['orderItems', 'orderItems.product', 'shippingMethod'],
    });
    if (!order) {
      throw new NotFoundException(
        `Order with id ${id} not found for this user`,
      );
    }
    let subTotal = order.orderItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.price),
      0,
    );
    return { ...order, subTotal };
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    userId: number,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, customerId: userId }, // Only own orders
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    await this.orderItemRepository.delete({ order: { id } });
    await this.orderRepository.delete(id);
  }

  // existing findOne method kept if needed, or remove if replaced by findOneByUser
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product', 'shippingMethod'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }
}
