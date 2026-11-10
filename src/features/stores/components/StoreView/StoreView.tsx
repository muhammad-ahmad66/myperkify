import Image from 'next/image';
import { BrandTile } from '@/components/ui/BrandTile';
import { StateMessage } from '@/components/ui/StateMessage';
import { Wrap } from '@/components/ui/Wrap';
import { DealCard } from '@/features/deals/components/DealCard';
import type { Store } from '../../types';
import styles from './StoreView.module.css';

/** Prices arrive already gated by the server, so locked viewers see the same cards as anywhere. */
export function StoreView({ store }: { store: Store }) {
  const photo = store.deals.find((deal) => deal.image)?.image;

  return (
    <main>
      <header className={styles.hero} style={{ background: store.color }}>
        {photo && <Image src={photo} alt="" fill priority sizes="100vw" className={styles.photo} />}
        <Wrap className={styles.heroInner}>
          <BrandTile initials={store.initials} color={store.color} size="lg" />
          <div>
            <h1>{store.name}</h1>
            {store.description && <p>{store.description}</p>}
          </div>
        </Wrap>
      </header>

      <Wrap className={styles.body}>
        <section aria-labelledby="store-deals">
          <h2 id="store-deals">Deals</h2>
          {store.deals.length === 0 ? (
            <StateMessage>This store has no live deals right now.</StateMessage>
          ) : (
            <div className={styles.grid}>
              {store.deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </section>

        {store.branches.length > 0 && (
          <section aria-labelledby="store-branches">
            <h2 id="store-branches">Branches</h2>
            <ul className={styles.branches}>
              {store.branches.map((branch) => (
                <li key={branch.id}>
                  <div>
                    <strong>{branch.name}</strong>
                    <span>{branch.address}</span>
                  </div>
                  <span className={branch.isOpen ? styles.open : styles.closed}>
                    {branch.statusLabel}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Wrap>
    </main>
  );
}
