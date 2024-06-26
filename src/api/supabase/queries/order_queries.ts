/* eslint-disable no-console */
//

import {
  Order,
  OrderProduct,
  OrderStatus,
  Product,
} from '../../../schema/schema';
import { fetchUser } from './user_queries';
import { fetchProductByID } from './product_queries';
import supabase from '../createClient';

/**
 * Fetches all orders from the database.
 * @returns Promise<Order[]> - An array of Order objects.
 */
export async function getOrderById(orderId: number): Promise<Order> {
  const { data: order, error } = await supabase
    .from('order') // Update to the "Order" table
    .select('*')
    .eq('id', orderId)
    .single();
  if (error) {
    throw new Error(`Error fetching order: ${error.message}`);
  }
  return order;
}

/**
 * creates a new order for the user
 */
export async function createOrder() {
  const user = await fetchUser();

  const { data: order, error } = await supabase
    .from('order')
    .insert({ user_id: user.id })
    .select('*')
    .single();
  if (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }

  await supabase
    .from('profiles')
    .update({ cart_id: order.id })
    .match({ id: user.id });
}

/**
 * gets all orders by user id and sorted it by creation data
 * @param Order[] - An array of Order objects.
 * @returns Promise<Order[]> - An array of Order objects.
 */
function sortOrdersByCreated(orders: Order[]): Order[] {
  return orders.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/**
 * gets all orders by user id and sorted it by creation data
 * @param Order[] - An array of Order objects.
 * @returns Promise<Order[]> - An array of Order objects.
 */
export async function fetchOrdersByUser(): Promise<Order[]> {
  const user = await fetchUser();
  const userId = user.id;
  const { data, error } = await supabase
    .from('order')
    .select('*')
    .eq('user_id', userId)
    .neq('order_status', 'In Progress');

  if (error) {
    throw new Error(`Error fetching orders for user: ${error.message}`);
  }

  return data;
}

/**
 * gets all orders by user id and sorted it by creation data
 * @param Order[] - An array of Order objects.
 * @returns Promise<Order[]> - An array of Order objects.
 */
export async function fetchOrdersByUserIdSorted(): Promise<Order[]> {
  const orders = await fetchOrdersByUser();
  return sortOrdersByCreated(orders);
}

/**
 * gets all orders by user id and sorted it by creation data and get the first n orders
 * @param Order[] - An array of Order objects.
 * @returns Promise<Order[]> - An array of Order objects.
 */
export async function fetchNOrdersByUserIdSorted(n: number): Promise<Order[]> {
  const orders = await fetchOrdersByUser();
  return sortOrdersByCreated(orders).slice(0, n);
}

export async function fetchOrderIdsByUserIdSorted(): Promise<number[]> {
  const ordersProm = await fetchOrdersByUser();
  const orders = sortOrdersByCreated(ordersProm);
  return orders.map(order => order.id);
}

export async function fetchOrderProductById(
  productId: number,
): Promise<OrderProduct> {
  const { data: orderProduct, error } = await supabase
    .from('order_product')
    .select('*')
    .eq('id', productId)
    .single();
  if (error) {
    throw new Error(`Error fetching order product: ${error.message}`);
  }
  return orderProduct;
}

export async function fetchProductFromOrderProduct(
  orderProductId: number,
): Promise<Product> {
  const orderProduct = await fetchOrderProductById(orderProductId);
  const product = await fetchProductByID(orderProduct.product_id);
  return product;
}

export async function fetchProductsFromOrder(
  orderId: number,
): Promise<Product[]> {
  const order = await getOrderById(orderId);
  const products = order.order_product_id_array;

  const productPromises = products.map(async (productID: number) => {
    const product = await fetchProductFromOrderProduct(productID);
    return product;
  });
  const fetchedProducts = await Promise.all(productPromises);

  return fetchedProducts;
}

export async function fetchProductWithQuantityById(
  productId: number,
): Promise<Product> {
  const { data: orderProduct, error } = await supabase
    .from('product')
    .select('*')
    .eq('id', productId)
    .single();
  if (error) {
    throw new Error(`Error fetching order product: ${error.message}`);
  }
  return orderProduct;
}

export async function fetchOrderProductsbyOrderId(
  orderId: number,
): Promise<Product[]> {
  const order = await getOrderById(orderId);
  const orderProductIds = order.order_product_id_array;

  const newOrderProducts = await Promise.all(
    orderProductIds.map(orderProductId =>
      fetchOrderProductById(orderProductId),
    ),
  );

  const orderProducts = await Promise.all(
    newOrderProducts.map(async orderProduct =>
      fetchProductWithQuantityById(orderProduct.product_id),
    ),
  );

  return orderProducts;
}

/**
 * gets all orders by user id and sorted it by creation data
 * @param Order[] - An array of Order objects.
 * @returns Promise<Order[]> - An array of Order objects.
 */
export async function fetchCurrentOrdersByUser(): Promise<Order[]> {
  const user = await fetchUser();
  const userCartId = user.cart_id;
  const { data, error } = await supabase
    .from('order')
    .select('*')
    .eq('id', userCartId);

  if (error) {
    throw new Error(`Error fetching orders for user: ${error.message}`);
  }

  return data;
}

export async function fetchRecentOrderProducts(): Promise<OrderProduct[]> {
  const order = await fetchNOrdersByUserIdSorted(1);
  const orderProductIds = order[0].order_product_id_array;

  const orderProducts = await Promise.all(
    orderProductIds.map(async orderProductId => {
      try {
        const orderProduct = await fetchOrderProductById(orderProductId);
        return orderProduct;
      } catch (error) {
        throw new Error(`Error fetching order product array.`);
      }
    }),
  );

  return orderProducts;
}

export async function updateOrderPickupId(orderId: number, pickupId: number) {
  await supabase
    .from('order')
    .update({ pickup_time_id: pickupId })
    .eq('id', orderId);
}

export async function updateCartPickupId(pickupId: number) {
  const user = await fetchUser();
  const cartId = user.cart_id;
  await supabase
    .from('order')
    .update({ pickup_time_id: pickupId })
    .eq('id', cartId);
}

/* Update the status of an order */
export async function updateOrderStatus(
  orderId: number,
  orderStatus: OrderStatus,
) {
  await supabase
    .from('order')
    .update({ order_status: orderStatus })
    .eq('id', orderId);
}
/**
 * Gets user's most recent order
 * @returns Promise<Order> - The most recent Order object, or throws an error if no order is found.
 */
export async function fetchCartIdFromUserfetchMostRecentOrderByUser(): Promise<Order> {
  const user = await fetchUser();
  const userId = user.id;
  const { data, error } = await supabase
    .from('order')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }) // Order by creation date in descending order
    .limit(1); // Limit to only one order

  if (error) {
    throw new Error(
      `Error fetching most recent order for user: ${error.message}`,
    );
  }

  if (data.length === 0) {
    throw new Error('No orders found for the user.');
  }

  // Return the first order in the data array
  return data[0];
}
