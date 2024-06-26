import supabase from '../createClient';
import { User, Product } from '../../../schema/schema';
import { fetchProductByID } from './product_queries';

/**
 * fetchUser is a function that fetches the user data from the database and returns the user object.
 * @returns a user object
 */
export async function fetchUser(): Promise<User> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Error fetching session: ${error.message}`);
  }

  if (!session) {
    throw new Error(`Session is null`);
  }

  const { user } = session;

  if (user !== null) {
    const { data, error: error1 } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();

    if (error1) {
      throw new Error(`Error fetching user: ${error1.message}`);
    }

    return data as User;
  }

  throw new Error('User is null');
}

/**
 * fetchUserByUUID is a function that fetches the user data from the database and returns the user object.
 * @param uuid: a string that is the user's uuid
 * @returns a user object
 */
export async function fetchUserByUUID(uuid: string) {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uuid)
      .single();

    if (error) {
      throw new Error(`Error fetching user data: ${error.message}`);
    }

    return user;
  } catch (error) {
    throw new Error(`Error`);
    throw error;
  }
}

/**
 * addOrRemoveProductFromFavorite is a function that adds or removes from the user's profiles -> fav_items column based on the state of the heart button.
 * @param product: product object to add/remove to user's favorites
 * @param isFav: a boolean tracking whether to remove an item from user's favorites
 */

export async function addOrRemoveProductFromFavorite(
  product: Product,
  isFav: boolean,
) {
  const user = await fetchUser();

  const favItems = user.fav_items;

  const productID = product.id;

  if (isFav) {
    favItems.push(productID);
  } else {
    const index = favItems.indexOf(productID);
    favItems.splice(index, 1);
  }

  await supabase
    .from('profiles')
    .update({ fav_items: favItems })
    .match({ id: user.id });
}

/**
 * arrayOfFavorites grabs the users favorite items from profiles->fav_items where each fav_item is being tracked by the product_id stored as a string and matches those product_id to the proper product object and stores the product object in an array.
 * @returns an array of product objects
 */

export async function arrayOfFavorites(): Promise<Product[]> {
  const user = await fetchUser();
  const favItems = user.fav_items;
  if (favItems.length === 0) {
    return [];
  }
  const arrayOfProducts = await Promise.all(
    favItems.map(item => fetchProductByID(item)),
  );

  return arrayOfProducts;
}

/**
 * fetchUserAddress: Get's a user's address based on their UUID
 * @param uuid: String containing the uuid of the user
 */
export async function fetchUserAddress(uuid: string) {
  try {
    const { data: user, error } = await supabase
      .from('address')
      .select('*')
      .eq('user_id', uuid)
      .single();

    if (error) {
      throw new Error(`Error fetching user data: ${error.message}`);
    }

    return user;
  } catch (error) {
    throw new Error(`Error:`);
  }
}

/**
 * fetchUserAddress: Get's a user's address based on their UUID
 * @param uuid: String containing the uuid of the user
 */
export async function fetchCurrentUserAddress() {
  try {
    const user = await fetchUser();
    const { data: address, error } = await supabase
      .from('address')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
    }
    return address;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
