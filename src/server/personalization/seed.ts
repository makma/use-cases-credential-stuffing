import { Product } from './database';
import { sequelize } from '../server';

export async function seedProducts() {
  await Promise.all([
    Product.create({
      price: 9,
      name: `Extra strong coffee`,
      image: '/personalization/img/extrastrong.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
    Product.create({
      price: 7,
      name: `Strong coffee`,
      image: '/personalization/img/strong.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
    Product.create({
      price: 6,
      name: `Smooth`,
      image: '/personalization/img/smooth.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
    Product.create({
      price: 8,
      name: `Decaffeinated coffee`,
      image: '/personalization/img/decaf.svg',
      tags: ['Big'],
      timestamp: new Date().getTime().toString(),
    }),
  ]);

  await sequelize.sync();
}
