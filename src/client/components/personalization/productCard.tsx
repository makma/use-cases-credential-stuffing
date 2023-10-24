import { FunctionComponent, useState } from 'react';
import { useDebounce } from 'react-use';
import { UserCartItem } from '../../../server/personalization/database';
import { useCart } from '../../api/personalization/use-cart';
import { usePersonalizationNotification } from '../../hooks/personalization/use-personalization-notification';
import { ButtonMinusSvg } from '../../img/buttonMinusSvg';
import { ButtonPlusSvg } from '../../img/buttonPlusSvg';
import Image from 'next/image';
import styles from './productCard.module.scss';
import Button from '../common/Button/Button';
import HeartIcon from '../../img/heart.svg';

type Product = {
  price: number;
  name: string;
  image: string;
  id: number;
};

const ItemCounter: FunctionComponent<{
  count: number;
  addItem: () => void;
  removeItem: () => void;
}> = ({ count, addItem, removeItem }) => {
  return (
    <div className={styles.productCardItemCounter}>
      <div onClick={removeItem}>
        <ButtonMinusSvg />
      </div>
      <span>{count}</span>
      <div onClick={addItem}>
        <ButtonPlusSvg />
      </div>
    </div>
  );
};

export const ProductCard: FunctionComponent<{ product: Product }> = ({ product }) => {
  const { addCartItemMutation, removeCartItemMutation, cartQuery } = useCart();
  const { showNotification } = usePersonalizationNotification();
  const [wasAdded, setWasAdded] = useState(false);

  const cartItem: UserCartItem | undefined = cartQuery.data?.data.find((item) => item.productId === product.id);

  const addToCart = async () => {
    await addCartItemMutation.mutateAsync({ productId: product.id });
    if (!cartItem) {
      showNotification('Product added to cart!');
    }
    setWasAdded(true);
  };

  const removeFromCart = async () => {
    await removeCartItemMutation.mutateAsync({ itemId: cartItem?.id });
  };

  useDebounce(
    () => {
      if (wasAdded) {
        setWasAdded(false);
      }
    },
    1000,
    [wasAdded],
  );

  return (
    <div className={styles.productCard}>
      <Image
        src={product.image}
        alt={product.name}
        sizes="100vw"
        width={250}
        height={172}
        className={styles.productCardImage}
      />
      <div className={styles.productCardBody}>
        <div>
          <div className={styles.productCardName}>{product.name}</div>
          <div className={styles.productCardSize}>Big</div>
        </div>
        <div className={styles.productCardBodyBottomRow}>
          <div className={styles.productCardPrice}>${product.price.toFixed(2)}</div>
          <div className={styles.productCardButtons}>
            {cartItem ? (
              <ItemCounter count={cartItem.count} addItem={addToCart} removeItem={removeFromCart} />
            ) : (
              <Button size="small" onClick={addToCart}>
                {addCartItemMutation.isLoading ? 'Adding...' : 'Add to cart'}
              </Button>
            )}

            <Button size="small" outlined disabled className={styles.addToFavorites}>
              <Image src={HeartIcon} alt="Add to favorites" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
